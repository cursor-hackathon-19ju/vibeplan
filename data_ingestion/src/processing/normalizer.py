import openai
from typing import List, Dict, Any, Optional
import json
import time

from src.config import OPENAI_API_KEY
from src.storage.database import (
    db_manager,
    Message as MessageModel,
    ScrapedContent as ScrapedContentModel,
)


class ContentNormalizer:
    """LLM-based content normalizer using OpenAI API."""

    def __init__(self):
        """Initialize OpenAI client."""
        import openai

        openai.api_key = OPENAI_API_KEY
        # Use the older API style to avoid httpx issues
        self.client = openai

    def _create_normalization_prompt(
        self, content: str, source_type: str = "telegram"
    ) -> str:
        """Create prompt for content normalization."""
        prompt = f"""
You are a content normalization assistant. Your task is to convert raw content into a structured, normalized format that captures the key information in a consistent way.

Source Type: {source_type}
Original Content:
{content}

Please normalize this content by:
1. Extracting the main topic/subject
2. Identifying key facts, claims, or information
3. Removing redundant or irrelevant details
4. Structuring the information in a clear, concise format
5. Preserving important context and meaning

Return the normalized content as a well-structured text that would be useful for search and retrieval. Focus on clarity and information density.

Normalized Content:
"""
        return prompt

    def normalize_content(
        self,
        content: str,
        source_type: str = "telegram",
        metadata: Dict[str, Any] = None,
    ) -> Optional[str]:
        """
        Normalize content using OpenAI API.

        Args:
            content: Raw content to normalize
            source_type: Type of source (telegram, web, etc.)
            metadata: Additional metadata

        Returns:
            str: Normalized content or None if failed
        """
        try:
            prompt = self._create_normalization_prompt(content, source_type)

            response = self.client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that normalizes content for better search and retrieval.",
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1000,
                temperature=0.3,
            )

            normalized_text = response.choices[0].message.content.strip()
            return normalized_text

        except Exception as e:
            print(f"Error normalizing content: {e}")
            return None

    def process_messages(self) -> int:
        """
        Process unprocessed messages and normalize their content.

        Returns:
            int: Number of messages processed
        """
        session = db_manager.get_session()
        processed_count = 0

        try:
            # Get unprocessed messages
            messages = session.query(MessageModel).filter_by(processed=False).all()

            for message in messages:
                print(
                    f"Processing message {message.id} from channel {message.channel_id}"
                )

                # Normalize message content
                normalized_text = self.normalize_content(
                    message.text,
                    source_type="telegram",
                    metadata={
                        "message_id": message.id,
                        "channel_id": message.channel_id,
                    },
                )

                if normalized_text:
                    # Store normalized text in database
                    message.normalized_text = normalized_text
                    message.processed = True
                    processed_count += 1
                    print(f"Normalized and stored message {message.id}")

                # Rate limiting
                time.sleep(0.5)

            session.commit()
            print(f"Processed {processed_count} messages.")

        except Exception as e:
            session.rollback()
            print(f"Error processing messages: {e}")
        finally:
            session.close()

        return processed_count

    def process_scraped_content(self) -> int:
        """
        Process scraped web content and normalize it.

        Returns:
            int: Number of content items processed
        """
        session = db_manager.get_session()
        processed_count = 0

        try:
            # Get all scraped content
            scraped_content = session.query(ScrapedContentModel).all()

            for content in scraped_content:
                print(f"Processing scraped content {content.id} from {content.url}")

                # Normalize scraped content
                normalized_text = self.normalize_content(
                    content.content,
                    source_type="web",
                    metadata={
                        "url": content.url,
                        "message_id": content.message_id,
                        "scraped_at": content.scraped_at.isoformat(),
                    },
                )

                if normalized_text:
                    # Store normalized text in database
                    content.normalized_text = normalized_text
                    processed_count += 1
                    print(f"Normalized and stored content from {content.url}")

                # Rate limiting
                time.sleep(0.5)

            print(f"Processed {processed_count} scraped content items.")

        except Exception as e:
            print(f"Error processing scraped content: {e}")
        finally:
            session.close()

        return processed_count

    def normalize_batch(
        self, content_list: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Normalize a batch of content items.

        Args:
            content_list: List of content dictionaries with 'content' and 'source_type' keys

        Returns:
            List[Dict[str, Any]]: List of normalized content with 'normalized_text' added
        """
        normalized_list = []

        for item in content_list:
            content = item.get("content", "")
            source_type = item.get("source_type", "unknown")
            metadata = item.get("metadata", {})

            normalized_text = self.normalize_content(content, source_type, metadata)

            if normalized_text:
                item["normalized_text"] = normalized_text
                normalized_list.append(item)

            # Rate limiting
            time.sleep(0.5)

        return normalized_list

    def search_similar_content(
        self, query: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for similar content using text search.

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            List[Dict[str, Any]]: List of similar content
        """
        session = db_manager.get_session()
        try:
            # Search in normalized text using LIKE
            messages = (
                session.query(MessageModel)
                .filter(MessageModel.normalized_text.like(f"%{query}%"))
                .limit(limit)
                .all()
            )

            results = []
            for message in messages:
                results.append(
                    {
                        "source": "telegram",
                        "original_text": message.text,
                        "normalized_text": message.normalized_text,
                        "metadata": {
                            "message_id": message.id,
                            "channel_id": message.channel_id,
                            "date": message.date.isoformat(),
                            "has_links": message.has_links,
                        },
                    }
                )

            return results
        finally:
            session.close()

    def get_processing_stats(self) -> Dict[str, int]:
        """Get statistics about processing status."""
        session = db_manager.get_session()

        try:
            total_messages = session.query(MessageModel).count()
            processed_messages = (
                session.query(MessageModel).filter_by(processed=True).count()
            )
            total_content = session.query(ScrapedContentModel).count()

            return {
                "total_messages": total_messages,
                "processed_messages": processed_messages,
                "unprocessed_messages": total_messages - processed_messages,
                "total_scraped_content": total_content,
            }
        finally:
            session.close()


# Global normalizer instance
normalizer = ContentNormalizer()
