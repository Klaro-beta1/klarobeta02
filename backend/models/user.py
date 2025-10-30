from sqlalchemy import Column, String, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.utils.database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Null for OAuth users
    google_id = Column(String(255), nullable=True, unique=True)
    full_name = Column(String(100), nullable=True)
    plan = Column(String(20), nullable=False, default='free', index=True)  # free, basic, pro, enterprise
    credits_remaining = Column(Integer, nullable=False, default=2)
    stripe_customer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User {self.email}>"


# Create indexes
Index('idx_users_email', User.email, unique=True)
Index('idx_users_google_id', User.google_id, unique=True, postgresql_where=User.google_id.isnot(None))
Index('idx_users_plan', User.plan)
