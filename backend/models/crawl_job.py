from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from backend.utils.database import Base
import uuid


class CrawlJob(Base):
    __tablename__ = "crawl_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bot_id = Column(UUID(as_uuid=True), ForeignKey('bots.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    website_url = Column(String(500), nullable=False)
    status = Column(String(20), nullable=False, default='queued', index=True)  # queued, crawling, completed, failed
    pages_found = Column(Integer, nullable=False, default=0)
    pages_crawled = Column(Integer, nullable=False, default=0)
    error_message = Column(Text, nullable=True)
    firecrawl_job_id = Column(String(255), nullable=True)
    crawled_data_json = Column(JSONB, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    def __repr__(self):
        return f"<CrawlJob {self.id} - {self.status}>"


# Create indexes
Index('idx_crawl_jobs_bot_id', CrawlJob.bot_id)
Index('idx_crawl_jobs_user_id', CrawlJob.user_id)
Index('idx_crawl_jobs_status', CrawlJob.status)
Index('idx_crawl_jobs_created_at', CrawlJob.created_at.desc())
