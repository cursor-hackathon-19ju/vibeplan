#!/usr/bin/env python3
"""
Telegram Data Ingestion Service CLI

A scalable data ingestion service for scraping Telegram channels,
extracting links, scraping web content, and storing normalized vectors.
"""

import click
import asyncio
from datetime import datetime

from src.config import validate_config
from src.storage.database import db_manager
from src.scheduler import scheduler
from src.processing.normalizer import normalizer
from src.scrapers.telegram_scraper import TelegramScraper
from src.scrapers.insta_normaliser import InstagramScraper


@click.group()
def cli():
    """Telegram Data Ingestion Service"""
    pass


@cli.command()
def setup():
    """Initialize databases and Weaviate schema."""
    try:
        # Validate configuration
        validate_config()
        print("✓ Configuration validated")

        # Create database tables
        db_manager.create_tables()
        print("✓ Database tables created")

        print("\n🎉 Setup completed successfully!")
        print("\nNext steps:")
        print("1. Add channels: python main.py add-channel <username>")
        print("2. Test scraping: python main.py run-once")
        print("3. Start scheduler: python main.py start-scheduler")

    except Exception as e:
        print(f"❌ Setup failed: {e}")
        raise


@cli.command()
@click.argument("username")
def add_channel(username):
    """Add a Telegram channel to the scraping list."""
    try:
        session = db_manager.get_session()

        # Check if channel already exists
        existing = (
            session.query(db_manager.Channel).filter_by(username=username).first()
        )
        if existing:
            print(f"❌ Channel @{username} already exists")
            return

        # Add new channel
        channel = db_manager.Channel(name=username, username=username)
        session.add(channel)
        session.commit()

        print(f"✓ Added channel @{username}")

    except Exception as e:
        print(f"❌ Error adding channel: {e}")
    finally:
        session.close()


@cli.command()
def load_channels():
    """Load channels from TELEGRAM_CHANNELS environment variable."""
    try:
        from src.config import TELEGRAM_CHANNELS

        if not TELEGRAM_CHANNELS:
            print("❌ No channels found in TELEGRAM_CHANNELS environment variable")
            print(
                "Add channels to your .env file like: TELEGRAM_CHANNELS=channel1,channel2,channel3"
            )
            return

        session = db_manager.get_session()
        loaded_count = 0

        for channel_name in TELEGRAM_CHANNELS:
            channel_name = channel_name.strip().lstrip("@")
            if not channel_name:
                continue

            # Check if channel already exists
            existing = (
                session.query(db_manager.Channel)
                .filter_by(username=channel_name)
                .first()
            )
            if existing:
                print(f"⚠️  Channel @{channel_name} already exists")
                continue

            # Add new channel
            channel = db_manager.Channel(name=channel_name, username=channel_name)
            session.add(channel)
            loaded_count += 1
            print(f"✓ Loaded channel @{channel_name}")

        session.commit()
        print(f"\n🎉 Loaded {loaded_count} channels from environment")

    except Exception as e:
        print(f"❌ Error loading channels: {e}")
    finally:
        session.close()


@cli.command()
def list_channels():
    """List all configured channels."""
    try:
        session = db_manager.get_session()
        channels = session.query(db_manager.Channel).all()

        if not channels:
            print("No channels configured")
            return

        print(f"Configured channels ({len(channels)}):")
        for channel in channels:
            last_scraped = (
                channel.last_scraped.strftime("%Y-%m-%d %H:%M")
                if channel.last_scraped
                else "Never"
            )
            print(f"  • @{channel.username} (last scraped: {last_scraped})")

    except Exception as e:
        print(f"❌ Error listing channels: {e}")
    finally:
        session.close()


@cli.command()
def run_once():
    """Run the scraping pipeline once (for testing)."""
    try:
        print("🚀 Running scraping pipeline...")
        scheduler.run_full_pipeline()
        print("✓ Pipeline completed successfully")

    except Exception as e:
        print(f"❌ Pipeline failed: {e}")


@cli.command()
def start_scheduler():
    """Start the automated scheduler."""
    try:
        print("🕐 Starting scheduler...")
        print("Press Ctrl+C to stop")
        scheduler.start_scheduler()

    except KeyboardInterrupt:
        print("\n⏹️  Scheduler stopped")
    except Exception as e:
        print(f"❌ Scheduler error: {e}")


@cli.command()
@click.argument("query")
@click.option("--limit", default=10, help="Maximum number of results")
def search(query, limit):
    """Search the vector database for similar content."""
    try:
        print(f"🔍 Searching for: '{query}'")
        results = normalizer.search_similar_content(query, limit)

        if not results:
            print("No results found")
            return

        print(f"\nFound {len(results)} results:")
        for i, result in enumerate(results, 1):
            print(f"\n{i}. Source: {result.get('source', 'Unknown')}")
            print(f"   Normalized: {result.get('normalized_text', '')[:200]}...")
            if "metadata" in result:
                metadata = result["metadata"]
                if "url" in metadata:
                    print(f"   URL: {metadata['url']}")
                if "date" in metadata:
                    print(f"   Date: {metadata['date']}")

    except Exception as e:
        print(f"❌ Search failed: {e}")


