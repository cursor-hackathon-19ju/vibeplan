import re
import asyncio
import random
import traceback
from typing import List, Dict, Any, Optional
from telethon import TelegramClient
from telethon.tl.types import Channel, Chat
from telethon.errors import FloodWaitError, ChannelPrivateError
from datetime import datetime, timedelta
import time
import concurrent.futures
from functools import partial

from src.scrapers.base import BaseScraper
from src.storage.database import (
    db_manager,
    Message as MessageModel,
)
from src.config import (
    TELEGRAM_API_ID,
    TELEGRAM_API_HASH,
    TELEGRAM_PHONE,
    MAX_MESSAGES_PER_CHANNEL,
)


class TelegramScraper(BaseScraper):
    """Telegram channel scraper using Telethon."""

    def __init__(self):
        super().__init__("telegram")
        self.client = None
        self.session_name = "telegram_session"
        # Parallelization settings
        self.max_concurrent_channels = 5
        self.max_link_workers = 15
        self.max_batch_link_workers = 20

    async def _initialize_client(self):
        """Initialize Telegram client."""
        if self.client is None:
            self.client = TelegramClient(
                self.session_name, TELEGRAM_API_ID, TELEGRAM_API_HASH
            )
            await self.client.start(phone=TELEGRAM_PHONE)

    async def _get_channel_entity(self, username: str):
        """Get channel entity by username."""
        await self._initialize_client()
        try:
            entity = await self.client.get_entity(username)
            return entity
        except Exception as e:
            print(f"Error getting channel {username}: {e}")
            return None

    def _extract_links(self, text: str) -> List[str]:
        """Extract URLs from text using regex."""
        if not text:
            return []

        # URL regex pattern - matches both full URLs and short URLs
        url_pattern = r"(?:https?://)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?:/[^\s]*)?"
        urls = re.findall(url_pattern, text)

        # Filter to only include valid URLs (with at least a domain)
        valid_urls = []
        for url in urls:
            # Clean up the URL - remove trailing punctuation
            url = url.rstrip(".,;:!?)")

            # Add protocol if missing
            if not url.startswith(("http://", "https://")):
                url = "https://" + url
            # Basic validation - must have a dot (domain)
            if "." in url and len(url) > 10:
                valid_urls.append(url)

        return valid_urls

    def _expand_shortened_url(self, url: str) -> str:
        """Expand shortened URLs to get the full destination URL."""
        try:
            import requests

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            # Make a HEAD request to get the final URL without downloading content
            response = requests.head(
                url, headers=headers, timeout=10, allow_redirects=True
            )
            return response.url
        except Exception as e:
            print(f"Error expanding URL {url}: {e}")
            return url  # Return original URL if expansion fails

    def _expand_links(self, links: List[str]) -> List[str]:
        """Expand shortened URLs in a list of links."""
        expanded_links = []
        for link in links:
            # Check if URL is likely shortened
            if self._is_shortened_url(link):
                print(f"Expanding shortened URL: {link}")
                expanded_link = self._expand_shortened_url(link)
                expanded_links.append(expanded_link)
                print(f"Expanded to: {expanded_link}")
            else:
                expanded_links.append(link)
        return expanded_links

    def _expand_links_parallel(
        self, links: List[str], max_workers: int = None
    ) -> List[str]:
        """Expand shortened URLs in parallel using ThreadPoolExecutor."""
        if not links:
            return []

        if max_workers is None:
            max_workers = self.max_link_workers

        # Separate shortened and regular URLs
        shortened_links = []
        regular_links = []

        for link in links:
            if self._is_shortened_url(link):
                shortened_links.append(link)
            else:
                regular_links.append(link)

        if not shortened_links:
            return links

        print(f"Expanding {len(shortened_links)} shortened URLs in parallel...")

        # Use ThreadPoolExecutor for parallel URL expansion
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all expansion tasks
            future_to_link = {
                executor.submit(self._expand_shortened_url, link): link
                for link in shortened_links
            }

            # Collect results
            expanded_shortened = []
            for future in concurrent.futures.as_completed(future_to_link):
                original_link = future_to_link[future]
                try:
                    expanded_link = future.result()
                    expanded_shortened.append(expanded_link)
                    print(f"Expanded: {original_link} -> {expanded_link}")
                except Exception as e:
                    print(f"Error expanding {original_link}: {e}")
                    # Keep original link if expansion fails
                    expanded_shortened.append(original_link)

        # Combine regular links and expanded shortened links
        return regular_links + expanded_shortened

    def _expand_links_batch_parallel(
        self, messages: List[Dict[str, Any]], max_workers: int = None
    ) -> List[Dict[str, Any]]:
        """
        Expand links for multiple messages in parallel.

        Args:
            messages: List of message dictionaries with 'links' field
            max_workers: Maximum number of worker threads

        Returns:
            List[Dict[str, Any]]: Messages with expanded links
        """
        if not messages:
            return messages

        if max_workers is None:
            max_workers = self.max_batch_link_workers

        # Collect all unique links that need expansion
        all_links = []
        link_to_messages = {}  # Track which messages contain each link

        for i, message in enumerate(messages):
            if message.get("links"):
                for link in message["links"]:
                    if self._is_shortened_url(link):
                        if link not in all_links:
                            all_links.append(link)
                        if link not in link_to_messages:
                            link_to_messages[link] = []
                        link_to_messages[link].append(i)

        if not all_links:
            print("No shortened URLs found to expand")
            return messages

        print(f"Expanding {len(all_links)} unique shortened URLs in parallel...")

        # Expand all unique links in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all expansion tasks
            future_to_link = {
                executor.submit(self._expand_shortened_url, link): link
                for link in all_links
            }

            # Collect results
            link_expansions = {}
            for future in concurrent.futures.as_completed(future_to_link):
                original_link = future_to_link[future]
                try:
                    expanded_link = future.result()
                    link_expansions[original_link] = expanded_link
                    print(f"Expanded: {original_link} -> {expanded_link}")
                except Exception as e:
                    print(f"Error expanding {original_link}: {e}")
                    # Keep original link if expansion fails
                    link_expansions[original_link] = original_link

        # Update messages with expanded links
        for message in messages:
            if message.get("links"):
                expanded_links = []
                for link in message["links"]:
                    if self._is_shortened_url(link):
                        expanded_links.append(link_expansions.get(link, link))
                    else:
                        expanded_links.append(link)
                message["links"] = expanded_links

        print(f"Completed parallel link expansion for {len(messages)} messages")
        return messages

    def _is_shortened_url(self, url: str) -> bool:
        """Check if URL is likely a shortened URL."""
        from urllib.parse import urlparse

        shortened_domains = [
            "bit.ly",
            "t.co",
            "tinyurl.com",
            "short.link",
            "is.gd",
            "v.gd",
            "ow.ly",
            "buff.ly",
            "rebrand.ly",
            "shorturl.at",
            "cutt.ly",
            "tiny.cc",
            "short.to",
            "shrtco.de",
            "short.link",
            "rb.gy",
        ]
        domain = urlparse(url).netloc.lower()
        return any(short_domain in domain for short_domain in shortened_domains)

    async def safe_get_messages(self, client, channel_entity, limit=50):
        """Safely get messages with retry logic and error handling."""
        max_retries = 3
        backoff_sleep = 1

        for attempt in range(max_retries):
            try:
                messages = []
                # Fetch more messages than needed to account for empty messages
                fetch_limit = limit * 2  # Fetch 2x to account for empty messages
                async for message in client.iter_messages(
                    channel_entity, limit=fetch_limit
                ):
                    if message.text and len(messages) < limit:
                        messages.append(message)
                    # Stop if we have enough messages
                    if len(messages) >= limit:
                        break
                return messages
            except FloodWaitError as e:
                print(f"Rate limited. Waiting {e.seconds} seconds...")
                await asyncio.sleep(e.seconds)
            except Exception as e:
                print(f"Error fetching messages (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(backoff_sleep * (2**attempt))
                else:
                    raise
        return []

    async def scrape_channel_batch(
        self, username: str, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Scrape messages from a Telegram channel with robust error handling.

        Args:
            username: Channel username (without @)
            limit: Maximum number of messages to scrape

        Returns:
            List[Dict[str, Any]]: List of scraped messages
        """
        limit = 100
        await self._initialize_client()
        entity = await self._get_channel_entity(username)

        if not entity:
            return []
        print(limit)
        print(f"Scraping channel: {username}")
        messages = await self.safe_get_messages(self.client, entity, limit)

        processed_messages = []
        for message in messages:
            links = self._extract_links(message.text)
            # Expand shortened URLs in parallel
            if links:
                links = self._expand_links_parallel(links)

            message_data = {
                "message_id": message.id,
                "text": message.text,
                "date": message.date,
                "has_links": len(links) > 0,
                "links": links,
                "channel_username": username,
            }
            processed_messages.append(message_data)

        print(f"Scraped {len(processed_messages)} messages from {username}")
        return processed_messages

    async def scrape_channels_parallel(
        self, channel_usernames: List[str], limit: int = 100, max_concurrent: int = None
    ) -> List[Dict[str, Any]]:
        """
        Scrape multiple channels in parallel using asyncio.

        Args:
            channel_usernames: List of channel usernames to scrape
            limit: Maximum messages per channel
            max_concurrent: Maximum number of concurrent channel scrapes

        Returns:
            List[Dict[str, Any]]: List of all scraped messages
        """
        await self._initialize_client()

        if max_concurrent is None:
            max_concurrent = self.max_concurrent_channels

        # Create semaphore to limit concurrent operations
        semaphore = asyncio.Semaphore(max_concurrent)

        async def scrape_single_channel(username: str) -> List[Dict[str, Any]]:
            """Scrape a single channel with semaphore control."""
            async with semaphore:
                try:
                    print(f"Starting parallel scrape of {username}")
                    messages = await self.scrape_channel_batch(username, limit)
                    print(
                        f"Completed parallel scrape of {username}: {len(messages)} messages"
                    )
                    return messages
                except Exception as e:
                    print(f"Error scraping channel {username}: {e}")
                    traceback.print_exc()
                    return []

        # Create tasks for all channels
        tasks = [scrape_single_channel(username) for username in channel_usernames]

        # Wait for all tasks to complete
        print(f"Starting parallel scraping of {len(channel_usernames)} channels...")
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Flatten results and filter out exceptions
        all_messages = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"Channel {channel_usernames[i]} failed: {result}")
            else:
                all_messages.extend(result)

        print(f"Parallel scraping completed: {len(all_messages)} total messages")

        # Expand links in batch for all messages
        if all_messages:
            print("Expanding links in batch for all messages...")
            all_messages = self._expand_links_batch_parallel(all_messages)

        return all_messages

    def scrape(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Main scraping method with robust async handling and parallelization.

        Args:
            channel_usernames: List of channel usernames to scrape
            limit: Maximum messages per channel
            use_parallel: Whether to use parallel channel scraping (default: True)
            max_concurrent: Maximum concurrent channels (default: 3)

        Returns:
            List[Dict[str, Any]]: List of scraped messages
        """
        channel_usernames = kwargs.get("channel_usernames", [])
        limit = kwargs.get("limit", MAX_MESSAGES_PER_CHANNEL)
        use_parallel = kwargs.get("use_parallel", True)
        max_concurrent = kwargs.get("max_concurrent", 3)

        # Use a new event loop in a separate thread to avoid conflicts
        import threading
        import queue

        result_queue = queue.Queue()

        def run_async_scraping():
            async def scrape_all_channels():
                if use_parallel and len(channel_usernames) > 1:
                    # Use parallel scraping for multiple channels
                    print(
                        f"Using parallel scraping for {len(channel_usernames)} channels"
                    )
                    return await self.scrape_channels_parallel(
                        channel_usernames, limit, max_concurrent
                    )
                else:
                    # Use sequential scraping for single channel or when parallel is disabled
                    print("Using sequential scraping")
                    all_messages = []
                    for username in channel_usernames:
                        try:
                            messages = await self.scrape_channel_batch(username, limit)
                            all_messages.extend(messages)
                        except Exception as e:
                            print(f"Error scraping channel {username}: {e}")
                            traceback.print_exc()
                            # Continue with other channels even if one fails
                            continue
                    return all_messages

            try:
                result = asyncio.run(scrape_all_channels())
                result_queue.put(("success", result))
            except Exception as e:
                result_queue.put(("error", e))

        # Run in a separate thread
        thread = threading.Thread(target=run_async_scraping)
        thread.start()
        thread.join()

        # Get result
        status, result = result_queue.get()
        if status == "error":
            raise result
        return result

    def validate(self, data: Dict[str, Any]) -> bool:
        """Validate scraped message data."""
        required_fields = ["message_id", "text", "date", "channel_username"]
        return all(field in data for field in required_fields)

    def store_messages(self, messages: List[Dict[str, Any]]) -> int:
        """
        Store scraped messages in database using universal store method.

        Args:
            messages: List of message data

        Returns:
            int: Number of messages stored
        """
        stored_count = 0

        for message_data in messages:
            stored_message = db_manager.store_message(message_data, source="telegram")
            if stored_message:
                stored_count += 1

        print(f"Stored {stored_count} new messages in database.")
        return stored_count

    def configure_parallelization(
        self,
        max_concurrent_channels: int = None,
        max_link_workers: int = None,
        max_batch_link_workers: int = None,
    ):
        """
        Configure parallelization settings.

        Args:
            max_concurrent_channels: Maximum concurrent channel scrapes
            max_link_workers: Maximum workers for individual link expansion
            max_batch_link_workers: Maximum workers for batch link expansion
        """
        if max_concurrent_channels is not None:
            self.max_concurrent_channels = max_concurrent_channels
        if max_link_workers is not None:
            self.max_link_workers = max_link_workers
        if max_batch_link_workers is not None:
            self.max_batch_link_workers = max_batch_link_workers

        print(f"Parallelization settings updated:")
        print(f"  - Max concurrent channels: {self.max_concurrent_channels}")
        print(f"  - Max link workers: {self.max_link_workers}")
        print(f"  - Max batch link workers: {self.max_batch_link_workers}")

    async def close(self):
        """Close Telegram client."""
        if self.client:
            await self.client.disconnect()
