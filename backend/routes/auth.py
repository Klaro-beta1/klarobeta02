from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    AuthResponse,
    UserResponse,
    LogoutResponse
)
from backend.models.user import User
from backend.utils.database import get_db
from backend.utils.auth import hash_password, verify_password, create_access_token
from backend.config import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with email and password"""

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Determine plan - Enterprise for admin email, Free for others
    plan = "enterprise" if request.email == settings.ADMIN_EMAIL else "free"
    credits = 100 if plan == "enterprise" else 2

    # Create new user
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        full_name=request.full_name,
        plan=plan,
        credits_remaining=credits,
        google_id=None
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate JWT token
    token = create_access_token({"sub": str(user.id), "email": user.email})

    return AuthResponse(
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            plan=user.plan,
            credits_remaining=user.credits_remaining,
            created_at=user.created_at
        ),
        token=token
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""

    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user has password (not OAuth-only account)
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please sign in with Google"
        )

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT token
    token = create_access_token({"sub": str(user.id), "email": user.email})

    return AuthResponse(
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            plan=user.plan,
            credits_remaining=user.credits_remaining,
            created_at=user.created_at
        ),
        token=token
    )


@router.post("/google", response_model=AuthResponse)
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth"""

    try:
        # Verify Google token
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth is not configured"
            )

        idinfo = id_token.verify_oauth2_token(
            request.google_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Extract user info from Google
        google_id = idinfo['sub']
        email = idinfo['email']
        full_name = idinfo.get('name')

        # Check if user exists by Google ID
        user = db.query(User).filter(User.google_id == google_id).first()

        if user:
            # Existing Google user - login
            token = create_access_token({"sub": str(user.id), "email": user.email})

            return AuthResponse(
                user=UserResponse(
                    id=str(user.id),
                    email=user.email,
                    full_name=user.full_name,
                    plan=user.plan,
                    credits_remaining=user.credits_remaining,
                    created_at=user.created_at
                ),
                token=token
            )

        # Check if email exists (link to existing account)
        user = db.query(User).filter(User.email == email).first()

        if user:
            # Link Google ID to existing account
            user.google_id = google_id
            if not user.full_name:
                user.full_name = full_name
            db.commit()
            db.refresh(user)
        else:
            # Create new user
            plan = "enterprise" if email == settings.ADMIN_EMAIL else "free"
            credits = 100 if plan == "enterprise" else 2

            user = User(
                email=email,
                google_id=google_id,
                full_name=full_name,
                password_hash=None,  # OAuth user has no password
                plan=plan,
                credits_remaining=credits
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate JWT token
        token = create_access_token({"sub": str(user.id), "email": user.email})

        status_code = status.HTTP_201_CREATED if not user.google_id else status.HTTP_200_OK

        return AuthResponse(
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                plan=user.plan,
                credits_remaining=user.credits_remaining,
                created_at=user.created_at
            ),
            token=token
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google authentication"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed. Please try again."
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout():
    """Logout user (client-side token removal)"""
    # For MVP, we're not tracking tokens server-side
    # Client should remove token from storage
    return LogoutResponse(message="Logged out successfully")
