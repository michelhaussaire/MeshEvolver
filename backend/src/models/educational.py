from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum


class AlgorithmType(str, Enum):
    PERLIN = "perlin"
    SIMPLEX = "simplex"
    WORLEY_F1 = "worley_f1"
    WORLEY_F2_F1 = "worley_f2_f1"
    FBM = "fbm"
    RIDGED_MULTI = "ridged_multi"


class ScientificExplanation(BaseModel):
    concept: str
    analogy: str
    real_world_example: str
    physics_formula: Optional[str] = None
    references: List[str] = []


class AlgorithmicExplanation(BaseModel):
    algorithm: str
    complexity_time: str
    complexity_space: str
    why_this_algorithm: str
    pseudocode: str
    parameters: List[dict] = []


class DualExplanation(BaseModel):
    """Modelo para explicaciones duales científica/algortítmica."""

    id: str
    category: str
    scientific: ScientificExplanation
    algorithmic: AlgorithmicExplanation
    related_algorithms: List[AlgorithmType] = []