@cli.command()
def stats():
    """Show processing statistics."""
    try:
        # Get database stats
        session = db_manager.get_session()

        total_channels = session.query(db_manager.Channel).count()
        total_messages = session.query(db_manager.Message).count()
        processed_messages = (
            session.query(db_manager.Message).filter_by(processed=True).count()
        )
        total_content = session.query(db_manager.ScrapedContent).count()

        print("📊 Processing Statistics:")
        print(f"  Channels: {total_channels}")
        print(f"  Messages: {total_messages} (processed: {processed_messages})")
        print(f"  Scraped Content: {total_content}")

        # Show next scheduled runs
        next_runs = scheduler.get_next_run_times()
        if next_runs:
            print(f"\n⏰ Next Scheduled Runs:")
            for job_name, next_run in next_runs.items():
                print(f"  {job_name}: {next_run}")

    except Exception as e:
        print(f"❌ Error getting stats: {e}")
    finally:
        session.close()


@cli.command()
def test_telegram():
    """Test Telegram connection and scraping."""
    try:
        print("🧪 Testing Telegram connection...")

        # Get first channel for testing
        session = db_manager.get_session()

        print(f"Testing with channel: @{channel.username}")

        # Test scraping
        telegram_scraper = TelegramScraper()
        messages = asyncio.run(
            telegram_scraper.scrape_channel(channel.username, limit=5)
        )

        print(f"✓ Successfully scraped {len(messages)} messages")
        for msg in messages[:2]:  # Show first 2 messages
            print(f"  • {msg['text'][:100]}...")

    except Exception as e:
        print(f"❌ Telegram test failed: {e}")
    finally:
        session.close()


@cli.command()
def test_normalization():
    """Test content normalization."""
    try:
        print("🧪 Testing content normalization...")

        test_content = "This is a test message with some important information about AI and machine learning."

        normalized = normalizer.normalize_content(test_content, "test")
        if normalized:
            print("✓ Normalization successful")
            print(f"  Original: {test_content}")
            print(f"  Normalized: {normalized}")
        else:
            print("❌ Normalization failed")

    except Exception as e:
        print(f"❌ Normalization test failed: {e}")


@cli.command()
@click.argument("url")
def test_instagram(url):
    """Test Instagram scraping with a specific URL."""
    try:
        print(f"🧪 Testing Instagram scraping for: {url}")

        instagram_scraper = InstagramScraper()

        result = instagram_scraper.scrape_instagram_url(url)
        if result:
            print("✓ Instagram scraping successful")
            print(f"  Caption: {result.get('caption', 'N/A')[:200]}...")
            print(f"  Author: {result.get('author_username', 'N/A')}")
            print(f"  Title: {result.get('og_title', 'N/A')}")
            print(f"  URL: {result.get('url', 'N/A')}")
        else:
            print("❌ Instagram scraping failed")

    except Exception as e:
        print(f"❌ Instagram test failed: {e}")


@cli.command()
@click.argument("url")
def test_url_expansion(url):
    """Test URL expansion for shortened URLs."""
    try:
        print(f"🧪 Testing URL expansion for: {url}")

        from src.scrapers.telegram_scraper import TelegramScraper

        telegram_scraper = TelegramScraper()

        if telegram_scraper._is_shortened_url(url):
            expanded = telegram_scraper._expand_shortened_url(url)
            print(f"✓ URL expansion successful")
            print(f"  Original: {url}")
            print(f"  Expanded: {expanded}")
        else:
            print("ℹ️  URL doesn't appear to be shortened")
            print(f"  URL: {url}")

    except Exception as e:
        print(f"❌ URL expansion test failed: {e}")


@cli.command()
@click.option("--limit", default=10, help="Maximum number of messages to show")
def show_links(limit):
    """Show messages with extracted links."""
    try:
        print(f"🔗 Messages with links (showing {limit}):")

        messages = db_manager.get_messages_with_links(limit)

        if not messages:
            print("No messages with links found")
            return

        for i, message in enumerate(messages, 1):
            print(f"\n{i}. Message ID: {message.id}")
            print(f"   Text: {message.text[:100]}...")
            print(f"   Date: {message.date}")

            # Get links for this message
            links = db_manager.get_links_from_message(message.id)
            if links:
                print(f"   Links ({len(links)}):")
                for j, link in enumerate(links, 1):
                    print(f"     {j}. {link}")
            else:
                print("   No links found")

    except Exception as e:
        print(f"❌ Error showing links: {e}")


if __name__ == "__main__":
    cli()
