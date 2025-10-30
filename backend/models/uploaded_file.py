from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.utils.database import Base
import uuid


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bot_id = Column(UUID(as_uuid=True), ForeignKey('bots.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False, default='application/pdf')
    extracted_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    def __repr__(self):
        return f"<UploadedFile {self.filename}>"


# Create indexes
Index('idx_uploaded_files_bot_id', UploadedFile.bot_id)
Index('idx_uploaded_files_user_id', UploadedFile.user_id)
