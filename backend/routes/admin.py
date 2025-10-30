from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.utils.database import get_db
from backend.utils.auth import get_current_admin_user
from backend.services.credit_service import CreditService
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class AddCreditsRequest(BaseModel):
    user_email: str
    credits: int
    description: str = "Admin credit adjustment"


class UpdatePlanRequest(BaseModel):
    user_email: str
    plan: str


@router.post("/credits/add")
async def add_credits_to_user(
    request: AddCreditsRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to add credits to any user"""

    # Find user by email
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {request.user_email} not found"
        )

    # Add credits
    transaction = CreditService.add_credits(
        db=db,
        user=user,
        amount=request.credits,
        reason="admin_adjustment",
        description=request.description
    )

    return {
        "message": f"Added {request.credits} credits to {user.email}",
        "user": {
            "email": user.email,
            "credits_before": transaction.credits_before,
            "credits_after": transaction.credits_after,
            "total_credits": user.credits_remaining
        }
    }


@router.post("/users/update-plan")
async def update_user_plan(
    request: UpdatePlanRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to update user's plan"""

    # Validate plan
    valid_plans = ['free', 'basic', 'pro', 'enterprise']
    if request.plan not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan. Must be one of: {', '.join(valid_plans)}"
        )

    # Find user
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {request.user_email} not found"
        )

    old_plan = user.plan
    user.plan = request.plan
    db.commit()
    db.refresh(user)

    return {
        "message": f"Updated plan for {user.email} from {old_plan} to {request.plan}",
        "user": {
            "email": user.email,
            "old_plan": old_plan,
            "new_plan": user.plan,
            "credits_remaining": user.credits_remaining
        }
    }


@router.get("/users")
async def list_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to list all users"""

    users = db.query(User).all()

    return {
        "total": len(users),
        "users": [
            {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "plan": user.plan,
                "credits_remaining": user.credits_remaining,
                "created_at": user.created_at.isoformat()
            }
            for user in users
        ]
    }


@router.get("/stats")
async def get_system_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get system statistics"""

    from backend.models.bot import Bot
    from backend.models.payment import Payment

    total_users = db.query(User).count()
    total_bots = db.query(Bot).count()
    active_bots = db.query(Bot).filter(Bot.status == 'active').count()

    # Count users by plan
    plan_counts = {}
    for plan in ['free', 'basic', 'pro', 'enterprise']:
        plan_counts[plan] = db.query(User).filter(User.plan == plan).count()

    return {
        "total_users": total_users,
        "total_bots": total_bots,
        "active_bots": active_bots,
        "users_by_plan": plan_counts
    }
