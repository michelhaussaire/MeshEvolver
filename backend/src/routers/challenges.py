"""
Challenges Router.
API endpoints for the challenge system.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import Field, field_validator

from src.models.challenges import (
    Challenge,
    ChallengeListItem,
    ChallengeProgress,
    ChallengeCompletion,
    LeaderboardEntry,
    ProgressUpdate,
    ProgressUpdateResponse,
)
from src.services.challenge_engine import ChallengeEngine
from src.config import ADMIN_TOKEN

# ID validation pattern: lowercase alphanumeric, underscore, hyphen
ID_PATTERN = r"^[a-z0-9_-]+$"
ID_MAX_LENGTH = 100


def validate_id(value: str, field_name: str) -> str:
    """Validate an ID against the allowed pattern and length."""
    import re

    if len(value) > ID_MAX_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} exceeds maximum length of {ID_MAX_LENGTH} characters",
        )
    if not re.match(ID_PATTERN, value):
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} contains invalid characters. Only lowercase alphanumeric, underscore, and hyphen are allowed",
        )
    return value


router = APIRouter(prefix="/challenges", tags=["challenges"])

# Initialize challenge engine (singleton)
challenge_engine = ChallengeEngine()


@router.get("/", response_model=list[ChallengeListItem])
async def list_challenges(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
):
    """
    List all challenges with optional filters.

    Args:
        category: Filter by challenge category
        difficulty: Filter by difficulty level

    Returns:
        List of challenge summaries
    """
    challenges = await challenge_engine.list_challenges(
        category=category,
        difficulty=difficulty,
    )

    return [
        ChallengeListItem(
            id=c.id,
            title=c.title,
            category=c.category,
            difficulty=c.difficulty,
            reward_points=c.reward_points,
            time_limit_seconds=c.time_limit_seconds,
            objectives_count=len(c.objectives),
        )
        for c in challenges
    ]


@router.get("/{challenge_id}", response_model=Challenge)
async def get_challenge(challenge_id: str):
    """
    Get detailed information about a challenge.

    Args:
        challenge_id: The unique challenge identifier

    Returns:
        Challenge details

    Raises:
        HTTPException: 404 if challenge not found, 400 if invalid ID format
    """
    challenge_id = validate_id(challenge_id, "challenge_id")
    challenge = await challenge_engine.get_challenge(challenge_id)

    if not challenge:
        raise HTTPException(
            status_code=404, detail=f"Challenge '{challenge_id}' not found"
        )

    return challenge


@router.post("/{challenge_id}/start", response_model=ChallengeProgress)
async def start_challenge(
    challenge_id: str,
    user_id: str = Query(..., description="User ID starting the challenge"),
):
    """
    Start a challenge for a user.

    Args:
        challenge_id: The challenge to start
        user_id: The user starting the challenge

    Returns:
        Initial challenge progress

    Raises:
        HTTPException: 404 if challenge not found, 400 if invalid ID format
    """
    challenge_id = validate_id(challenge_id, "challenge_id")
    user_id = validate_id(user_id, "user_id")
    challenge = await challenge_engine.get_challenge(challenge_id)

    if not challenge:
        raise HTTPException(
            status_code=404, detail=f"Challenge '{challenge_id}' not found"
        )

    try:
        progress = await challenge_engine.start_challenge(user_id, challenge_id)
        return progress
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{challenge_id}/progress", response_model=ProgressUpdateResponse)
async def update_progress(
    challenge_id: str,
    update: ProgressUpdate,
    user_id: str = Query(..., description="User ID updating progress"),
):
    """
    Update challenge progress with current parameter values.

    Args:
        challenge_id: The challenge being attempted
        update: Progress update containing current values
        user_id: The user updating progress

    Returns:
        Updated progress with objective status and hints

    Raises:
        HTTPException: 404 if challenge not found, 400 if invalid ID format
    """
    challenge_id = validate_id(challenge_id, "challenge_id")
    user_id = validate_id(user_id, "user_id")
    challenge = await challenge_engine.get_challenge(challenge_id)

    if not challenge:
        raise HTTPException(
            status_code=404, detail=f"Challenge '{challenge_id}' not found"
        )

    try:
        progress, objectives_status, hints = await challenge_engine.update_progress(
            user_id=user_id,
            challenge_id=challenge_id,
            current_values=update.current_values,
        )

        # Calculate completion percentage
        total_objectives = len(challenge.objectives)
        completed = len(progress.objectives_completed)
        completion_percentage = (
            (completed / total_objectives * 100) if total_objectives > 0 else 0
        )

        return ProgressUpdateResponse(
            progress=progress,
            objectives_status=objectives_status,
            hints=hints,
            completion_percentage=completion_percentage,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{challenge_id}/complete", response_model=ChallengeCompletion)
async def complete_challenge(
    challenge_id: str,
    user_id: str = Query(..., description="User ID completing the challenge"),
):
    """
    Attempt to complete a challenge.

    Args:
        challenge_id: The challenge to complete
        user_id: The user completing the challenge

    Returns:
        Completion result with score and unlocks

    Raises:
        HTTPException: 404 if challenge not found
        HTTPException: 400 if challenge not started or objectives incomplete, or invalid ID format
    """
    challenge_id = validate_id(challenge_id, "challenge_id")
    user_id = validate_id(user_id, "user_id")
    challenge = await challenge_engine.get_challenge(challenge_id)

    if not challenge:
        raise HTTPException(
            status_code=404, detail=f"Challenge '{challenge_id}' not found"
        )

    try:
        completion = await challenge_engine.complete_challenge(user_id, challenge_id)
        return completion
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{challenge_id}/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    challenge_id: str,
    limit: int = Query(10, ge=1, le=100, description="Number of entries to return"),
):
    """
    Get the leaderboard for a challenge.

    Args:
        challenge_id: The challenge to get leaderboard for
        limit: Maximum number of entries to return

    Returns:
        List of leaderboard entries sorted by score

    Raises:
        HTTPException: 404 if challenge not found, 400 if invalid ID format
    """
    challenge_id = validate_id(challenge_id, "challenge_id")
    challenge = await challenge_engine.get_challenge(challenge_id)

    if not challenge:
        raise HTTPException(
            status_code=404, detail=f"Challenge '{challenge_id}' not found"
        )

    leaderboard = await challenge_engine.get_leaderboard(challenge_id, limit=limit)
    return leaderboard


@router.post("/cache/invalidate")
async def invalidate_cache(
    x_admin_token: str = Header(..., description="Admin authentication token"),
):
    """
    Invalidate the challenges cache.
    Forces reload from filesystem on next request.

    Args:
        x_admin_token: Admin token for authentication

    Raises:
        HTTPException: 403 if authentication fails
    """
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token")
    challenge_engine.invalidate_cache()
    return {"message": "Cache invalidated"}
