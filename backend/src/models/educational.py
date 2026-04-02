"""Educational content models for CosmosLearn."""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator


class TitleModel(BaseModel):
    """Bilingual title model."""

    scientific: str = Field(..., description="Scientific/title title")
    algorithmic: str = Field(..., description="Algorithmic/technical title")


class ComplexityModel(BaseModel):
    """Algorithmic complexity information."""

    time: str = Field(..., description="Time complexity (e.g., O(n²))")
    space: str = Field(..., description="Space complexity (e.g., O(1))")


class AlgorithmComparisonModel(BaseModel):
    """Comparison between two algorithms."""

    algorithm: str
    advantage: str
    disadvantage: str
    best_for: str


class AlgorithmParameterModel(BaseModel):
    """Algorithm parameter description."""

    name: str
    description: str
    range: str
    default: Optional[Any] = None


class ScientificContentModel(BaseModel):
    """Scientific/educational content section."""

    concept: str = Field(..., description="Core scientific concept explanation")
    analogy: str = Field(..., description="Relatable analogy for the concept")
    real_world_example: str = Field(..., description="Real-world application example")
    physics_formula: Optional[str] = Field(None, description="Relevant physics formula")
    references: List[str] = Field(
        default_factory=list, description="Academic references"
    )


class AlgorithmicContentModel(BaseModel):
    """Algorithmic/technical content section."""

    algorithm: str = Field(..., description="Name of the algorithm used")
    complexity: ComplexityModel = Field(..., description="Time and space complexity")
    why_this_algorithm: str = Field(..., description="Explanation of algorithm choice")
    comparison: List[AlgorithmComparisonModel] = Field(
        default_factory=list, description="Comparison with alternative algorithms"
    )
    pseudocode: Optional[str] = Field(None, description="Algorithm pseudocode")
    parameters: List[AlgorithmParameterModel] = Field(
        default_factory=list, description="Algorithm parameters"
    )


class EducationalContentModel(BaseModel):
    """Complete educational content for a feature."""

    id: str = Field(..., description="Unique identifier for the content")
    category: Literal["ocean", "atmosphere", "vegetation", "evolution"] = Field(
        ..., description="Content category"
    )
    title: TitleModel = Field(..., description="Bilingual titles")
    scientific: ScientificContentModel = Field(..., description="Scientific content")
    algorithmic: AlgorithmicContentModel = Field(..., description="Algorithmic content")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "ocean_waves",
                    "category": "ocean",
                    "title": {
                        "scientific": "Dinámica Oceánica",
                        "algorithmic": "Generación de Olas Procedurales",
                    },
                    "scientific": {
                        "concept": "Las olas oceánicas resultan de la superposición...",
                        "analogy": "Imagina lanzar piedras en un estanque...",
                        "real_world_example": "El Océano Pacífico muestra olas de ~15m...",
                        "physics_formula": "H = (U² × F) / g × tanh(2πd/L)",
                        "references": ["Kinsman, B. (1965). Wind Waves"],
                    },
                    "algorithmic": {
                        "algorithm": "Simplex Noise 3D",
                        "complexity": {"time": "O(n²) por sample", "space": "O(1)"},
                        "why_this_algorithm": "Simplex elimina patrones direccionales...",
                        "comparison": [],
                        "pseudocode": "function simplexNoise3D(...)",
                        "parameters": [],
                    },
                }
            ]
        }
    }


class ComparisonRequest(BaseModel):
    """Request model for algorithm comparison endpoint."""

    algorithms: List[str] = Field(
        ...,
        description="List of algorithm names to compare",
        min_length=2,
        max_length=5,
    )

    @field_validator("algorithms")
    @classmethod
    def validate_algorithms(cls, v: List[str]) -> List[str]:
        if len(v) < 2:
            raise ValueError("At least 2 algorithms are required for comparison")
        if len(v) > 5:
            raise ValueError("Maximum 5 algorithms can be compared at once")
        return v


class ComparisonResponse(BaseModel):
    """Response model for algorithm comparison."""

    algorithms: List[str] = Field(..., description="Algorithms being compared")
    comparisons: List[AlgorithmComparisonModel] = Field(
        ..., description="Detailed comparisons"
    )


class CatalogObjectSummary(BaseModel):
    """Summary of a catalog object."""

    id: str = Field(..., description="Object identifier")
    name: str = Field(..., description="Display name")
    type: str = Field(..., description="Object type/classification")


class CatalogListResponse(BaseModel):
    """Response for catalog listing endpoint."""

    objects: List[CatalogObjectSummary] = Field(
        ..., description="List of catalog objects"
    )


class PhysicalPropertiesModel(BaseModel):
    """Physical properties of an astronomical object."""

    mass_kg: Optional[float] = None
    radius_km: Optional[float] = None
    age_gyr: Optional[float] = None
    temperature_k: Optional[float] = None
    density_g_cm3: Optional[float] = None
    gravity_m_s2: Optional[float] = None


class VisualPropertiesModel(BaseModel):
    """Visual/render properties of an object."""

    color_hex: Optional[str] = None
    texture_type: Optional[str] = None
    brightness: Optional[float] = None
    apparent_magnitude: Optional[float] = None


class CatalogObjectDetail(BaseModel):
    """Detailed catalog object information."""

    id: str = Field(..., description="Object identifier")
    name: str = Field(..., description="Display name")
    type: str = Field(..., description="Object type/classification")
    description: str = Field(..., description="Detailed description")
    physical_properties: PhysicalPropertiesModel = Field(
        default_factory=PhysicalPropertiesModel
    )
    visual_properties: VisualPropertiesModel = Field(
        default_factory=VisualPropertiesModel
    )
    fun_facts: List[str] = Field(default_factory=list)
    educational_links: Dict[str, str] = Field(default_factory=dict)
