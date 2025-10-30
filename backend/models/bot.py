from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.utils.database import Base
import uuid


class Bot(Base):
    __tablename__ = "bots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    bot_name = Column(String(100), nullable=False)
    website_url = Column(String(500), nullable=False)
    page_count = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default='creating', index=True)  # creating, active, failed, customizing
    embed_code = Column(Text, nullable=True)
    api_endpoint = Column(String(500), nullable=True)
    primary_color = Column(String(7), nullable=False, default='#1976d2')  # Hex color
    bot_avatar_url = Column(String(500), nullable=True)
    widget_position = Column(String(20), nullable=False, default='bottom-right')  # bottom-right, bottom-left
    welcome_message = Column(String(200), nullable=False, default='Hi! How can I help you today?')
    auto_open = Column(Boolean, nullable=False, default=False)
    open_delay = Column(Integer, nullable=False, default=0)  # 0-30 seconds
    conversation_memory = Column(Boolean, nullable=False, default=True)
    show_typing_indicator = Column(Boolean, nullable=False, default=True)
    claude_system_prompt = Column(Text, nullable=False)  # System prompt with personality, rules, Q&A
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Bot {self.bot_name}>"


# Create indexes
Index('idx_bots_user_id', Bot.user_id)
Index('idx_bots_status', Bot.status)
Index('idx_bots_created_at', Bot.created_at.desc())
