"""
Models for the Challenge System.
CosmosLearn - Gamified Astronomy Learning Platform
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
from enum import Enum


class ValidationType(str, Enum):
    """Types of objective validation."""

    PARAMETER_MATCH = "parameter_match"
    THRESHOLD = "threshold"
    RANGE = "range"


class ChallengeObjective(BaseModel):
    """A single objective within a challenge."""

    id: str = Field(..., description="Unique identifier for the objective")
    description: str = Field(..., description="Human-readable description")
    target_value: Optional[float] = Field(
        None, description="Target value for parameter_match or threshold"
    )
    validation_type: ValidationType = Field(
        ..., description="Type of validation to perform"
    )
    tolerance: Optional[float] = Field(
        None, description="Tolerance for parameter_match validation"
    )
    target_min: Optional[float] = Field(
        None, description="Minimum value for range validation"
    )
    target_max: Optional[float] = Field(
        None, description="Maximum value for range validation"
    )
    hint_template: Optional[str] = Field(
        None, description="Template for generating hints"
    )


class Challenge(BaseModel):
    """A challenge definition loaded from JSON."""

    id: str = Field(..., description="Unique challenge identifier")
    title: str = Field(..., description="Challenge title")
    description: str = Field(..., description="Challenge description")
    category: str = Field(..., description="Challenge category")
    difficulty: Literal["beginner", "intermediate", "advanced", "expert"] = Field(
        ..., description="Difficulty level"
    )
    objectives: List[ChallengeObjective] = Field(
        ..., description="List of objectives to complete"
    )
    time_limit_seconds: Optional[int] = Field(None, description="Time limit in seconds")
    reward_points: int = Field(..., description="Points awarded on completion")
    unlocks_algorithms: List[str] = Field(
        default_factory=list, description="Algorithms unlocked on completion"
    )
    required_algorithms: List[str] = Field(
        default_factory=list, description="Algorithms required to attempt"
    )
    hints: List[str] = Field(
        default_factory=list, description="General hints for the challenge"
    )


class ChallengeProgress(BaseModel):
    """Tracks a user's progress on a challenge."""

    user_id: str = Field(..., description="User identifier")
    challenge_id: str = Field(..., description="Challenge identifier")
    started_at: datetime = Field(..., description="When the challenge was started")
    completed_at: Optional[datetime] = Field(
        None, description="When the challenge was completed"
    )
    objectives_completed: List[str] = Field(
        default_factory=list, description="IDs of completed objectives"
    )
    current_values: Dict[str, Any] = Field(
        default_factory=dict, description="Current parameter values"
    )
    score: int = Field(default=0, description="Current score")
    attempts: int = Field(default=0, description="Number of attempts")


class LeaderboardEntry(BaseModel):
    """An entry in the challenge leaderboard."""

    user_id: str = Field(..., description="User identifier")
    username: str = Field(..., description="Display username")
    score: int = Field(..., description="Score achieved")
    time_taken_seconds: int = Field(..., description="Time taken to complete")
    completed_at: datetime = Field(..., description="When completed")


class ChallengeCompletion(BaseModel):
    """Result of completing a challenge."""

    success: bool = Field(..., description="Whether the challenge was completed")
    score: int = Field(..., description="Final score")
    objectives_completed: List[str] = Field(
        ..., description="IDs of completed objectives"
    )
    unlocks: List[str] = Field(default_factory=list, description="Algorithms unlocked")
    time_taken_seconds: int = Field(..., description="Time taken")
    bonus_points: int = Field(default=0, description="Bonus points awarded")


class ChallengeListItem(BaseModel):
    """Summary of a challenge for listing."""

    id: str
    title: str
    category: str
    difficulty: str
    reward_points: int
    time_limit_seconds: Optional[int]
    objectives_count: int


class ProgressUpdate(BaseModel):
    """Request body for updating progress."""

    current_values: Dict[str, Any] = Field(..., description="Current parameter values")


class ProgressUpdateResponse(BaseModel):
    """Response for progress update."""

    progress: ChallengeProgress
    objectives_status: Dict[str, bool]
    hints: List[str]
    completion_percentage: float
