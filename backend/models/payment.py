from sqlalchemy import Column, String, Integer, DateTime, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.utils.database import Base
import uuid


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default='USD')  # USD, EUR, INR
    payment_method = Column(String(20), nullable=False)  # stripe, upi
    payment_type = Column(String(20), nullable=False)  # subscription, credits
    status = Column(String(20), nullable=False, default='pending', index=True)  # pending, completed, failed
    stripe_payment_id = Column(String(255), nullable=True)
    upi_transaction_id = Column(String(255), nullable=True)
    plan_purchased = Column(String(20), nullable=True)  # free, basic, pro, enterprise
    credits_purchased = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Payment {self.id} - {self.status}>"


# Create indexes
Index('idx_payments_user_id', Payment.user_id)
Index('idx_payments_status', Payment.status)
Index('idx_payments_created_at', Payment.created_at.desc())
