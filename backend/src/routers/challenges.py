"""
Challenges Router

Endpoints API para desafíos gamificados de aprendizaje.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from backend.src.models.challenges import Challenge, ChallengeProgress

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.get("/")
async def list_challenges(
    category: Optional[str] = None, difficulty: Optional[str] = None
):
    """Lista todos los desafíos disponibles, con filtros opcionales."""
    # TODO: Implementar listado con filtros
    return {"challenges": []}


@router.get("/{challenge_id}")
async def get_challenge(challenge_id: str):
    """Obtiene detalles de un desafío específico."""
    # TODO: Implementar carga de desafío
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/{challenge_id}/start")
async def start_challenge(challenge_id: str, user_id: str):
    """Inicia un desafío para un usuario."""
    # TODO: Implementar inicio de desafío
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/{challenge_id}/progress")
async def update_progress(
    challenge_id: str, user_id: str, objective_id: str, value: float
):
    """Actualiza el progreso en un objetivo del desafío."""
    # TODO: Implementar actualización de progreso
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/{challenge_id}/complete")
async def complete_challenge(challenge_id: str, user_id: str):
    """Marca un desafío como completado y calcula puntuación."""
    # TODO: Implementar completado y cálculo de score
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/{challenge_id}/leaderboard")
async def get_leaderboard(challenge_id: str, limit: int = 10):
    """Obtiene el leaderboard de un desafío."""
    # TODO: Implementar leaderboard
    return {"leaderboard": []}
