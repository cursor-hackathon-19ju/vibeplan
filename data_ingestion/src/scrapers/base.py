from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime


class BaseScraper(ABC):
    """Abstract base class for all scrapers."""

    def __init__(self, name: str):
        self.name = name
        self.last_run = None
        self.status = "idle"  # idle, running, error, completed

    @abstractmethod
    def scrape(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Main scraping method to be implemented by subclasses.

        Returns:
            List[Dict[str, Any]]: List of scraped data items
        """
        pass

    @abstractmethod
    def validate(self, data: Dict[str, Any]) -> bool:
        """
        Validate scraped data.

        Args:
            data: Data item to validate

        Returns:
            bool: True if data is valid, False otherwise
        """
        pass

    def preprocess(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Preprocess data before validation.
        Override in subclasses if needed.

        Args:
            data: Raw data item

        Returns:
            Dict[str, Any]: Preprocessed data
        """
        return data

    def postprocess(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Postprocess scraped data.
        Override in subclasses if needed.

        Args:
            data: List of scraped data items

        Returns:
            List[Dict[str, Any]]: Postprocessed data
        """
        return data

    def run(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Run the scraper with error handling and status tracking.

        Returns:
            List[Dict[str, Any]]: List of successfully scraped and validated data
        """
        self.status = "running"
        self.last_run = datetime.utcnow()

        try:
            # Scrape data
            raw_data = self.scrape(**kwargs)

            # Postprocess
            processed_data = self.postprocess(raw_data)

            # Validate and filter
            valid_data = []
            for item in processed_data:
                preprocessed = self.preprocess(item)
                if self.validate(preprocessed):
                    valid_data.append(preprocessed)

            self.status = "completed"
            return valid_data

        except Exception as e:
            self.status = "error"
            print(f"Error in {self.name} scraper: {e}")
            return []

    def get_status(self) -> Dict[str, Any]:
        """Get current scraper status."""
        return {
            "name": self.name,
            "status": self.status,
            "last_run": self.last_run.isoformat() if self.last_run else None,
        }
