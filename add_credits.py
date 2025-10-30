#!/usr/bin/env python3
"""
Quick script to add credits to a user account
Usage: python add_credits.py <email> <credits>
Example: python add_credits.py mihirbhut07@gmail.com 100
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models.user import User
from backend.models.credit_transaction import CreditTransaction
from backend.config import settings


def add_credits(email: str, credits: int):
    """Add credits to a user account"""

    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Find user
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"❌ Error: User with email '{email}' not found")
            return False

        # Store old credits
        old_credits = user.credits_remaining

        # Add credits
        user.credits_remaining += credits

        # Create transaction record
        transaction = CreditTransaction(
            user_id=user.id,
            bot_id=None,
            credits_change=credits,
            credits_before=old_credits,
            credits_after=user.credits_remaining,
            reason="admin_adjustment",
            description=f"Manual credit addition via script"
        )

        db.add(transaction)
        db.commit()

        print(f"✅ Success!")
        print(f"   User: {user.email}")
        print(f"   Credits before: {old_credits}")
        print(f"   Credits added: {credits}")
        print(f"   Credits after: {user.credits_remaining}")
        print(f"   Plan: {user.plan.upper()}")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False

    finally:
        db.close()


def main():
    if len(sys.argv) != 3:
        print("Usage: python add_credits.py <email> <credits>")
        print("Example: python add_credits.py mihirbhut07@gmail.com 100")
        sys.exit(1)

    email = sys.argv[1]

    try:
        credits = int(sys.argv[2])
    except ValueError:
        print("❌ Error: Credits must be a number")
        sys.exit(1)

    if credits <= 0:
        print("❌ Error: Credits must be a positive number")
        sys.exit(1)

    print(f"\n🔄 Adding {credits} credits to {email}...")
    print()

    success = add_credits(email, credits)

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
