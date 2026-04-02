"""
Education Router

Endpoints API para contenido educativo de CosmosLearn.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Literal
from backend.src.models.educational import DualExplanation, AlgorithmType

router = APIRouter(prefix="/education", tags=["education"])


@router.get("/content/{category}/{content_id}")
async def get_educational_content(
    category: Literal["ocean", "atmosphere", "vegetation", "evolution"],
    content_id: str,
    lang: Literal["es", "en"] = "es",
):
    """
    Obtiene contenido educativo dual (científico + algorítmico).

    - **category**: Categoría del contenido
    - **content_id**: Identificador único del contenido
    - **lang**: Idioma (es/español, en/inglés)
    """
    # TODO: Implementar carga desde archivos JSON
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/algorithms")
async def list_algorithms():
    """Lista todos los algoritmos de generación procedural disponibles."""
    return {
        "algorithms": [
            {"id": "perlin", "name": "Perlin Noise", "type": "gradient"},
            {"id": "simplex", "name": "Simplex Noise", "type": "gradient"},
            {"id": "worley_f1", "name": "Worley F1", "type": "cellular"},
            {"id": "worley_f2_f1", "name": "Worley F2-F1", "type": "cellular"},
            {"id": "fbm", "name": "Fractal Brownian Motion", "type": "fractal"},
        ]
    }


@router.get("/algorithms/{algorithm_id}/compare")
async def compare_algorithms(
    algorithm_id: str, compare_with: List[str] = Query(default=[])
):
    """Compara un algoritmo con otros algoritmos relacionados."""
    # TODO: Implementar comparación
    raise HTTPException(status_code=501, detail="Not implemented")
