"""
Challenge Engine

Motor de desafíos gamificados para CosmosLearn.
Gestiona lógica de validación, puntuación y progreso.
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from backend.src.models.challenges import (
    Challenge,
    ChallengeProgress,
    ChallengeObjective,
)


class ChallengeEngine:
    """Motor de desafíos de aprendizaje."""

    def __init__(self):
        self._active_challenges: Dict[str, Challenge] = {}
        self._user_progress: Dict[str, ChallengeProgress] = {}

    def validate_objective(
        self, challenge: Challenge, objective: ChallengeObjective, current_value: float
    ) -> bool:
        """
        Valida si un objetivo ha sido completado.

        Args:
            challenge: Desafío completo
            objective: Objetivo específico
            current_value: Valor actual del usuario

        Returns:
            True si el objetivo está completado
        """
        # TODO: Implementar lógica de validación según tipo de objetivo
        return current_value >= objective.target_value

    def calculate_score(
        self, challenge: Challenge, progress: ChallengeProgress, time_taken_seconds: int
    ) -> int:
        """
        Calcula puntuación final de un desafío.

        Factores:
        - Objetivos completados
        - Tiempo utilizado (bonus por rapidez)
        - Intentos necesarios

        Args:
            challenge: Desafío completado
            progress: Progreso del usuario
            time_taken_seconds: Tiempo en segundos

        Returns:
            Puntuación final
        """
        base_score = challenge.reward_points

        # Bonus por objetivos
        completed_count = len(progress.objectives_completed)
        total_objectives = len(challenge.objectives)

        if completed_count == total_objectives:
            base_score += 50  # Bonus de completitud

        # Bonus de tiempo (si aplica)
        if challenge.time_limit_seconds:
            time_bonus = max(0, challenge.time_limit_seconds - time_taken_seconds)
            base_score += time_bonus // 10

        # Penalización por intentos
        attempt_penalty = (progress.attempts - 1) * 10

        return max(0, base_score - attempt_penalty)

    def check_unlocks(self, challenge: Challenge, score: int) -> List[str]:
        """
        Determina qué algoritmos desbloquea completar el desafío.

        Args:
            challenge: Desafío completado
            score: Puntuación obtenida

        Returns:
            Lista de algoritmos desbloqueados
        """
        # Desbloquea si el score es suficiente
        if score >= challenge.reward_points * 0.7:  # 70% para desbloquear
            return challenge.unlocks_algorithms
        return []

    def generate_hint(
        self, challenge: Challenge, objective: ChallengeObjective
    ) -> Optional[str]:
        """Genera una pista para un objetivo específico."""
        # TODO: Implementar sistema de pistas contextual
        return None
