import asyncio
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.date import DateTrigger

from src.config import SCRAPING_INTERVAL_HOURS, TELEGRAM_CHANNELS
from src.scrapers.telegram_scraper import TelegramScraper
from src.scrapers.insta_normaliser import InstagramScraper
from src.processing.normalizer import normalizer
from src.storage.database import (
    db_manager,
    Message as MessageModel,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("scraper.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


class ScrapingScheduler:
    """Scheduler for automated scraping and processing."""

    def __init__(self):
        self.scheduler = BlockingScheduler()
        self.telegram_scraper = TelegramScraper()
        self.instagram_scraper = InstagramScraper()
        self.setup_jobs()

    def setup_jobs(self):
        """Setup scheduled jobs."""
        # Weekly scraping job
        self.scheduler.add_job(
            func=self.run_scraping_pipeline,
            trigger=IntervalTrigger(hours=SCRAPING_INTERVAL_HOURS),
            id="weekly_scraping",
            name="Weekly Telegram Scraping",
            replace_existing=True,
        )

        # Daily processing job (normalize and vectorize)
        self.scheduler.add_job(
            func=self.run_processing_pipeline,
            trigger=IntervalTrigger(hours=24),
            id="daily_processing",
            name="Daily Content Processing",
            replace_existing=True,
        )

        logger.info("Scheduled jobs configured:")
        logger.info(f"- Weekly scraping every {SCRAPING_INTERVAL_HOURS} hours")
        logger.info("- Daily processing every 24 hours")

    def get_active_channels(self) -> list:
        """Get list of active channels to scrape."""
        # First, try to get channels from environment variable
        if TELEGRAM_CHANNELS:
            # Clean up channel names (remove @ and whitespace)
            channels = [
                ch.strip().lstrip("@") for ch in TELEGRAM_CHANNELS if ch.strip()
            ]
            if channels:
                return channels

        # Fallback to database channels
        session = db_manager.get_session()
        try:
            channels = session.query(ChannelModel).all()
            return [channel.username for channel in channels]
        finally:
            session.close()

    def run_processing_pipeline(self):
        """Run content processing pipeline (normalization and vectorization)."""
        logger.info("Starting content processing pipeline...")

        try:
            # Process messages
            processed_messages = normalizer.process_messages()
            logger.info(f"Processed {processed_messages} messages")

            # Process scraped content
            processed_content = normalizer.process_scraped_content()
            logger.info(f"Processed {processed_content} scraped content items")

            # Get processing stats
            stats = normalizer.get_processing_stats()
            logger.info(f"Processing stats: {stats}")

        except Exception as e:
            logger.error(f"Error in processing pipeline: {e}")

    def run_scraping_pipeline(self):
        """Run the complete scraping pipeline."""
        logger.info("Starting scraping pipeline...")

        try:
            # Run Telegram scraping synchronously (includes Instagram scraping)
            self._run_telegram_scraping_sync()

            logger.info("Scraping pipeline completed successfully")

        except Exception as e:
            logger.error(f"Error in scraping pipeline: {e}")

    def _run_telegram_scraping_sync(self):
        """Run Telegram scraping synchronously."""
        logger.info("Starting Telegram scraping...")

        channels = self.get_active_channels()
        if not channels:
            logger.warning("No channels configured for scraping")
            return

        logger.info(f"Scraping {len(channels)} channels: {channels}")

        # Scrape messages using the sync method
        messages = self.telegram_scraper.scrape(channel_usernames=channels)
        logger.info(f"Scraped {len(messages)} messages")

        # Store messages in database and process Instagram URLs
        stored_count = 0
        for m in messages:
            # Store each message in database
            instagram_urls = []
            links = m["links"]

            for link in links:
                if "instagram.com/p/" in link or "instagram.com/reel/" in link:
                    instagram_urls.append({"url": link, "message_id": m["message_id"]})

            if instagram_urls:
                try:
                    stored_count += self._scrape_instagram_from_messages(
                        instagram_urls, m
                    )
                except Exception as e:
                    logger.error(
                        f"Error processing Instagram URLs for message {m.get('message_id', 'unknown')}: {e}"
                    )
                    import traceback

                    logger.error(f"Full traceback: {traceback.format_exc()}")
            else:
                logger.info(
                    f"No Instagram URLs found in message {m.get('message_id', 'unknown')}"
                )
                stored_count += self.telegram_scraper.store_messages([m])

        logger.info(f"Stored {stored_count} new messages")

        # No need to update channel timestamps since we removed channels

    def _scrape_instagram_from_messages(self, instagram_urls, message):
        """Scrape Instagram URLs from provided message."""
        logger.info("Starting Instagram scraping...")

        # Scrape Instagram URLs
        stored_count = 0
        for item in instagram_urls:
            url = item["url"]
            message_id = item["message_id"]
            logger.info(f"Scraping Instagram URL: {url} (from message {message_id})")
            try:
                instagram_data = self.instagram_scraper.scrape_instagram_url(url)
                if instagram_data:
                    # Store as a new message with source="instagram"
                    stored_count += self.instagram_scraper.store_instagram_post(
                        instagram_data, message
                    )
                    logger.info(
                        f"Successfully stored Instagram post for {url} (message {message_id})"
                    )
                else:
                    logger.warning(
                        f"Failed to scrape Instagram URL: {url} (message {message_id})"
                    )
            except Exception as e:
                logger.error(
                    f"Error scraping Instagram URL {url} (message {message_id}): {e}"
                )
                import traceback

                logger.error(f"Full traceback: {traceback.format_exc()}")
        return stored_count

    def run_full_pipeline(self):
        """Run the complete pipeline (scraping + processing)."""
        logger.info("Starting full pipeline...")

        try:
            # Run scraping
            self.run_scraping_pipeline()

            logger.info("Full pipeline completed successfully")

        except Exception as e:
            logger.error(f"Error in full pipeline: {e}")

    def start_scheduler(self):
        """Start the scheduler."""
        logger.info("Starting scheduler...")
        try:
            self.scheduler.start()
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user")
        except Exception as e:
            logger.error(f"Scheduler error: {e}")

    def stop_scheduler(self):
        """Stop the scheduler."""
        logger.info("Stopping scheduler...")
        self.scheduler.shutdown()

    def run_once(self):
        """Run the pipeline once (for testing)."""
        logger.info("Running pipeline once...")
        self.run_full_pipeline()

    def get_next_run_times(self):
        """Get next scheduled run times."""
        jobs = self.scheduler.get_jobs()
        next_runs = {}

        for job in jobs:
            next_runs[job.name] = job.next_run_time

        return next_runs


# Global scheduler instance
scheduler = ScrapingScheduler()
