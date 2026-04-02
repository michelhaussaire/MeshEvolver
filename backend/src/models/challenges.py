"""
Challenge Models

Modelos Pydantic para desafíos de aprendizaje gamificados.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class ChallengeObjective(BaseModel):
    """Objetivo individual dentro de un desafío."""

    id: str
    description: str
    target_value: float
    current_value: float = 0.0
    completed: bool = False


class Challenge(BaseModel):
    """Desafío de aprendizaje gamificado."""

    id: str
    title: str
    description: str
    category: Literal[
        "exoplanet_hunting", "galaxy_crafting", "terrain_generation", "climate_modeling"
    ]
    difficulty: Literal["beginner", "intermediate", "advanced", "expert"]
    objectives: List[ChallengeObjective]
    time_limit_seconds: Optional[int] = None
    reward_points: int = 100
    unlocks_algorithms: List[str] = []
    required_algorithms: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChallengeProgress(BaseModel):
    """Progreso de un usuario en un desafío."""

    challenge_id: str
    user_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    score: int = 0
    objectives_completed: List[str] = []
    attempts: int = 1


class LeaderboardEntry(BaseModel):
    """Entrada en el leaderboard de desafíos."""

    user_id: str
    username: str
    challenge_id: str
    score: int
    time_seconds: int
    completed_at: datetime
