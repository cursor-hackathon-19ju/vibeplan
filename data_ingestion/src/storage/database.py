from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import json
from typing import Dict, Any, Optional

Base = declarative_base()


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    channel_username = Column(
        String(255), nullable=False
    )  # Store channel username directly
    message_id = Column(
        String(255), nullable=False
    )  # Can be telegram message ID or instagram post ID
    text = Column(Text)
    normalized_text = Column(Text)
    links = Column(Text)  # JSON string of extracted links
    source = Column(
        String(50), default="telegram"
    )  # Source: telegram, instagram, web, etc.
    date = Column(DateTime, nullable=False)
    has_links = Column(Boolean, default=False)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scraped_content = relationship("ScrapedContent", back_populates="message")


class ScrapedContent(Base):
    __tablename__ = "scraped_content"

    id = Column(Integer, primary_key=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    url = Column(String(500), nullable=False)
    content = Column(Text)
    normalized_text = Column(Text)
    scraped_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    message = relationship("Message", back_populates="scraped_content")


class DatabaseManager:
    def __init__(self, database_url=None):
        if database_url is None:
            from src.config import DATABASE_URL

            database_url = DATABASE_URL

        self.engine = create_engine(database_url, echo=False)
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )

    def create_tables(self):
        """Create all database tables."""
        Base.metadata.create_all(bind=self.engine)
        print("Database tables created successfully.")

    def get_session(self):
        """Get a database session."""
        return self.SessionLocal()

    def close(self):
        """Close the database connection."""
        self.engine.dispose()

    def get_messages_with_links(self, limit=100):
        """Get messages that have links."""
        session = self.get_session()
        try:
            messages = (
                session.query(Message).filter_by(has_links=True).limit(limit).all()
            )
            return messages
        finally:
            session.close()

    def get_links_from_message(self, message_id):
        """Get links from a specific message."""
        session = self.get_session()
        try:
            message = session.query(Message).filter_by(id=message_id).first()
            if message and message.links:
                import json

                return json.loads(message.links)
            return []
        finally:
            session.close()

    def store_message(
        self, message_data: Dict[str, Any], source: str = "telegram"
    ) -> Optional[Message]:
        """
        Universal method to store any type of message (Telegram or Instagram).

        Args:
            message_data: Message data dictionary
            source: Source of the message ("telegram" or "instagram")

        Returns:
            Message: The stored message or None if failed
        """
        session = self.get_session()
        stored_message = None

        try:
            # Check if message already exists (for Telegram messages)
            if source == "telegram":
                existing_message = (
                    session.query(Message)
                    .filter_by(
                        channel_username=message_data["channel_username"],
                        message_id=message_data["message_id"],
                    )
                    .first()
                )
                if existing_message:
                    return existing_message

            # Create new message
            message = Message(
                channel_username=message_data["channel_username"],
                message_id=message_data["message_id"],
                text=message_data.get("text", ""),
                links=json.dumps(message_data.get("links", [])),
                source=source,
                date=message_data.get("date", datetime.utcnow()),
                has_links=message_data.get("has_links", False),
                processed=False,
            )

            session.add(message)
            session.commit()
            stored_message = message
            print(
                f"Stored {source} message: {message_data.get('message_id', 'unknown')}"
            )

        except Exception as e:
            session.rollback()
            print(f"Error storing {source} message: {e}")
        finally:
            session.close()

        return stored_message


# Global database manager instance
db_manager = DatabaseManager()
