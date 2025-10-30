from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from backend.schemas.bot import (
    CreateBotRequest,
    BotListResponse,
    BotDetailResponse,
    BotsListResponse,
    UpdateBotRequest,
    TestBotRequest,
    TestBotResponse,
    ChatMessage,
    ChatResponse
)
from backend.models.user import User
from backend.models.bot import Bot
from backend.models.crawl_job import CrawlJob
from backend.utils.database import get_db, conversations_collection
from backend.utils.auth import get_current_user
from backend.services.credit_service import CreditService
from backend.services.firecrawl_service import FirecrawlService
from backend.services.ai_service import AIService
from backend.config import settings
import uuid
import asyncio

router = APIRouter(prefix="/api/bots", tags=["Bots"])


async def crawl_and_create_bot_background(
    bot_id: str,
    crawl_job_id: str,
    website_url: str,
    page_count: int,
    bot_name: str,
    db_url: str
):
    """Background task to crawl website and create bot"""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    # Create new database session for background task
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Update crawl job status
        crawl_job = db.query(CrawlJob).filter(CrawlJob.id == crawl_job_id).first()
        if not crawl_job:
            return

        crawl_job.status = "crawling"
        crawl_job.started_at = datetime.utcnow()
        db.commit()

        # Crawl website using Firecrawl
        firecrawl = FirecrawlService()
        crawl_result = await firecrawl.crawl_website(website_url, max_pages=page_count)

        if not crawl_result.get("success"):
            crawl_job.status = "failed"
            crawl_job.error_message = "Crawling failed"
            db.commit()

            # Update bot status
            bot = db.query(Bot).filter(Bot.id == bot_id).first()
            if bot:
                bot.status = "failed"
                db.commit()
            return

        # Store crawled data
        crawled_pages = crawl_result.get("pages", [])
        crawl_job.crawled_data_json = {"pages": crawled_pages}
        crawl_job.pages_crawled = len(crawled_pages)
        crawl_job.pages_found = crawl_result.get("total_pages", len(crawled_pages))
        crawl_job.status = "completed"
        crawl_job.completed_at = datetime.utcnow()
        db.commit()

        # Create bot system prompt using Claude
        claude = AIService()
        system_prompt = claude.create_bot_system_prompt(
            crawled_pages,
            bot_name,
            website_url
        )

        # Update bot with system prompt and set status to active
        bot = db.query(Bot).filter(Bot.id == bot_id).first()
        if bot:
            bot.claude_system_prompt = system_prompt
            bot.status = "active"
            bot.embed_code = f'<script src="{settings.FRONTEND_URL}/widget.js" data-bot-id="{bot_id}"></script>'
            bot.api_endpoint = f"{settings.FRONTEND_URL}/api/bots/{bot_id}/chat"
            db.commit()

    except Exception as e:
        # Handle errors
        crawl_job = db.query(CrawlJob).filter(CrawlJob.id == crawl_job_id).first()
        if crawl_job:
            crawl_job.status = "failed"
            crawl_job.error_message = str(e)
            db.commit()

        bot = db.query(Bot).filter(Bot.id == bot_id).first()
        if bot:
            bot.status = "failed"
            db.commit()

    finally:
        db.close()


