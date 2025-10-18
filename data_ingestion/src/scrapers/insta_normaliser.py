from __future__ import annotations

import json
import os
import sys
import time
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

try:
    # webdriver_manager automatically downloads the right chromedriver
    from webdriver_manager.chrome import ChromeDriverManager
except Exception:
    ChromeDriverManager = None  # type: ignore

from src.scrapers.base import BaseScraper
from src.storage.database import (
    db_manager,
    Message as MessageModel,
)


@dataclass
class InstagramPost:
    url: str
    caption: Optional[str] = None
    upload_date: Optional[str] = None
    author_username: Optional[str] = None
    author_name: Optional[str] = None
    image_urls: Optional[List[str]] = None
    video_urls: Optional[List[str]] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    comment_count: Optional[int] = None
    like_count: Optional[int] = None
    raw_ld_json: Optional[Dict[str, Any]] = None


def build_driver(headless: bool = True) -> webdriver.Chrome:
    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1366,850")
    options.add_argument("--disable-dev-shm-usage")
    # Reduce automation fingerprinting a bit
    options.add_argument("--disable-blink-features=AutomationControlled")

    # Use system chromedriver (simpler approach)
    service = ChromeService()

    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": """
        Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        """
        },
    )
    return driver


def login_if_needed(
    driver: webdriver.Chrome,
    wait: WebDriverWait,
    username: Optional[str],
    password: Optional[str],
) -> None:
    if not username or not password:
        return
    # If already logged in, Instagram will redirect away from /accounts/login/
    driver.get("https://www.instagram.com/accounts/login/")
    try:
        wait.until(EC.presence_of_element_located((By.NAME, "username")))
    except TimeoutException:
        # Possibly already logged in
        return

    user_input = driver.find_element(By.NAME, "username")
    pass_input = driver.find_element(By.NAME, "password")
    user_input.clear()
    user_input.send_keys(username)
    pass_input.clear()
    pass_input.send_keys(password)

    # Click login
    pass_input.submit()

    try:
        wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "nav[role='navigation']"))
        )
        # Small settle wait
        time.sleep(1.5)
    except TimeoutException:
        # Check for error message
        try:
            err = driver.find_element(By.ID, "slfErrorAlert").text
            raise RuntimeError(f"Login failed: {err}")
        except NoSuchElementException:
            raise RuntimeError("Login may have failed or took too long.")


def extract_json_ld(driver: webdriver.Chrome) -> Optional[Dict[str, Any]]:
    scripts = driver.find_elements(
        By.CSS_SELECTOR, 'script[type="application/ld+json"]'
    )
    for s in scripts:
        try:
            txt = s.get_attribute("innerText") or s.get_attribute("textContent")
            if not txt:
                continue
            data = json.loads(txt)
            # Some pages wrap LD in a list; pick the one with '@type': 'SocialMediaPosting' or 'ImageObject'/'VideoObject'
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get("@type") in {
                        "SocialMediaPosting",
                        "ImageObject",
                        "VideoObject",
                    }:
                        return item
                # Fallback to first dict
                for item in data:
                    if isinstance(item, dict):
                        return item
            elif isinstance(data, dict):
                return data
        except Exception:
            continue
    return None


def extract_og(driver: webdriver.Chrome) -> Dict[str, str]:
    kv: Dict[str, str] = {}
    metas = driver.find_elements(By.CSS_SELECTOR, "meta[property^='og:']")
    for m in metas:
        prop = m.get_attribute("property")
        content = m.get_attribute("content")
        if prop and content:
            kv[prop] = content
    return kv


def parse_counts_from_description(
    desc: Optional[str],
) -> (Optional[int], Optional[int]):
    if not desc:
        return None, None
    # Instagram og:description often looks like: "Caption text …\n\nSee more by @user" or sometimes includes likes.
    # We keep it simple and avoid brittle regex. Return None if not obvious.
    return None, None


def scrape_instagram_post(
    driver: webdriver.Chrome, post_url: str, need_login: bool = False
) -> InstagramPost:
    wait = WebDriverWait(driver, 20)

    if need_login:
        login_if_needed(
            driver, wait, os.getenv("IG_USERNAME"), os.getenv("IG_PASSWORD")
        )

    driver.get(post_url)
    # Wait for at least OG tags or the main article role
    try:
        wait.until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "meta[property='og:url']"))
            > 0
            or len(d.find_elements(By.CSS_SELECTOR, "article")) > 0
        )
    except TimeoutException:
        pass

    # If redirected to login page, raise to hint user to provide credentials
    if "accounts/login" in driver.current_url:
        raise RuntimeError(
            "Instagram redirected to login. Provide IG_USERNAME and IG_PASSWORD to access this post."
        )

    ld = extract_json_ld(driver)
    og = extract_og(driver)

    image_urls: List[str] = []
    video_urls: List[str] = []
    caption = None
    upload_date = None
    author_username = None
    author_name = None

    # From JSON-LD if available
    if ld:
        caption = ld.get("caption") or ld.get("description") or caption
        upload_date = ld.get("uploadDate") or ld.get("datePublished") or upload_date
        # Author can be dict or string
        author = ld.get("author")
        if isinstance(author, dict):
            author_name = author.get("name") or author_name
            # JSON-LD may not directly yield username; infer from URL if present
        if not author_name and isinstance(author, str):
            author_name = author
        # Images/videos can be a string or list
        imgs = ld.get("image")
        if isinstance(imgs, list):
            image_urls.extend([str(x) for x in imgs if isinstance(x, (str,))])
        elif isinstance(imgs, str):
            image_urls.append(imgs)
        vids = ld.get("video")
        if isinstance(vids, list):
            for v in vids:
                if isinstance(v, dict) and v.get("contentUrl"):
                    video_urls.append(v["contentUrl"])
                elif isinstance(v, str):
                    video_urls.append(v)
        elif isinstance(vids, dict) and vids.get("contentUrl"):
            video_urls.append(vids["contentUrl"])
        elif isinstance(vids, str):
            video_urls.append(vids)

    # From OpenGraph
    og_title = og.get("og:title")
    og_description = og.get("og:description")
    if not image_urls:
        if og.get("og:image:secure_url"):
            image_urls.append(og["og:image:secure_url"])
        elif og.get("og:image"):
            image_urls.append(og["og:image"])
    if not video_urls:
        if og.get("og:video:secure_url"):
            video_urls.append(og["og:video:secure_url"])
        elif og.get("og:video"):
            video_urls.append(og["og:video"])

    # Author username from canonical URL pattern: https://www.instagram.com/p/<shortcode>/
    # Sometimes present in og:title like "username on Instagram: \"Caption…\""
    if not author_username and og_title:
        # A crude parse: split by " on Instagram" or take first word before ":"
        if " on Instagram" in og_title:
            author_username = og_title.split(" on Instagram")[0].strip()
        elif ":" in og_title:
            author_username = og_title.split(":", 1)[0].strip()

    like_count, comment_count = parse_counts_from_description(og_description)

    post = InstagramPost(
        url=post_url,
        caption=caption,
        upload_date=upload_date,
        author_username=author_username,
        author_name=author_name,
        image_urls=image_urls or None,
        video_urls=video_urls or None,
        og_title=og_title,
        og_description=og_description,
        like_count=like_count,
        comment_count=comment_count,
        raw_ld_json=ld,
    )
    return post


class InstagramScraper(BaseScraper):
    """Instagram post scraper using Selenium."""

    def __init__(self):
        super().__init__("instagram")
        self.driver = None

    def _initialize_driver(self, headless=True):
        """Initialize Chrome driver."""
        if self.driver is None:
            self.driver = build_driver(headless=headless)

    def scrape_instagram_url(
        self, url: str, need_login: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Scrape a single Instagram post URL.

        Args:
            url: Instagram post URL
            need_login: Whether login is required

        Returns:
            Dict[str, Any]: Scraped Instagram post data or None if failed
        """
        try:
            self._initialize_driver(headless=True)
            post = scrape_instagram_post(self.driver, url, need_login=need_login)

            # Convert to dictionary format
            return {
                "url": post.url,
                "caption": post.caption,
                "upload_date": post.upload_date,
                "author_username": post.author_username,
                "author_name": post.author_name,
                "image_urls": post.image_urls,
                "video_urls": post.video_urls,
                "og_title": post.og_title,
                "og_description": post.og_description,
                "like_count": post.like_count,
                "comment_count": post.comment_count,
                "scraped_at": time.time(),
            }

        except Exception as e:
            print(f"Error scraping Instagram URL {url}: {e}")
            return None

    def scrape(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Main scraping method for Instagram URLs.

        Args:
            urls: List of Instagram URLs to scrape

        Returns:
            List[Dict[str, Any]]: List of scraped Instagram posts
        """
        urls = kwargs.get("urls", [])
        scraped_posts = []

        for url in urls:
            print(f"Scraping Instagram URL: {url}")
            post_data = self.scrape_instagram_url(url)
            if post_data:
                scraped_posts.append(post_data)

            # Rate limiting
            time.sleep(2)

        return scraped_posts

    def validate(self, data: Dict[str, Any]) -> bool:
        """Validate scraped Instagram post data."""
        required_fields = ["url", "caption"]
        return all(field in data for field in required_fields) and data.get("caption")

    def store_instagram_post(
        self, instagram_data: Dict[str, Any], original_message: Dict[str, Any]
    ) -> int:
        """
        Store Instagram post data as a message in the database using universal store method.

        Args:
            instagram_data: Instagram post data
            original_message: Original Telegram message that contained the link

        Returns:
            int: Number of posts stored
        """
        # Create Instagram post content
        content = instagram_data.get("caption") or ""
        og_description = instagram_data.get("og_description")
        if og_description:
            content += f"\n\n{og_description}"

        # Prepare message data for universal store method
        message_data = {
            "channel_username": original_message["channel_username"],
            "message_id": f"instagram_{instagram_data.get('url', '').split('/')[-2]}",  # Use Instagram post ID
            "text": content,
            "links": [instagram_data.get("url", "")],
            "date": datetime.utcnow(),
            "has_links": False,  # Instagram posts don't have additional links
        }

        # Use universal store method
        stored_message = db_manager.store_message(message_data, source="instagram")
        if stored_message:
            print(f"Stored Instagram post: {instagram_data.get('url', '')}")
            return 1
        else:
            print(f"Failed to store Instagram post: {instagram_data.get('url', '')}")
            return 0

    def close(self):
        """Close the driver."""
        if self.driver:
            self.driver.quit()
            self.driver = None


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python selenium_instagram_post_scraper.py <instagram_post_url> [--no-headless] [--login]"
        )
        sys.exit(1)

    post_url = sys.argv[1]
    headless = True
    need_login = False
    if "--no-headless" in sys.argv:
        headless = False
    if "--login" in sys.argv:
        need_login = True

    driver = build_driver(headless=headless)
    try:
        post = scrape_instagram_post(driver, post_url, need_login=need_login)
        print(json.dumps(asdict(post), indent=2, ensure_ascii=False))
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
