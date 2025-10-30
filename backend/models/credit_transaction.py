from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.utils.database import Base
import uuid


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    bot_id = Column(UUID(as_uuid=True), ForeignKey('bots.id', ondelete='SET NULL'), nullable=True, index=True)
    credits_change = Column(Integer, nullable=False)  # Positive for add, negative for deduct
    credits_before = Column(Integer, nullable=False)
    credits_after = Column(Integer, nullable=False)
    reason = Column(String(50), nullable=False, index=True)  # plan_renewal, bot_creation, customization_chat, regeneration, credit_purchase, refund, admin_adjustment
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    def __repr__(self):
        return f"<CreditTransaction {self.id} - {self.reason}>"


# Create indexes
Index('idx_credit_transactions_user_id', CreditTransaction.user_id)
Index('idx_credit_transactions_bot_id', CreditTransaction.bot_id, postgresql_where=CreditTransaction.bot_id.isnot(None))
Index('idx_credit_transactions_created_at', CreditTransaction.created_at.desc())
Index('idx_credit_transactions_reason', CreditTransaction.reason)