@router.post("/create", response_model=BotDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_bot(
    request: CreateBotRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new bot by crawling a website"""

    # Get user's plan limits
    plan_limits = CreditService.get_plan_limits(current_user.plan)
    page_limit = plan_limits['page_limit']

    # Count pages using Firecrawl (simplified for MVP - assume 1 page)
    # In production, use actual Firecrawl page counting
    firecrawl = FirecrawlService()
    try:
        # For MVP, we'll do a simple check
        page_count = 1  # Simplified - actual implementation should count pages
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to validate website URL"
        )

    # Check if page count exceeds plan limit
    if page_count > page_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Your website has {page_count} pages, but your plan supports up to {page_limit} pages. Please upgrade your plan."
        )

    # Check if user has sufficient credits (1 credit for bot creation)
    if not CreditService.check_sufficient_credits(current_user, 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You don't have enough credits. You need 1 credit to create a bot."
        )

    # Create bot record
    bot = Bot(
        user_id=current_user.id,
        bot_name=request.bot_name,
        website_url=str(request.website_url),
        page_count=page_count,
        status="creating",
        claude_system_prompt=""  # Will be filled after crawling
    )

    db.add(bot)
    db.commit()
    db.refresh(bot)

    # Deduct 1 credit for bot creation
    CreditService.deduct_credits(
        db=db,
        user=current_user,
        amount=1,
        reason="bot_creation",
        description=f"Created bot: {request.bot_name}",
        bot_id=bot.id
    )

    # Create crawl job
    crawl_job = CrawlJob(
        bot_id=bot.id,
        user_id=current_user.id,
        website_url=str(request.website_url),
        status="queued"
    )

    db.add(crawl_job)
    db.commit()
    db.refresh(crawl_job)

    # Start background task to crawl and create bot
    background_tasks.add_task(
        crawl_and_create_bot_background,
        str(bot.id),
        str(crawl_job.id),
        str(request.website_url),
        page_count,
        request.bot_name,
        settings.DATABASE_URL
    )

    return BotDetailResponse(
        id=str(bot.id),
        bot_name=bot.bot_name,
        website_url=bot.website_url,
        page_count=bot.page_count,
        status=bot.status,
        embed_code=bot.embed_code,
        api_endpoint=bot.api_endpoint,
        primary_color=bot.primary_color,
        bot_avatar_url=bot.bot_avatar_url,
        widget_position=bot.widget_position,
        welcome_message=bot.welcome_message,
        auto_open=bot.auto_open,
        open_delay=bot.open_delay,
        conversation_memory=bot.conversation_memory,
        show_typing_indicator=bot.show_typing_indicator,
        created_at=bot.created_at,
        updated_at=bot.updated_at
    )


@router.get("", response_model=BotsListResponse)
async def list_bots(
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all bots for the current user"""

    query = db.query(Bot).filter(Bot.user_id == current_user.id)

    if status:
        query = query.filter(Bot.status == status)

    total = query.count()
    bots = query.order_by(Bot.created_at.desc()).limit(limit).offset(offset).all()

    return BotsListResponse(
        bots=[
            BotListResponse(
                id=str(bot.id),
                bot_name=bot.bot_name,
                website_url=bot.website_url,
                page_count=bot.page_count,
                status=bot.status,
                primary_color=bot.primary_color,
                created_at=bot.created_at,
                updated_at=bot.updated_at
            )
            for bot in bots
        ],
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{bot_id}", response_model=BotDetailResponse)
async def get_bot(
    bot_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific bot"""

    bot = db.query(Bot).filter(
        Bot.id == bot_id,
        Bot.user_id == current_user.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    return BotDetailResponse(
        id=str(bot.id),
        bot_name=bot.bot_name,
        website_url=bot.website_url,
        page_count=bot.page_count,
        status=bot.status,
        embed_code=bot.embed_code,
        api_endpoint=bot.api_endpoint,
        primary_color=bot.primary_color,
        bot_avatar_url=bot.bot_avatar_url,
        widget_position=bot.widget_position,
        welcome_message=bot.welcome_message,
        auto_open=bot.auto_open,
        open_delay=bot.open_delay,
        conversation_memory=bot.conversation_memory,
        show_typing_indicator=bot.show_typing_indicator,
        created_at=bot.created_at,
        updated_at=bot.updated_at
    )


@router.put("/{bot_id}", response_model=BotDetailResponse)
async def update_bot(
    bot_id: str,
    request: UpdateBotRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update bot settings"""

    bot = db.query(Bot).filter(
        Bot.id == bot_id,
        Bot.user_id == current_user.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    # Update fields if provided
    if request.bot_name is not None:
        bot.bot_name = request.bot_name
    if request.primary_color is not None:
        bot.primary_color = request.primary_color
    if request.widget_position is not None:
        bot.widget_position = request.widget_position
    if request.welcome_message is not None:
        bot.welcome_message = request.welcome_message
    if request.auto_open is not None:
        bot.auto_open = request.auto_open
    if request.open_delay is not None:
        bot.open_delay = request.open_delay
    if request.conversation_memory is not None:
        bot.conversation_memory = request.conversation_memory
    if request.show_typing_indicator is not None:
        bot.show_typing_indicator = request.show_typing_indicator

    db.commit()
    db.refresh(bot)

    return BotDetailResponse(
        id=str(bot.id),
        bot_name=bot.bot_name,
        website_url=bot.website_url,
        page_count=bot.page_count,
        status=bot.status,
        embed_code=bot.embed_code,
        api_endpoint=bot.api_endpoint,
        primary_color=bot.primary_color,
        bot_avatar_url=bot.bot_avatar_url,
        widget_position=bot.widget_position,
        welcome_message=bot.welcome_message,
        auto_open=bot.auto_open,
        open_delay=bot.open_delay,
        conversation_memory=bot.conversation_memory,
        show_typing_indicator=bot.show_typing_indicator,
        created_at=bot.created_at,
        updated_at=bot.updated_at
    )


@router.delete("/{bot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bot(
    bot_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a bot"""

    bot = db.query(Bot).filter(
        Bot.id == bot_id,
        Bot.user_id == current_user.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    db.delete(bot)
    db.commit()

    return None


@router.post("/{bot_id}/test", response_model=TestBotResponse)
async def test_bot(
    bot_id: str,
    request: TestBotRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test bot with a message"""

    bot = db.query(Bot).filter(
        Bot.id == bot_id,
        Bot.user_id == current_user.id
    ).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    if bot.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot is not active yet"
        )

    # Use Claude to generate response
    claude = AIService()
    result = claude.chat(
        system_prompt=bot.claude_system_prompt,
        messages=[{"role": "user", "content": request.message}]
    )

    return TestBotResponse(
        response=result["response"],
        timestamp=datetime.utcnow()
    )


@router.post("/{bot_id}/chat", response_model=ChatResponse)
async def chat_with_bot(
    bot_id: str,
    request: ChatMessage,
    db: Session = Depends(get_db)
):
    """Public endpoint for end-users to chat with bot (no authentication required)"""

    # Get bot
    bot = db.query(Bot).filter(Bot.id == bot_id).first()

    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )

    if bot.status != "active":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Bot is not available"
        )

    # Get conversation history if session_id provided and memory enabled
    messages = []
    if request.session_id and bot.conversation_memory:
        # Retrieve from MongoDB
        conversation = conversations_collection.find_one({
            "bot_id": bot_id,
            "session_id": request.session_id
        })

        if conversation:
            # Get last 10 messages for context
            messages = conversation.get("messages", [])[-10:]

    # Add current user message
    messages.append({"role": "user", "content": request.message})

    # Get response from Claude
    claude = AIService()
    result = claude.chat(
        system_prompt=bot.claude_system_prompt,
        messages=messages
    )

    # Store conversation in MongoDB
    if request.session_id:
        timestamp = datetime.utcnow()
        conversations_collection.update_one(
            {"bot_id": bot_id, "session_id": request.session_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {"role": "user", "content": request.message, "timestamp": timestamp},
                            {"role": "assistant", "content": result["response"], "timestamp": timestamp, "tokens_used": result.get("tokens_used", 0)}
                        ]
                    }
                },
                "$setOnInsert": {
                    "bot_id": bot_id,
                    "session_id": request.session_id,
                    "created_at": timestamp
                },
                "$set": {
                    "updated_at": timestamp
                }
            },
            upsert=True
        )

    return ChatResponse(
        response=result["response"],
        timestamp=datetime.utcnow()
    )
