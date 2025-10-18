# Telegram Data Ingestion Service

A scalable data ingestion service that scrapes Telegram channels, extracts links, scrapes web content, and stores normalized vectors for search and retrieval.

## Features

- **Telegram Scraping**: Batch scrape up to 1000 messages per week from configured channels
- **Web Content Extraction**: Automatically scrape content from links found in messages
- **LLM Normalization**: Use OpenAI to normalize content into structured format
- **Text Search**: Store normalized content in SQLite with text search capabilities
- **Automated Scheduling**: Weekly scraping with APScheduler
- **Extensible Architecture**: Easy to add new data sources

## Quick Start

### 1. Prerequisites

- Python 3.10+
- Telegram API credentials
- OpenAI API key

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd data_ingestion_service

# Install dependencies
pip install -r requirements.txt

```

### 3. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:

```env
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here
TELEGRAM_PHONE=your_phone_number_here
OPENAI_API_KEY=your_openai_api_key_here

# Telegram Channels (comma-separated list)
TELEGRAM_CHANNELS=channel1,channel2,channel3
```

### 4. Setup

```bash
# Initialize databases and schema
python main.py setup
```

### 5. Add Channels

```bash
# Load channels from .env file
python main.py load-channels

# Or add individual channels
python main.py add-channel channelname1
```

### 6. Test the System

```bash
# Test individual components
python main.py test-telegram
python main.py test-web
python main.py test-normalization

# Run full pipeline once
python main.py run-once
```

### 7. Start Automated Scraping

```bash
# Start the scheduler (runs weekly)
python main.py start-scheduler
```

## Usage

### CLI Commands

```bash
# Setup and configuration
python main.py setup                    # Initialize databases
python main.py load-channels           # Load channels from .env
python main.py add-channel <username>   # Add individual Telegram channel
python main.py list-channels           # List configured channels

# Manual operations
python main.py run-once                # Run scraping pipeline once
python main.py start-scheduler         # Start automated scheduler

# Search and analysis
python main.py search "your query"    # Search vector database
python main.py stats                   # Show processing statistics

# Testing
python main.py test-telegram          # Test Telegram connection
python main.py test-web               # Test web scraping
python main.py test-normalization     # Test content normalization
```

### Search Examples

```bash
# Search for AI-related content
python main.py search "artificial intelligence"

# Search for specific topics
python main.py search "machine learning algorithms"

# Search with result limit
python main.py search "data science" --limit 5
```

## Architecture

### Project Structure

```
data_ingestion_service/
├── src/
│   ├── scrapers/           # Data source scrapers
│   │   ├── base.py         # Abstract scraper interface
│   │   ├── telegram_scraper.py
│   │   └── web_scraper.py
│   ├── storage/            # Data storage layer
│   │   ├── database.py     # SQLite models
│   │   └── vector_store.py # Weaviate client
│   ├── processing/         # Content processing
│   │   └── normalizer.py  # LLM normalization
│   ├── scheduler.py        # Automated scheduling
│   └── config.py          # Configuration
├── main.py                # CLI interface
├── requirements.txt
└── README.md
```

### Data Flow

1. **Scraping**: Telegram channels → Messages with links
2. **Web Extraction**: URLs → Web content
3. **Normalization**: Raw content → LLM-normalized text
4. **Vectorization**: Normalized text → Vector embeddings
5. **Storage**: SQLite (raw) + Weaviate (vectors)

### Database Schema

**SQLite Tables:**

- `channels`: Channel information and last scraped timestamp
- `messages`: Telegram messages with link detection
- `scraped_content`: Web content from extracted URLs

## Extensibility

### Adding New Scrapers

1. Create a new scraper class inheriting from `BaseScraper`:

```python
from src.scrapers.base import BaseScraper

class MyScraper(BaseScraper):
    def __init__(self):
        super().__init__("my_scraper")

    def scrape(self, **kwargs):
        # Implement scraping logic
        return scraped_data

    def validate(self, data):
        # Implement validation logic
        return is_valid
```

2. Add to the scheduler pipeline in `src/scheduler.py`

3. Update CLI commands in `main.py` if needed

### Adding New Data Sources

The system is designed to be easily extensible:

- **Unified Storage**: All data flows through the same SQLite schema
- **Consistent Processing**: All content goes through the same normalization pipeline
- **Plugin Architecture**: New scrapers follow the same interface

## Configuration

### Environment Variables

| Variable            | Description           | Required                                  |
| ------------------- | --------------------- | ----------------------------------------- |
| `TELEGRAM_API_ID`   | Telegram API ID       | Yes                                       |
| `TELEGRAM_API_HASH` | Telegram API Hash     | Yes                                       |
| `TELEGRAM_PHONE`    | Phone number for auth | Yes                                       |
| `OPENAI_API_KEY`    | OpenAI API key        | Yes                                       |
| `DATABASE_URL`      | SQLite database URL   | No (default: sqlite:///data_ingestion.db) |

### Scraping Configuration

- **Max Messages**: 1000 per channel per week (configurable in `src/config.py`)
- **Scraping Interval**: Weekly (168 hours, configurable)
- **Rate Limiting**: Built-in delays to respect API limits

## Troubleshooting

### Common Issues

1. **Telegram Authentication**

   - Ensure API credentials are correct
   - Phone number must be verified
   - First run will require SMS verification

2. **OpenAI API**
   - Verify API key is valid
   - Check rate limits and billing
   - Ensure model access (gpt-3.5-turbo)

### Logs

- Application logs: `scraper.log`
- Database: SQLite file `data_ingestion.db`
- Weaviate: Check Docker logs

### Testing

Use the built-in test commands to verify each component:

```bash
python main.py test-telegram      # Test Telegram connection
python main.py test-web          # Test web scraping
python main.py test-normalization # Test LLM processing
```

## Development

### Adding Features

1. **New Scrapers**: Inherit from `BaseScraper`
2. **New Processors**: Add to `src/processing/`
3. **New Storage**: Extend `src/storage/`
4. **New CLI Commands**: Add to `main.py`

### Testing

```bash
# Run individual tests
python main.py test-telegram
python main.py test-web
python main.py test-normalization

# Run full pipeline test
python main.py run-once
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review logs for error messages
3. Test individual components
4. Create an issue with detailed information
