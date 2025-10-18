import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Telegram API Configuration
TELEGRAM_API_ID = os.getenv("TELEGRAM_API_ID")
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH")
TELEGRAM_PHONE = os.getenv("TELEGRAM_PHONE")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///data_ingestion.db")

# Scraping Configuration
MAX_MESSAGES_PER_CHANNEL = 1000
SCRAPING_INTERVAL_HOURS = 168  # 1 week

# Telegram Channels to scrape (comma-separated list)
TELEGRAM_CHANNELS = (
    os.getenv("TELEGRAM_CHANNELS", "").split(",")
    if os.getenv("TELEGRAM_CHANNELS")
    else []
)


# Validation
def validate_config():
    """Validate that all required environment variables are set."""
    required_vars = {
        "TELEGRAM_API_ID": TELEGRAM_API_ID,
        "TELEGRAM_API_HASH": TELEGRAM_API_HASH,
        "TELEGRAM_PHONE": TELEGRAM_PHONE,
        "OPENAI_API_KEY": OPENAI_API_KEY,
    }

    missing_vars = [var for var, value in required_vars.items() if not value]
    if missing_vars:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_vars)}"
        )

    return True
