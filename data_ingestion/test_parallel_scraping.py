#!/usr/bin/env python3
"""
Test script to demonstrate parallel Telegram scraping
"""

import time
from src.scrapers.telegram_scraper import TelegramScraper


def test_parallel_scraping():
    """Test parallel scraping functionality."""

    # Initialize scraper
    scraper = TelegramScraper()

    # Configure parallelization settings
    scraper.configure_parallelization(
        max_concurrent_channels=5,  # Allow 5 concurrent channels
        max_link_workers=15,  # 15 workers for link expansion
        max_batch_link_workers=20,  # 20 workers for batch link expansion
    )

    # Test channels (replace with actual channels)
    test_channels = [
        "@channel1",  # Replace with actual channel usernames
        "@channel2",
        "@channel3",
    ]

    print("🚀 Testing Parallel Telegram Scraping")
    print("=" * 50)

    # Test 1: Sequential scraping
    print("\n📋 Test 1: Sequential Scraping")
    start_time = time.time()

    try:
        messages_seq = scraper.scrape(
            channel_usernames=test_channels,
            limit=200,
            use_parallel=False,  # Disable parallelization
        )
        seq_time = time.time() - start_time
        print(f"✅ Sequential scraping completed in {seq_time:.2f} seconds")
        print(f"   Messages scraped: {len(messages_seq)}")
    except Exception as e:
        print(f"❌ Sequential scraping failed: {e}")
        messages_seq = []
        seq_time = 0

    # Test 2: Parallel scraping
    print("\n📋 Test 2: Parallel Scraping")
    start_time = time.time()

    try:
        messages_par = scraper.scrape(
            channel_usernames=test_channels,
            limit=200,
            use_parallel=True,  # Enable parallelization
            max_concurrent=5,
        )
        par_time = time.time() - start_time
        print(f"✅ Parallel scraping completed in {par_time:.2f} seconds")
        print(f"   Messages scraped: {len(messages_par)}")
    except Exception as e:
        print(f"❌ Parallel scraping failed: {e}")
        messages_par = []
        par_time = 0

    # Performance comparison
    if seq_time > 0 and par_time > 0:
        speedup = seq_time / par_time
        print(f"\n📊 Performance Comparison:")
        print(f"   Sequential time: {seq_time:.2f}s")
        print(f"   Parallel time: {par_time:.2f}s")
        print(f"   Speedup: {speedup:.2f}x")

    # Test 3: Link expansion performance
    print("\n📋 Test 3: Link Expansion Performance")

    # Create test messages with shortened URLs
    test_messages = [
        {
            "message_id": 1,
            "text": "Check out this link: bit.ly/abc123 and this one: t.co/xyz789",
            "links": ["bit.ly/abc123", "t.co/xyz789"],
            "channel_username": "@test",
            "date": "2024-01-01",
            "has_links": True,
        },
        {
            "message_id": 2,
            "text": "Another link: bit.ly/def456",
            "links": ["bit.ly/def456"],
            "channel_username": "@test",
            "date": "2024-01-01",
            "has_links": True,
        },
    ]

    # Test individual link expansion
    start_time = time.time()
    for message in test_messages:
        if message.get("links"):
            expanded_links = scraper._expand_links_parallel(message["links"])
            print(f"   Expanded {len(message['links'])} links: {expanded_links}")
    individual_time = time.time() - start_time

    # Test batch link expansion
    start_time = time.time()
    batch_expanded = scraper._expand_links_batch_parallel(test_messages)
    batch_time = time.time() - start_time

    print(f"\n📊 Link Expansion Performance:")
    print(f"   Individual expansion: {individual_time:.2f}s")
    print(f"   Batch expansion: {batch_time:.2f}s")
    if individual_time > 0 and batch_time > 0:
        batch_speedup = individual_time / batch_time
        print(f"   Batch speedup: {batch_speedup:.2f}x")

    print("\n✅ Parallel scraping test completed!")


if __name__ == "__main__":
    test_parallel_scraping()
