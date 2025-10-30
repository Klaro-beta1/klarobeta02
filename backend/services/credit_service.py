from sqlalchemy.orm import Session
from backend.models.user import User
from backend.models.credit_transaction import CreditTransaction
from fastapi import HTTPException
from typing import Optional
import uuid


class CreditService:
    """Service for managing user credits"""

    @staticmethod
    def deduct_credits(
        db: Session,
        user: User,
        amount: int,
        reason: str,
        description: Optional[str] = None,
        bot_id: Optional[uuid.UUID] = None
    ) -> CreditTransaction:
        """
        Deduct credits from user account
        Raises HTTPException if insufficient credits
        """
        if user.credits_remaining < amount:
            raise HTTPException(
                status_code=400,
                detail=f"You don't have enough credits. You need {amount} credit(s) but have {user.credits_remaining}."
            )

        credits_before = user.credits_remaining
        user.credits_remaining -= amount
        credits_after = user.credits_remaining

        # Create transaction record
        transaction = CreditTransaction(
            user_id=user.id,
            bot_id=bot_id,
            credits_change=-amount,
            credits_before=credits_before,
            credits_after=credits_after,
            reason=reason,
            description=description
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return transaction

    @staticmethod
    def add_credits(
        db: Session,
        user: User,
        amount: int,
        reason: str,
        description: Optional[str] = None,
        bot_id: Optional[uuid.UUID] = None
    ) -> CreditTransaction:
        """Add credits to user account"""
        credits_before = user.credits_remaining
        user.credits_remaining += amount
        credits_after = user.credits_remaining

        # Create transaction record
        transaction = CreditTransaction(
            user_id=user.id,
            bot_id=bot_id,
            credits_change=amount,
            credits_before=credits_before,
            credits_after=credits_after,
            reason=reason,
            description=description
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return transaction

    @staticmethod
    def get_user_transactions(
        db: Session,
        user_id: uuid.UUID,
        limit: int = 20,
        offset: int = 0
    ) -> list[CreditTransaction]:
        """Get credit transaction history for user"""
        transactions = db.query(CreditTransaction).filter(
            CreditTransaction.user_id == user_id
        ).order_by(
            CreditTransaction.created_at.desc()
        ).limit(limit).offset(offset).all()

        return transactions

    @staticmethod
    def check_sufficient_credits(user: User, required: int) -> bool:
        """Check if user has sufficient credits"""
        return user.credits_remaining >= required

    @staticmethod
    def get_plan_limits(plan: str) -> dict:
        """Get page limits and monthly credits for a plan"""
        limits = {
            'free': {'page_limit': 2, 'monthly_credits': 2},
            'basic': {'page_limit': 20, 'monthly_credits': 10},
            'pro': {'page_limit': 50, 'monthly_credits': 40},
            'enterprise': {'page_limit': 150, 'monthly_credits': 100},
        }
        return limits.get(plan, limits['free'])
