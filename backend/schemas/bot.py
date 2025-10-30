from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime


class CreateBotRequest(BaseModel):
    website_url: HttpUrl
    bot_name: str = Field(..., min_length=1, max_length=100)


class BotListResponse(BaseModel):
    id: str
    bot_name: str
    website_url: str
    page_count: int
    status: str
    primary_color: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BotDetailResponse(BaseModel):
    id: str
    bot_name: str
    website_url: str
    page_count: int
    status: str
    embed_code: Optional[str]
    api_endpoint: Optional[str]
    primary_color: str
    bot_avatar_url: Optional[str]
    widget_position: str
    welcome_message: str
    auto_open: bool
    open_delay: int
    conversation_memory: bool
    show_typing_indicator: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BotsListResponse(BaseModel):
    bots: list[BotListResponse]
    total: int
    limit: int
    offset: int


class UpdateBotRequest(BaseModel):
    bot_name: Optional[str] = Field(None, min_length=1, max_length=100)
    primary_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    widget_position: Optional[str] = Field(None, pattern=r'^(bottom-right|bottom-left)$')
    welcome_message: Optional[str] = Field(None, max_length=200)
    auto_open: Optional[bool] = None
    open_delay: Optional[int] = Field(None, ge=0, le=30)
    conversation_memory: Optional[bool] = None
    show_typing_indicator: Optional[bool] = None


class TestBotRequest(BaseModel):
    message: str = Field(..., min_length=1)


class TestBotResponse(BaseModel):
    response: str
    timestamp: datetime


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
