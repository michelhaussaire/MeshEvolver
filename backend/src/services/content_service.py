"""
Content Service

Servicio para cargar y gestionar contenido educativo desde archivos.
"""

import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from backend.src.models.educational import DualExplanation


class ContentService:
    """Servicio de gestión de contenido educativo."""

    CONTENT_PATH = Path("/home/michel/Work/Dev/MeshEvolver/content")

    @classmethod
    async def get_educational_content(
        cls, category: str, content_id: str, lang: str = "es"
    ) -> Optional[DualExplanation]:
        """
        Carga contenido educativo desde archivo JSON.

        Args:
            category: Categoría del contenido (ocean, atmosphere, etc.)
            content_id: Identificador del contenido
            lang: Código de idioma (es/en)

        Returns:
            DualExplanation o None si no existe
        """
        file_path = (
            cls.CONTENT_PATH / "education" / lang / category / f"{content_id}.json"
        )

        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # TODO: Convertir a modelo Pydantic
        return data

    @classmethod
    async def get_catalog_object(
        cls, object_type: str, object_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Carga objeto astronómico del catálogo.

        Args:
            object_type: Tipo de objeto (galaxies, planets)
            object_id: Identificador del objeto

        Returns:
            Datos del objeto o None
        """
        file_path = cls.CONTENT_PATH / "catalog" / object_type / f"{object_id}.json"

        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @classmethod
    async def list_content_by_category(
        cls, category: str, lang: str = "es"
    ) -> List[str]:
        """Lista todos los contenidos disponibles en una categoría."""
        category_path = cls.CONTENT_PATH / "education" / lang / category

        if not category_path.exists():
            return []

        return [f.stem for f in category_path.glob("*.json")]
