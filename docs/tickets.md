# 📋 CosmosLearn - Tickets de Implementación

> **Proyecto:** CosmosLearn - Plataforma de Aprendizaje Gamificada sobre Astronomía  
> **Fecha:** Abril 2026  
> **Versión:** 1.0.0  
> **Total Tickets:** 8  

---

## 📊 Resumen de Tickets

| ID | Ticket | Branch | Story Points | Dificultad | Dependencias |
|----|--------|--------|--------------|------------|--------------|
| CL-001 | Algorithm Registry en Rust | `feature/CL-001-algorithm-registry-rust` | 8 | Alta | Ninguna |
| CL-002 | Educational Content API | `feature/CL-002-educational-content-api` | 5 | Media | CL-001 |
| CL-003 | Dual Explanation UI | `feature/CL-003-dual-explanation-ui` | 5 | Media | CL-002 |
| CL-004 | Challenge System Backend | `feature/CL-004-challenge-system` | 8 | Alta | CL-001, CL-002 |
| CL-005 | Real Objects Catalog | `feature/CL-005-real-objects-catalog` | 5 | Baja | CL-002 |
| CL-006 | Ocean Shaders | `feature/CL-006-ocean-shaders` | 8 | Alta | CL-003 |
| CL-007 | Vegetation System | `feature/CL-007-vegetation-system` | 8 | Alta | CL-001 |
| CL-008 | Discovery Mode | `feature/CL-008-discovery-mode` | 13 | Alta | CL-003, CL-004, CL-005 |

---

## 🗺️ Diagrama de Dependencias

```
┌──────────────────────────────────────────────────────────────────────┐
│                          TICKET-CL-001                               │
│                 Algorithm Registry en Rust                           │
│                    (Base del sistema)                                │
└─────────────┬────────────────────┬───────────────────────────────────┘
              │                    │
              ▼                    ▼
┌──────────────────────┐  ┌──────────────────────────────────────────┐
│     CL-002           │  │              CL-007                       │
│  Educational API     │  │  Vegetation System (Worley Noise)        │
└─────────┬────────────┘  └──────────────────────────────────────────┘
          │
    ┌─────┼─────┬────────┐
    ▼     ▼     ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ CL-003 │ │ CL-004 │ │ CL-005 │ │ CL-008 │
│Dual UI │ │Challenges│Catalog │ │Discovery│
└────┬───┘ └───┬────┘ └────────┘ └────┬───┘
     │         │                       │
     └─────────┼───────────────────────┘
               ▼
     ┌───────────────────┐
     │     CL-006        │
     │   Ocean Shaders   │
     │  (Integración)    │
     └───────────────────┘
```

---

# TICKET-CL-001: Algorithm Registry en Rust

## Branch
`feature/CL-001-algorithm-registry-rust`

## Descripción
Implementar un registro unificado de algoritmos de ruido en Rust que soporte múltiples técnicas de generación procedural. Este ticket establece la base del motor de ruido de CosmosLearn, permitiendo seleccionar dinámicamente entre diferentes algoritmos (Perlin, Simplex, Worley, fBm) mediante un enum expuesto a Python vía PyO3.

## Criterios de Aceptación (Definition of Done)
- [ ] Enum `AlgorithmType` definido en Rust con variantes: Perlin, Simplex, WorleyF1, WorleyF2F1, Fbm
- [ ] Función `generate_with_algorithm()` expuesta a Python vía PyO3
- [ ] Implementación de Simplex Noise 3D funcional
- [ ] Implementación de Worley Noise (F1 y F2-F1) funcional
- [ ] Función genérica fbm que trabaje con cualquier implementación de NoiseFn
- [ ] Tests unitarios para cada algoritmo con ≥90% coverage
- [ ] Benchmark de performance (comparar tiempo de ejecución entre algoritmos)
- [ ] Documentación de complejidad temporal O(n) para cada algoritmo
- [ ] Funciones de utilidad expuestas a Python para obtener lista de algoritmos disponibles

## Archivos a Modificar/Crear

### Modificar
- `rust_core/src/lib.rs` - Agregar exposición PyO3 del enum y funciones
- `rust_core/src/noise/mod.rs` - Estructurar módulo de ruido
- `rust_core/Cargo.toml` - Agregar dependencias necesarias (noise-rs)

### Crear
- `rust_core/src/noise/perlin.rs` - Wrappers y utilidades para Perlin
- `rust_core/src/noise/simplex.rs` - Implementación Simplex Noise
- `rust_core/src/noise/worley.rs` - Implementación Worley/Voronoi Noise
- `rust_core/src/noise/fbm.rs` - Implementación genérica fBm
- `rust_core/src/noise/algorithm.rs` - Definición del enum AlgorithmType
- `rust_core/tests/test_algorithms.rs` - Tests unitarios

## Dependencias
- **Ninguna** (ticket base del sistema)

## Notas Técnicas

### Enum AlgorithmType
```rust
#[pyclass]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum AlgorithmType {
    Perlin,
    Simplex,
    WorleyF1,
    WorleyF2F1,
    Fbm,
}
```

### Función Principal
```rust
#[pyfunction]
pub fn generate_with_algorithm(
    algorithm: AlgorithmType,
    x: f64,
    y: f64,
    z: f64,
    seed: u32,
    octaves: usize,
    persistence: f64,
    lacunarity: f64,
) -> PyResult<f64> {
    let value = match algorithm {
        AlgorithmType::Perlin => generate_perlin(x, y, z, seed, octaves, persistence, lacunarity),
        AlgorithmType::Simplex => generate_simplex(x, y, z, seed, octaves, persistence, lacunarity),
        AlgorithmType::WorleyF1 => generate_worley_f1(x, y, z, seed),
        AlgorithmType::WorleyF2F1 => generate_worley_f2_minus_f1(x, y, z, seed),
        AlgorithmType::Fbm => generate_fbm(algorithm, x, y, z, seed, octaves, persistence, lacunarity),
    };
    Ok(value)
}
```

### Implementación Simplex
- Usar la librería `noise-rs` para la implementación base
- Implementar wrapper que soporte fBm (Fractal Brownian Motion)
- Fórmula fBm: `sum(octave: 1..n) [ persistence^octave * noise(lacunarity^octave * point) ]`

### Implementación Worley
- Basarse en diagramas de Voronoi
- F1: distancia al punto más cercano
- F2-F1: diferencia entre segunda y primera distancia (para crear bordes celulares)
- Complejidad: O(k) donde k = cantidad de puntos de特征 por celda

### Complejidades Documentadas
| Algoritmo | Complejidad Temporal | Complejidad Espacial |
|-----------|---------------------|---------------------|
| Perlin    | O(1) por sample     | O(1)                |
| Simplex   | O(1) por sample     | O(1)                |
| Worley F1 | O(k) por sample     | O(k) por celda      |
| Worley F2-F1 | O(k) por sample  | O(k) por celda      |
| fBm       | O(n × m) donde n=octaves, m=algoritmo base | O(1) |

## Estimación
- **Story Points:** 8
- **Dificultad:** Alta
- **Riesgos:** Implementación Worley puede ser compleja; requiere comprensión de diagramas Voronoi

---

# TICKET-CL-002: Educational Content API

## Branch
`feature/CL-002-educational-content-api`

## Descripción
Crear endpoints FastAPI para servir contenido educativo dual (explicaciones científicas + algorítmicas). El sistema debe cargar contenido desde archivos JSON del filesystem, soportar internacionalización (i18n) en español e inglés, y permitir comparaciones entre diferentes algoritmos.

## Criterios de Aceptación (Definition of Done)
- [ ] Modelo Pydantic `DualExplanation` definido con todas las propiedades del esquema
- [ ] Modelo Pydantic `ScientificExplanation` y `AlgorithmicExplanation` 
- [ ] Endpoint `GET /api/v2/education/{category}/{feature_id}` funcionando
- [ ] Endpoint `GET /api/v2/education/compare?algorithms=perlin,simplex,worley` funcionando
- [ ] Sistema de carga de JSON desde filesystem con caché en memoria
- [ ] Middleware i18n que detecte idioma desde header `Accept-Language`
- [ ] Respuesta 404 con mensaje descriptivo si contenido no existe
- [ ] Validación de parámetros de query con mensajes de error claros
- [ ] Tests de integración para ambos endpoints
- [ ] Documentación OpenAPI/Swagger actualizada

## Archivos a Modificar/Crear

### Crear
- `backend/src/models/educational.py` - Modelos Pydantic
- `backend/src/routers/education.py` - Endpoints FastAPI
- `backend/src/services/content_service.py` - Lógica de negocio y carga de contenido
- `backend/src/middleware/i18n.py` - Middleware de internacionalización
- `backend/tests/test_education_api.py` - Tests de integración

### Modificar
- `backend/src/main.py` - Registrar router de educación
- `backend/src/models/__init__.py` - Exportar nuevos modelos
- `backend/requirements.txt` - Agregar dependencias si es necesario

## Dependencias
- **TICKET-CL-001** - Necesita el enum `AlgorithmType` para las comparaciones

## Notas Técnicas

### Modelos Pydantic

```python
class ScientificExplanation(BaseModel):
    concept: str
    analogy: str
    real_world_example: str
    physics_formula: Optional[str] = None

class ComplexityInfo(BaseModel):
    time: str  # Ej: "O(n^2)", "O(1)"
    space: str

class AlgorithmicExplanation(BaseModel):
    algorithm: str
    complexity: ComplexityInfo
    why_this_algorithm: str
    comparison: Dict[str, str]  # {"perlin": "Más lento que Simplex...", ...}
    pseudocode: str
    parameters: List[Dict[str, Any]]

class DualExplanation(BaseModel):
    id: str
    category: str  # ocean, atmosphere, vegetation, evolution
    title: Dict[str, str]  # {"scientific": "...", "algorithmic": "..."}
    scientific: ScientificExplanation
    algorithmic: AlgorithmicExplanation
    related_algorithms: List[str]
    difficulty_level: int  # 1-5
```

### Estructura de Archivos de Contenido
```
content/education/
├── es/
│   └── ocean/
│       └── ocean_waves.json
└── en/
    └── ocean/
        └── ocean_waves.json
```

### Implementación ContentService
```python
class ContentService:
    def __init__(self, content_path: str = "content/education"):
        self.content_path = Path(content_path)
        self._cache: Dict[str, DualExplanation] = {}
    
    async def get_explanation(
        self, 
        category: str, 
        feature_id: str, 
        locale: str = "es"
    ) -> Optional[DualExplanation]:
        cache_key = f"{locale}/{category}/{feature_id}"
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        file_path = self.content_path / locale / category / f"{feature_id}.json"
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        explanation = DualExplanation(**data)
        self._cache[cache_key] = explanation
        return explanation
```

### Middleware i18n
```python
class I18nMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        accept_language = request.headers.get("Accept-Language", "es")
        # Parsear header: "es-ES,es;q=0.9,en;q=0.8"
        locale = self._parse_locale(accept_language)
        request.state.locale = locale
        response = await call_next(request)
        return response
```

### Endpoint Compare
El endpoint `/api/v2/education/compare` debe:
1. Aceptar parámetro `algorithms` como lista separada por comas
2. Cargar contenido educativo para cada algoritmo
3. Retornar comparación estructurada con:
   - Nombre de cada algoritmo
   - Complejidad temporal
   - Casos de uso ideales
   - Fortalezas y debilidades

## Estimación
- **Story Points:** 5
- **Dificultad:** Media
- **Riesgos:** Sistema de caché puede requerir ajustes según volumen de contenido

---

# TICKET-CL-003: Dual Explanation UI

## Branch
`feature/CL-003-dual-explanation-ui`

## Descripción
Desarrollar componentes React para mostrar explicaciones duales (científica + algorítmica) de forma interactiva. El componente principal debe permitir alternar entre vistas, mostrar tooltips educativos con delay de hover, y un selector de algoritmos con preview visual en tiempo real.

## Criterios de Aceptación (Definition of Done)
- [ ] Componente `DualExplanation` con diseño de tabs o acordeón
- [ ] Tab "Científico" mostrando concepto, analogía y ejemplo real
- [ ] Tab "Algorítmico" mostrando algoritmo, pseudocódigo y parámetros
- [ ] Componente `TooltipEducational` con delay configurable (default: 500ms)
- [ ] `AlgorithmSelector` con dropdown y mini-preview del ruido generado
- [ ] Hook `useEducationalContent` con React Query para fetching
- [ ] Soporte de tema oscuro/claro (usando Tailwind CSS v4)
- [ ] Animaciones suaves al cambiar entre tabs
- [ ] Tests unitarios con React Testing Library
- [ ] Storybook stories para cada componente (opcional pero recomendado)

## Archivos a Modificar/Crear

### Crear
- `frontend/src/components/education/DualExplanation.tsx` - Componente principal
- `frontend/src/components/education/AlgorithmSelector.tsx` - Selector con preview
- `frontend/src/components/education/TooltipEducational.tsx` - Tooltip con delay
- `frontend/src/components/education/AlgorithmComparison.tsx` - Comparación lado a lado
- `frontend/src/hooks/useEducationalContent.ts` - Hook de fetching
- `frontend/src/hooks/useAlgorithmPreview.ts` - Hook para generar preview
- `frontend/src/types/education.ts` - Interfaces TypeScript
- `frontend/src/components/education/__tests__/DualExplanation.test.tsx`

### Modificar
- `frontend/src/components/index.ts` - Exportar nuevos componentes
- `frontend/tailwind.config.ts` - Asegurar colores de tema educativo

## Dependencias
- **TICKET-CL-002** - Necesita los endpoints de la API educativa

## Notas Técnicas

### Interfaz DualExplanation Props
```typescript
interface DualExplanationProps {
  category: string;           // ej: "ocean"
  featureId: string;          // ej: "ocean_waves"
  locale?: string;            // default: "es"
  defaultTab?: 'scientific' | 'algorithmic';
  onAlgorithmChange?: (algorithm: string) => void;
  className?: string;
}
```

### Implementación DualExplanation
```tsx
export const DualExplanation: React.FC<DualExplanationProps> = ({
  category,
  featureId,
  locale = 'es',
  defaultTab = 'scientific',
  onAlgorithmChange,
}) => {
  const { data, isLoading, error } = useEducationalContent(category, featureId, locale);
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (isLoading) return <Skeleton dualExplanation />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return (
    <div className="dual-explanation-container">
      <TabGroup selectedIndex={activeTab} onChange={setActiveTab}>
        <TabList className="flex space-x-2">
          <Tab className="tab-scientific">
            🔬 {data.title.scientific}
          </Tab>
          <Tab className="tab-algorithmic">
            ⚙️ {data.title.algorithmic}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ScientificContent content={data.scientific} />
          </TabPanel>
          <TabPanel>
            <AlgorithmicContent 
              content={data.algorithmic} 
              onAlgorithmChange={onAlgorithmChange}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};
```

### TooltipEducational con Delay
```tsx
export const TooltipEducational: React.FC<TooltipProps> = ({
  children,
  content,
  delay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div 
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className="tooltip-content">
          {content}
        </div>
      )}
    </div>
  );
};
```

### AlgorithmSelector con Preview
```tsx
export const AlgorithmSelector: React.FC<SelectorProps> = ({
  algorithms,
  selected,
  onSelect,
}) => {
  const [previewAlgorithm, setPreviewAlgorithm] = useState<string | null>(null);
  
  return (
    <div className="algorithm-selector">
      <select 
        value={selected} 
        onChange={(e) => onSelect(e.target.value)}
      >
        {algorithms.map(algo => (
          <option key={algo.id} value={algo.id}>
            {algo.name}
          </option>
        ))}
      </select>
      
      <div className="algorithm-preview">
        <NoisePreviewCanvas 
          algorithm={previewAlgorithm || selected}
          width={150}
          height={150}
        />
      </div>
    </div>
  );
};
```

### Hook useEducationalContent
```typescript
export const useEducationalContent = (
  category: string,
  featureId: string,
  locale: string = 'es'
) => {
  return useQuery({
    queryKey: ['education', category, featureId, locale],
    queryFn: async () => {
      const response = await fetch(
        `/api/v2/education/${category}/${featureId}?locale=${locale}`
      );
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json() as Promise<DualExplanationData>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

### Estilos Tailwind Sugeridos
```css
.dual-explanation-container {
  @apply bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6;
}

.tab-scientific, .tab-algorithmic {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
  @apply data-[selected]:bg-blue-500 data-[selected]:text-white;
  @apply hover:bg-gray-100 dark:hover:bg-gray-800;
}

.tooltip-content {
  @apply absolute z-50 p-3 bg-gray-800 text-white text-sm rounded-lg;
  @apply max-w-xs shadow-xl;
  @apply animate-fade-in;
}
```

## Estimación
- **Story Points:** 5
- **Dificultad:** Media
- **Riesgos:** Preview en tiempo real puede requerir optimización (throttling)

---

# TICKET-CL-004: Challenge System Backend

## Branch
`feature/CL-004-challenge-system`

## Descripción
Implementar un sistema completo de desafíos gamificados que permita definir misiones con objetivos específicos, validar intentos de los usuarios, y otorgar recompensas (XP, badges). El sistema debe incluir un motor de validación configurable que pueda evaluar diferentes tipos de criterios.

## Criterios de Aceptación (Definition of Done)
- [ ] Modelos Pydantic `Challenge`, `SuccessCriterion`, `ChallengeAttempt`, `Reward`
- [ ] Endpoint `GET /api/v2/challenges` con filtros por dificultad y categoría
- [ ] Endpoint `GET /api/v2/challenges/{challenge_id}` con detalle completo
- [ ] Endpoint `POST /api/v2/challenges/{challenge_id}/validate` que procese intentos
- [ ] Motor de validación `ChallengeEngine` que evalúe criterios de éxito
- [ ] Sistema de puntuación basado en: precisión, tiempo, eficiencia
- [ ] Sistema de recompensas con XP y badges
- [ ] Validación de restricciones (algoritmos permitidos, max iteraciones)
- [ ] Tests unitarios del ChallengeEngine (≥90% coverage)
- [ ] Tests de integración para endpoints de desafíos

## Archivos a Modificar/Crear

### Crear
- `backend/src/models/challenges.py` - Modelos Pydantic
- `backend/src/routers/challenges.py` - Endpoints FastAPI
- `backend/src/services/challenge_engine.py` - Motor de validación
- `backend/src/services/reward_service.py` - Gestión de recompensas
- `backend/src/models/rewards.py` - Modelos de recompensas
- `backend/tests/test_challenge_engine.py` - Tests unitarios
- `backend/tests/test_challenges_api.py` - Tests de integración

### Modificar
- `backend/src/main.py` - Registrar router de desafíos
- `backend/src/models/__init__.py` - Exportar nuevos modelos

## Dependencias
- **TICKET-CL-001** - Necesita el enum AlgorithmType para validaciones
- **TICKET-CL-002** - Patrón similar de carga de contenido desde JSON

## Notas Técnicas

### Modelos Pydantic

```python
class SuccessCriterion(BaseModel):
    type: str  # "parameter_match", "visual_similarity", "time_limit", "iteration_limit"
    parameter: Optional[str] = None  # ej: "noise.frequency"
    target_value: Optional[float] = None
    tolerance: Optional[float] = 0.05  # ±5% por defecto
    weight: float = 1.0  # Peso en la puntuación total

class Constraint(BaseModel):
    type: str  # "allowed_algorithms", "max_iterations", "time_limit"
    value: Union[List[str], int, float]

class Reward(BaseModel):
    xp: int
    badges: List[str] = []
    unlocks: List[str] = []  # IDs de desafíos o características desbloqueadas

class Challenge(BaseModel):
    id: str
    module_id: str
    difficulty: int  # 1-5
    title: Dict[str, str]  # i18n
    description: Dict[str, str]
    learning_objectives: List[str]
    scenario: Dict[str, Any]
    objective: Dict[str, Any]
    constraints: List[Constraint]
    success_criteria: List[SuccessCriterion]
    rewards: Reward
    hints: List[Dict[str, Any]] = []

class ChallengeAttempt(BaseModel):
    challenge_id: str
    user_id: str
    parameters: Dict[str, Any]  # Parámetros usados por el usuario
    algorithm: str
    iterations: int
    elapsed_time_ms: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

### Motor de Validación

```python
class ChallengeEngine:
    def __init__(self):
        self.validators = {
            "parameter_match": self._validate_parameter_match,
            "visual_similarity": self._validate_visual_similarity,
            "time_limit": self._validate_time_limit,
            "iteration_limit": self._validate_iteration_limit,
        }
    
    async def validate_attempt(
        self, 
        challenge: Challenge, 
        attempt: ChallengeAttempt
    ) -> ValidationResult:
        results = []
        total_score = 0
        max_score = sum(c.weight for c in challenge.success_criteria)
        
        for criterion in challenge.success_criteria:
            validator = self.validators.get(criterion.type)
            if not validator:
                raise ValueError(f"Unknown criterion type: {criterion.type}")
            
            result = await validator(criterion, attempt, challenge)
            results.append(result)
            if result.passed:
                total_score += criterion.weight * result.accuracy
        
        # Validar restricciones
        constraint_violations = self._check_constraints(challenge, attempt)
        
        success = all(r.passed for r in results) and not constraint_violations
        
        return ValidationResult(
            success=success,
            score=int((total_score / max_score) * 100) if max_score > 0 else 0,
            criteria_results=results,
            constraint_violations=constraint_violations,
            rewards=challenge.rewards if success else None
        )
    
    async def _validate_parameter_match(
        self, 
        criterion: SuccessCriterion, 
        attempt: ChallengeAttempt,
        challenge: Challenge
    ) -> CriterionResult:
        # Extraer valor del parámetro anidado (ej: "noise.frequency")
        actual_value = self._get_nested_value(attempt.parameters, criterion.parameter)
        target = criterion.target_value
        tolerance = criterion.tolerance
        
        difference = abs(actual_value - target) / target if target != 0 else abs(actual_value)
        passed = difference <= tolerance
        accuracy = max(0, 1 - difference)
        
        return CriterionResult(
            criterion_type=criterion.type,
            passed=passed,
            accuracy=accuracy,
            message=f"Expected {target}, got {actual_value} (tolerance: ±{tolerance*100}%)"
        )
```

### Sistema de Puntuación

```python
class ScoringService:
    def calculate_score(
        self, 
        base_score: int,
        time_ms: int,
        time_limit_ms: Optional[int],
        iterations: int,
        max_iterations: Optional[int]
    ) -> int:
        score = base_score
        
        # Bonus por velocidad (hasta 50% extra)
        if time_limit_ms:
            time_ratio = 1 - (time_ms / time_limit_ms)
            if time_ratio > 0:
                score += int(base_score * time_ratio * 0.5)
        
        # Bonus por eficiencia (menos iteraciones = más puntos)
        if max_iterations:
            efficiency = 1 - (iterations / max_iterations)
            score += int(base_score * efficiency * 0.3)
        
        return min(score, base_score * 2)  # Máximo 2x
```

### Ejemplo de Flujo de Validación

```python
# POST /api/v2/challenges/habitable_planet_101/validate
{
  "user_id": "user_123",
  "parameters": {
    "noise": {
      "algorithm": "simplex",
      "frequency": 0.05,
      "octaves": 4
    },
    "temperature": 288,
    "water_coverage": 0.71
  },
  "algorithm": "simplex",
  "iterations": 3,
  "elapsed_time_ms": 45000
}

# Response
{
  "success": true,
  "score": 95,
  "criteria_results": [
    {
      "type": "parameter_match",
      "passed": true,
      "accuracy": 0.98,
      "message": "Water coverage within tolerance"
    },
    {
      "type": "parameter_match", 
      "passed": true,
      "accuracy": 0.95,
      "message": "Temperature within habitable zone"
    }
  ],
  "rewards": {
    "xp": 150,
    "badges": ["exoplanet_hunter_novice"],
    "unlocks": ["gas_giant_hunter"]
  }
}
```

## Estimación
- **Story Points:** 8
- **Dificultad:** Alta
- **Riesgos:** Motor de validación puede volverse complejo; requiere diseño extensible

---

# TICKET-CL-005: Real Objects Catalog

## Branch
`feature/CL-005-real-objects-catalog`

## Descripción
Poblar el catálogo de CosmosLearn con objetos astronómicos reales documentados científicamente. Cada objeto debe incluir propiedades físicas verificadas, parámetros de genoma para recreación procedural, y contenido educativo relacionado. Los datos deben ser precisos y citar fuentes científicas.

## Criterios de Aceptación (Definition of Done)
- [ ] 3+ galaxias documentadas: Milky Way, Andromeda (M31), M51 Whirlpool
- [ ] 4+ planetas documentados: Earth, Mars, Jupiter, Europa
- [ ] 4+ temas educativos en español: ocean_waves, atmosphere, vegetation, evolution
- [ ] 4+ temas educativos en inglés (traducciones equivalentes)
- [ ] Todos los archivos JSON validados contra schemas
- [ ] Datos científicos verificados con fuentes (NASA, ESA, papers)
- [ ] Parámetros de genoma funcionales (testeados en Rust)
- [ ] Imágenes de referencia en alta calidad (URLs a repositorios científicos)
- [ ] Curiosidades ("fun_facts") mínimo 3 por objeto

## Archivos a Modificar/Crear

### Crear
- `content/catalog/galaxies/milky_way.json`
- `content/catalog/galaxies/andromeda.json`
- `content/catalog/galaxies/m51_whirlpool.json`
- `content/catalog/planets/earth.json`
- `content/catalog/planets/mars.json`
- `content/catalog/planets/jupiter.json`
- `content/catalog/planets/europa.json`
- `content/education/es/ocean/ocean_waves.json`
- `content/education/es/atmosphere/atmosphere_dynamics.json`
- `content/education/es/vegetation/biome_distribution.json`
- `content/education/es/evolution/planetary_formation.json`
- `content/education/en/ocean/ocean_waves.json`
- `content/education/en/atmosphere/atmosphere_dynamics.json`
- `content/education/en/vegetation/biome_distribution.json`
- `content/education/en/evolution/planetary_formation.json`

### Modificar
- `content/schemas/astronomical_object.json` - Validar nuevos campos si es necesario
- `content/schemas/dual_explanation.json` - Asegurar compatibilidad

## Dependencias
- **TICKET-CL-002** - Para la estructura de contenido educativo dual

## Notas Técnicas

### Estructura Galaxia

```json
{
  "id": "milky_way",
  "name": "Vía Láctea",
  "name_en": "Milky Way",
  "type": "barred_spiral",
  "category": "real",
  "discovery": {
    "year": null,
    "discoverer": "Observaciones ancestrales",
    "method": "Observación visual",
    "first_telescope_observation": "1610 - Galileo Galilei"
  },
  "physical_properties": {
    "diameter": {
      "value": 105700,
      "unit": "light_years"
    },
    "mass": {
      "value": 1.5e12,
      "unit": "solar_masses"
    },
    "star_count": {
      "value": 100e9,
      "unit": "stars"
    },
    "age": {
      "value": 13.6,
      "unit": "billion_years"
    },
    "rotation_period": {
      "value": 240,
      "unit": "million_years"
    }
  },
  "visual_properties": {
    "color_temperature": 5500,
    "bar_length": {
      "value": 10000,
      "unit": "light_years"
    },
    "num_arms": 4,
    "arm_structure": "Grand design spiral",
    "bulge_size": "large"
  },
  "comparison_params": {
    "genome": {
      "galaxy_type": "barred_spiral",
      "num_arms": 4,
      "arm_tightness": 0.3,
      "bulge_size": 0.25,
      "disk_thickness": 0.15,
      "color_temperature": 5500,
      "noise": {
        "algorithm": "simplex",
        "frequency": 0.02,
        "octaves": 6,
        "persistence": 0.5,
        "lacunarity": 2.0
      }
    },
    "generation_notes": "Usar fBm con simplex para distribución de polvo. El bulge requiere gradiente radial suave."
  },
  "fun_facts": [
    "Contiene entre 100 y 400 mil millones de estrellas",
    "La Tierra está ubicada en el brazo de Orión, a 26,000 años luz del centro",
    "El agujero negro supermasivo en el centro se llama Sagitario A*",
    "La Vía Láctea colisionará con Andrómeda en ~4.5 mil millones de años"
  ],
  "sources": [
    "https://solarsystem.nasa.gov/galaxies/milky-way/overview/",
    "https://www.esa.int/Science_Exploration/Space_Science/Gaia"
  ]
}
```

### Estructura Planeta

```json
{
  "id": "earth",
  "name": "Tierra",
  "name_en": "Earth",
  "type": "terrestrial_planet",
  "category": "real",
  "parent_star": "sol",
  "discovery": {
    "year": null,
    "note": "Planeta natal"
  },
  "orbital_properties": {
    "semi_major_axis": {
      "value": 1.0,
      "unit": "AU"
    },
    "orbital_period": {
      "value": 365.25,
      "unit": "days"
    },
    "eccentricity": 0.0167,
    "inclination": 23.44
  },
  "physical_properties": {
    "radius": {
      "value": 6371,
      "unit": "km"
    },
    "mass": {
      "value": 5.97e24,
      "unit": "kg"
    },
    "gravity": 9.8,
    "density": 5.51,
    "temperature": {
      "min": -88,
      "avg": 15,
      "max": 58,
      "unit": "celsius"
    }
  },
  "atmosphere": {
    "composition": {
      "N2": 0.78,
      "O2": 0.21,
      "Ar": 0.0093,
      "CO2": 0.0004
    },
    "pressure": 1.0,
    "cloud_coverage": 0.67
  },
  "surface": {
    "water_coverage": 0.71,
    "land_coverage": 0.29,
    "ice_coverage": 0.03,
    "biomes": ["ocean", "forest", "desert", "tundra", "grassland"]
  },
  "comparison_params": {
    "genome": {
      "planet_type": "terrestrial",
      "radius": 1.0,
      "temperature": 288,
      "water_coverage": 0.71,
      "atmosphere_density": 1.0,
      "cloud_density": 0.6,
      "noise": {
        "algorithm": "simplex",
        "frequency": 0.05,
        "octaves": 8,
        "persistence": 0.55,
        "lacunarity": 2.1
      }
    }
  },
  "fun_facts": [
    "Es el único planeta conocido con vida",
    "El 71% de su superficie está cubierta de agua",
    "Su núcleo es de hierro y níquel, generando el campo magnético protector",
    "La Luna estabiliza la inclinación axial, manteniendo climas estables"
  ],
  "sources": [
    "https://solarsystem.nasa.gov/planets/earth/overview/",
    "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html"
  ]
}
```

### Estructura Contenido Educativo

```json
{
  "id": "ocean_waves",
  "category": "ocean",
  "title": {
    "scientific": "Dinámica de Oceános",
    "algorithmic": "Generación de Ondas con Ruido"
  },
  "scientific": {
    "concept": "Las olas oceánicas son perturbaciones periódicas de la superficie del agua causadas principalmente por el viento. Su comportamiento sigue ecuaciones de fluidos dinámicos.",
    "analogy": "Imagina lanzar una piedra en un estanque tranquilo. Las ondas circulares que se forman son similares a las olas oceánicas, aunque a mucha mayor escala.",
    "real_world_example": "El Océano Pacífico genera olas que pueden viajar más de 10,000 km hasta llegar a las costas de California, manteniendo su energía.",
    "physics_formula": "h(x,t) = A · sin(k·x - ω·t + φ)",
    "key_concepts": ["Amplitud", "Longitud de onda", "Período", "Velocidad de fase"]
  },
  "algorithmic": {
    "algorithm": "Simplex Noise con fBm",
    "complexity": {
      "time": "O(n × m)",
      "space": "O(1)"
    },
    "why_this_algorithm": "Simplex Noise genera patrones continuos y naturales sin artifacts direccionales. fBm agrega detalle a múltiples escalas, simulando la naturaleza fractal de las olas.",
    "comparison": {
      "perlin": "Más lento y con artifacts en diagonales. No recomendado para oceános.",
      "simplex": "Rápido, sin artifacts. Ideal para movimiento orgánico.",
      "worley": "Genera celdas, útil para espuma pero no para olas base."
    },
    "pseudocode": "\nfunction generateWaves(x, y, time):\n    frequency = 0.05\n    amplitude = 1.0\n    total = 0\n    \n    for octave in 1 to 8:\n        total += amplitude * simplex3D(x * frequency, y * frequency, time)\n        frequency *= 2.1  // lacunarity\n        amplitude *= 0.55 // persistence\n    \n    return total\n",
    "parameters": [
      {
        "name": "frequency",
        "type": "float",
        "range": [0.001, 0.1],
        "default": 0.05,
        "description": "Frecuencia base del ruido. Valores altos = ondas más pequeñas y detalladas."
      },
      {
        "name": "octaves",
        "type": "int",
        "range": [1, 10],
        "default": 8,
        "description": "Número de octavas de fBm. Más octavas = más detalle pero más costoso."
      },
      {
        "name": "persistence",
        "type": "float",
        "range": [0.1, 1.0],
        "default": 0.55,
        "description": "Cuánto contribuye cada octava sucesiva. Valores altos = detalles más pronunciados."
      },
      {
        "name": "lacunarity",
        "type": "float",
        "range": [1.5, 3.0],
        "default": 2.1,
        "description": "Factor de multiplicación de frecuencia entre octavas."
      }
    ]
  },
  "related_algorithms": ["simplex", "fbm"],
  "difficulty_level": 2,
  "estimated_time_minutes": 15
}
```

### Fuentes Científicas Recomendadas

| Objeto | Fuente Principal | URL |
|--------|-----------------|-----|
| Galaxias | NASA Extragalactic Database | https://ned.ipac.caltech.edu/ |
| Planetas | NASA Planetary Fact Sheet | https://nssdc.gsfc.nasa.gov/planetary/planetfact.html |
| Andromeda | Hubble Data | https://hubblesite.org/ |
| Exoplanetas | Exoplanet Catalog | https://exoplanetarchive.ipac.caltech.edu/ |

## Estimación
- **Story Points:** 5
- **Dificultad:** Baja
- **Riesgos:** Investigación de datos científicos puede ser time-consuming

---

# TICKET-CL-006: Ocean Shaders

## Branch
`feature/CL-006-ocean-shaders`

## Descripción
Implementar shaders GLSL para renderizado de océanos dinámicos en Three.js. Los shaders deben implementar Simplex Noise, Perlin Noise y fBm directamente en GPU para máximo performance, con soporte para animación temporal y parámetros configurables desde React.

## Criterios de Aceptación (Definition of Done)
- [ ] Shader Simplex 3D funcional en GLSL con funciones de hash y gradiente
- [ ] Shader Perlin 3D funcional en GLSL con permutations lookup
- [ ] Shader fBm que combine múltiples octavas de ruido
- [ ] Integración con Three.js mediante `ShaderMaterial` o `RawShaderMaterial`
- [ ] Animación temporal con uniform `uTime` actualizado cada frame
- [ ] Parámetros configurables: frequency, octaves, persistence, lacunarity
- [ ] Componente React `OceanShader` con controles de UI
- [ ] Visualización correcta de normales para iluminación
- [ ] Performance ≥60fps en target hardware (mid-range GPU)
- [ ] Fallback a implementación CPU si WebGL2 no disponible

## Archivos a Modificar/Crear

### Crear
- `frontend/src/shaders/simplex.glsl` - Funciones Simplex 3D
- `frontend/src/shaders/perlin.glsl` - Funciones Perlin 3D
- `frontend/src/shaders/fbm.glsl` - Fractal Brownian Motion
- `frontend/src/shaders/utils/noise_utils.glsl` - Utilidades compartidas
- `frontend/src/shaders/ocean/vertex.glsl` - Vertex shader océano
- `frontend/src/shaders/ocean/fragment.glsl` - Fragment shader océano
- `frontend/src/components/generators/OceanShader.tsx` - Componente React
- `frontend/src/hooks/useShaderMaterial.ts` - Hook para gestión de shaders

### Modificar
- `frontend/src/components/generators/index.ts` - Exportar nuevo componente

## Dependencias
- **TICKET-CL-003** - Componentes UI base para controles
- **TICKET-CL-001** - Parámetros de ruido compatibles con backend Rust

## Notas Técnicas

### Implementación Simplex 3D GLSL

```glsl
// simplex.glsl
// Basado en implementación de Stefan Gustavson

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
```

### Implementación fBm GLSL

```glsl
// fbm.glsl
#include "simplex.glsl"

uniform float uFrequency;
uniform int uOctaves;
uniform float uPersistence;
uniform float uLacunarity;
uniform float uTime;

float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 1.0;
    float frequency = uFrequency;
    float maxValue = 0.0;
    
    for(int i = 0; i < uOctaves; i++) {
        total += amplitude * snoise(p * frequency + vec3(0.0, uTime * 0.5, 0.0));
        maxValue += amplitude;
        amplitude *= uPersistence;
        frequency *= uLacunarity;
    }
    
    return total / maxValue;
}
```

### Vertex Shader Océano

```glsl
// ocean/vertex.glsl
uniform float uTime;
uniform float uWaveHeight;

varying vec2 vUv;
varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include "../fbm.glsl"

void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Generar elevación usando fBm
    float elevation = fbm(vec3(pos.x, pos.z, uTime * 0.3));
    elevation *= uWaveHeight;
    
    pos.y += elevation;
    vElevation = elevation;
    
    // Calcular normales para iluminación (usando diferencias finitas)
    float delta = 0.01;
    float elevationL = fbm(vec3(pos.x - delta, pos.z, uTime * 0.3)) * uWaveHeight;
    float elevationR = fbm(vec3(pos.x + delta, pos.z, uTime * 0.3)) * uWaveHeight;
    float elevationD = fbm(vec3(pos.x, pos.z - delta, uTime * 0.3)) * uWaveHeight;
    float elevationU = fbm(vec3(pos.x, pos.z + delta, uTime * 0.3)) * uWaveHeight;
    
    vec3 tangentX = vec3(2.0 * delta, elevationR - elevationL, 0.0);
    vec3 tangentZ = vec3(0.0, elevationU - elevationD, 2.0 * delta);
    vNormal = normalize(cross(tangentX, tangentZ));
    
    vPosition = pos;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Fragment Shader Océano

```glsl
// ocean/fragment.glsl
uniform vec3 uDeepColor;
uniform vec3 uSurfaceColor;
uniform vec3 uFoamColor;
uniform float uFoamThreshold;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Calcular color basado en profundidad
    float mixStrength = (vElevation + 1.0) * 0.5;
    vec3 color = mix(uDeepColor, uSurfaceColor, mixStrength);
    
    // Agregar espuma en picos
    if(vElevation > uFoamThreshold) {
        float foamStrength = (vElevation - uFoamThreshold) / (1.0 - uFoamThreshold);
        color = mix(color, uFoamColor, foamStrength * 0.5);
    }
    
    // Iluminación simple (Phong)
    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 ambient = color * 0.3;
    vec3 diffuse = color * diff * 0.7;
    
    gl_FragColor = vec4(ambient + diffuse, 0.9);
}
```

### Componente React OceanShader

```tsx
// OceanShader.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '../../shaders/ocean/vertex.glsl';
import fragmentShader from '../../shaders/ocean/fragment.glsl';

interface OceanShaderProps {
  width?: number;
  depth?: number;
  segments?: number;
  waveHeight?: number;
  frequency?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;
  colors?: {
    deep: string;
    surface: string;
    foam: string;
  };
}

export const OceanShader: React.FC<OceanShaderProps> = ({
  width = 100,
  depth = 100,
  segments = 128,
  waveHeight = 2.0,
  frequency = 0.05,
  octaves = 8,
  persistence = 0.55,
  lacunarity = 2.1,
  colors = {
    deep: '#001e4d',
    surface: '#006994',
    foam: '#ffffff'
  }
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uFrequency: { value: frequency },
    uOctaves: { value: octaves },
    uPersistence: { value: persistence },
    uLacunarity: { value: lacunarity },
    uWaveHeight: { value: waveHeight },
    uDeepColor: { value: new THREE.Color(colors.deep) },
    uSurfaceColor: { value: new THREE.Color(colors.surface) },
    uFoamColor: { value: new THREE.Color(colors.foam) },
    uFoamThreshold: { value: 0.6 }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
```

### Optimizaciones de Performance

1. **Level of Detail (LOD):** Reducir segmentos de geometría cuando la cámara está lejos
2. **Instancing:** Usar `InstancedMesh` para múltiples planos de agua
3. **Offscreen Rendering:** Precalcular ruido en texture si es estático
4. **Throttling:** Limitar actualizaciones de uniforms a 30fps si el GPU está lento

## Estimación
- **Story Points:** 8
- **Dificultad:** Alta
- **Riesgos:** Implementación GLSL puede tener bugs sutiles; requiere testing en múltiples GPUs

---

# TICKET-CL-007: Vegetation System

## Branch
`feature/CL-007-vegetation-system`

## Descripción
Implementar un sistema de distribución de vegetación procedural basado en Worley Noise. El sistema debe generar distribuciones naturales de plantas que sigan patrones biológicos reales (agrupaciones, competencia por recursos), integrando el algoritmo en Rust y visualizándolo en Three.js.

## Criterios de Aceptación (Definition of Done)
- [ ] Implementación de Worley Noise (F1 y F2-F1) en Rust
- [ ] Algoritmo de distribución por biomas con parámetros configurables
- [ ] Componente React `VegetationOverlay` para Three.js
- [ ] Densidad de vegetación configurable según:
  - Humedad del terreno
  - Temperatura
  - Altitud
  - Pendiente
- [ ] Tipos de vegetación: árboles, arbustos, pasto
- [ ] Sistema de clusters naturales (no distribución uniforme)
- [ ] Instancing en Three.js para performance (>1000 instancias a 60fps)
- [ ] Tests unitarios del generador Worley
- [ ] Benchmark de performance distribución vs cantidad de plantas

## Archivos a Modificar/Crear

### Crear (Rust)
- `rust_core/src/noise/worley.rs` - Implementación Worley Noise
- `rust_core/src/biomes/vegetation.rs` - Distribución de vegetación
- `rust_core/src/biomes/mod.rs` - Módulo biomas
- `rust_core/tests/test_worley.rs` - Tests Worley

### Crear (Frontend)
- `frontend/src/components/generators/VegetationOverlay.tsx`
- `frontend/src/components/generators/VegetationControls.tsx`
- `frontend/src/hooks/useVegetationDistribution.ts`
- `frontend/src/types/vegetation.ts`

### Modificar
- `rust_core/src/lib.rs` - Exponer funciones de vegetación
- `rust_core/src/noise/mod.rs` - Exportar Worley
- `rust_core/Cargo.toml` - Agregar dependencias

## Dependencias
- **TICKET-CL-001** - Necesita la estructura de registro de algoritmos

## Notas Técnicas

### Implementación Worley Noise en Rust

```rust
// rust_core/src/noise/worley.rs
use noise::{NoiseFn, Seedable};
use std::collections::HashMap;

pub struct WorleyNoise {
    seed: u32,
    frequency: f64,
}

impl WorleyNoise {
    pub fn new(seed: u32) -> Self {
        Self { seed, frequency: 1.0 }
    }
    
    pub fn set_frequency(&mut self, freq: f64) {
        self.frequency = freq;
    }
    
    fn hash(&self, x: i64, y: i64, z: i64) -> u64 {
        // Hash simple pero eficiente
        let mut h = self.seed as u64;
        h = h.wrapping_mul(73856093).wrapping_add(x as u64);
        h = h.wrapping_mul(19349663).wrapping_add(y as u64);
        h = h.wrapping_mul(83492791).wrapping_add(z as u64);
        h
    }
    
    fn random_point(&self, cell_x: i64, cell_y: i64, cell_z: i64) -> [f64; 3] {
        let h = self.hash(cell_x, cell_y, cell_z);
        let fx = ((h >> 0) & 0xFFFFFFFF) as f64 / u32::MAX as f64;
        let fy = ((h >> 32) & 0xFFFF) as f64 / u16::MAX as f64;
        let fz = ((h >> 48) & 0xFFFF) as f64 / u16::MAX as f64;
        
        [
            cell_x as f64 + fx,
            cell_y as f64 + fy,
            cell_z as f64 + fz,
        ]
    }
    
    pub fn worley_f1(&self, x: f64, y: f64, z: f64) -> f64 {
        let p = [x * self.frequency, y * self.frequency, z * self.frequency];
        let cell = [p[0].floor() as i64, p[1].floor() as i64, p[2].floor() as i64];
        
        let mut min_dist = f64::INFINITY;
        
        // Revisar celdas vecinas (3x3x3 = 27 celdas)
        for dz in -1..=1 {
            for dy in -1..=1 {
                for dx in -1..=1 {
                    let neighbor = [cell[0] + dx, cell[1] + dy, cell[2] + dz];
                    let feature_point = self.random_point(neighbor[0], neighbor[1], neighbor[2]);
                    
                    let dx = p[0] - feature_point[0];
                    let dy = p[1] - feature_point[1];
                    let dz = p[2] - feature_point[2];
                    let dist = (dx*dx + dy*dy + dz*dz).sqrt();
                    
                    if dist < min_dist {
                        min_dist = dist;
                    }
                }
            }
        }
        
        min_dist
    }
    
    pub fn worley_f2f1(&self, x: f64, y: f64, z: f64) -> f64 {
        let p = [x * self.frequency, y * self.frequency, z * self.frequency];
        let cell = [p[0].floor() as i64, p[1].floor() as i64, p[2].floor() as i64];
        
        let mut distances: Vec<f64> = Vec::with_capacity(27);
        
        for dz in -1..=1 {
            for dy in -1..=1 {
                for dx in -1..=1 {
                    let neighbor = [cell[0] + dx, cell[1] + dy, cell[2] + dz];
                    let feature_point = self.random_point(neighbor[0], neighbor[1], neighbor[2]);
                    
                    let dx = p[0] - feature_point[0];
                    let dy = p[1] - feature_point[1];
                    let dz = p[2] - feature_point[2];
                    let dist = (dx*dx + dy*dy + dz*dz).sqrt();
                    
                    distances.push(dist);
                }
            }
        }
        
        distances.sort_by(|a, b| a.partial_cmp(b).unwrap());
        distances[1] - distances[0]  // F2 - F1
    }
}

impl NoiseFn<f64, 3> for WorleyNoise {
    fn get(&self, point: [f64; 3]) -> f64 {
        self.worley_f1(point[0], point[1], point[2])
    }
}
```

### Sistema de Distribución de Vegetación

```rust
// rust_core/src/biomes/vegetation.rs
use crate::noise::WorleyNoise;
use pyo3::prelude::*;

#[derive(Debug, Clone)]
pub struct VegetationParams {
    pub moisture: f64,        // 0.0 - 1.0
    pub temperature: f64,     // 0.0 - 1.0
    pub altitude: f64,        // 0.0 - 1.0 (normalizado)
    pub slope: f64,           // 0.0 - 1.0
}

#[derive(Debug, Clone)]
pub struct PlantInstance {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub plant_type: PlantType,
    pub scale: f64,
    pub rotation: f64,
}

#[derive(Debug, Clone, Copy)]
pub enum PlantType {
    Tree,
    Shrub,
    Grass,
}

pub struct VegetationGenerator {
    worley: WorleyNoise,
    density_map: WorleyNoise,
}

impl VegetationGenerator {
    pub fn new(seed: u32) -> Self {
        Self {
            worley: WorleyNoise::new(seed),
            density_map: WorleyNoise::new(seed.wrapping_add(1)),
        }
    }
    
    pub fn generate(
        &self,
        params: &VegetationParams,
        bounds: [f64; 4],  // [min_x, max_x, min_z, max_z]
        target_count: usize,
    ) -> Vec<PlantInstance> {
        let mut plants = Vec::new();
        
        // Calcular densidad base según condiciones ambientales
        let base_density = self.calculate_base_density(params);
        
        if base_density < 0.1 {
            return plants; // Demasiado inhóspito
        }
        
        // Usar Worley para generar clusters naturales
        let worley_scale = 0.05;
        self.worley.set_frequency(worley_scale);
        self.density_map.set_frequency(worley_scale * 0.5);
        
        let step = 2.0; // Resolución de sampling
        let mut candidates = Vec::new();
        
        let mut x = bounds[0];
        while x < bounds[1] {
            let mut z = bounds[2];
            while z < bounds[3] {
                let worley_val = self.worley.worley_f1(x, 0.0, z);
                let density_val = self.density_map.worley_f1(x, 100.0, z);
                
                // Threshold adaptativo basado en densidad deseada
                let threshold = 1.0 - base_density;
                
                if worley_val < threshold && density_val > 0.3 {
                    let plant_type = self.select_plant_type(params, worley_val);
                    let scale = 0.8 + density_val * 0.4; // Variación natural
                    let rotation = (x * 123.45 + z * 678.90) % (2.0 * std::f64::consts::PI);
                    
                    candidates.push(PlantInstance {
                        x,
                        y: 0.0, // Se ajusta según terreno
                        z,
                        plant_type,
                        scale,
                        rotation,
                    });
                }
                
                z += step;
            }
            x += step;
        }
        
        // Subsamplear hasta alcanzar target_count
        if candidates.len() > target_count {
            // Estratificado aleatorio para distribución uniforme
            let step = candidates.len() / target_count;
            for i in 0..target_count {
                let idx = i * step + (i * 73 % step); // Offset pseudoaleatorio
                if idx < candidates.len() {
                    plants.push(candidates[idx].clone());
                }
            }
        } else {
            plants = candidates;
        }
        
        plants
    }
    
    fn calculate_base_density(&self, params: &VegetationParams) -> f64 {
        let moisture_factor = params.moisture.powf(1.5);
        let temp_factor = 1.0 - (params.temperature - 0.5).abs() * 2.0;
        let altitude_factor = if params.altitude > 0.7 {
            (1.0 - params.altitude) / 0.3 // Decae sobre línea de nieve
        } else {
            1.0
        };
        let slope_factor = 1.0 - params.slope.powf(2.0);
        
        moisture_factor * temp_factor * altitude_factor * slope_factor
    }
    
    fn select_plant_type(&self, params: &VegetationParams, worley_val: f64) -> PlantType {
        if params.moisture > 0.7 && worley_val < 0.3 {
            PlantType::Tree
        } else if params.moisture > 0.4 {
            PlantType::Shrub
        } else {
            PlantType::Grass
        }
    }
}

// PyO3 bindings
#[pyclass]
pub struct PyVegetationGenerator {
    inner: VegetationGenerator,
}

#[pymethods]
impl PyVegetationGenerator {
    #[new]
    fn new(seed: u32) -> Self {
        Self {
            inner: VegetationGenerator::new(seed),
        }
    }
    
    fn generate(&self, moisture: f64, temperature: f64, bounds: [f64; 4], count: usize) -> PyResult<Vec<(f64, f64, f64, u8, f64, f64)>> {
        let params = VegetationParams {
            moisture,
            temperature,
            altitude: 0.5,
            slope: 0.2,
        };
        
        let plants = self.inner.generate(&params, bounds, count);
        
        Ok(plants.iter().map(|p| {
            let type_code = match p.plant_type {
                PlantType::Tree => 0u8,
                PlantType::Shrub => 1u8,
                PlantType::Grass => 2u8,
            };
            (p.x, p.y, p.z, type_code, p.scale, p.rotation)
        }).collect())
    }
}
```

### Componente React VegetationOverlay

```tsx
// VegetationOverlay.tsx
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVegetationDistribution } from '../../hooks/useVegetationDistribution';

interface VegetationOverlayProps {
  bounds: [number, number, number, number]; // [minX, maxX, minZ, maxZ]
  moisture: number;
  temperature: number;
  targetCount?: number;
  seed?: number;
}

export const VegetationOverlay: React.FC<VegetationOverlayProps> = ({
  bounds,
  moisture,
  temperature,
  targetCount = 1000,
  seed = 12345,
}) => {
  const treeRef = useRef<THREE.InstancedMesh>(null);
  const shrubRef = useRef<THREE.InstancedMesh>(null);
  const grassRef = useRef<THREE.InstancedMesh>(null);
  
  const { data: vegetation, isLoading } = useVegetationDistribution({
    bounds,
    moisture,
    temperature,
    targetCount,
    seed,
  });

  // Separar por tipo
  const { trees, shrubs, grass } = useMemo(() => {
    if (!vegetation) return { trees: [], shrubs: [], grass: [] };
    
    return {
      trees: vegetation.filter(v => v.type === 0),
      shrubs: vegetation.filter(v => v.type === 1),
      grass: vegetation.filter(v => v.type === 2),
    };
  }, [vegetation]);

  // Actualizar matrices de instancia
  useEffect(() => {
    if (!trees.length || !treeRef.current) return;
    
    const dummy = new THREE.Object3D();
    trees.forEach((plant, i) => {
      dummy.position.set(plant.x, plant.y, plant.z);
      dummy.rotation.y = plant.rotation;
      dummy.scale.setScalar(plant.scale);
      dummy.updateMatrix();
      treeRef.current!.setMatrixAt(i, dummy.matrix);
    });
    treeRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  useEffect(() => {
    if (!shrubs.length || !shrubRef.current) return;
    
    const dummy = new THREE.Object3D();
    shrubs.forEach((plant, i) => {
      dummy.position.set(plant.x, plant.y, plant.z);
      dummy.rotation.y = plant.rotation;
      dummy.scale.setScalar(plant.scale * 0.5);
      dummy.updateMatrix();
      shrubRef.current!.setMatrixAt(i, dummy.matrix);
    });
    shrubRef.current.instanceMatrix.needsUpdate = true;
  }, [shrubs]);

  if (isLoading) return null;

  return (
    <group>
      {/* Árboles */}
      <instancedMesh
        ref={treeRef}
        args={[undefined, undefined, trees.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.5, 2, 8]} />
        <meshStandardMaterial color="#2d5a27" />
      </instancedMesh>
      
      {/* Arbustos */}
      <instancedMesh
        ref={shrubRef}
        args={[undefined, undefined, shrubs.length]}
        castShadow
      >
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#4a7c43" />
      </instancedMesh>
      
      {/* Pasto - billboards */}
      <instancedMesh
        ref={grassRef}
        args={[undefined, undefined, grass.length]}
      >
        <planeGeometry args={[0.1, 0.4]} />
        <meshBasicMaterial color="#7cb342" side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
};
```

## Estimación
- **Story Points:** 8
- **Dificultad:** Alta
- **Riesgos:** Implementación Worley puede ser costosa computacionalmente; requiere optimización

---

# TICKET-CL-008: Discovery Mode

## Branch
`feature/CL-008-discovery-mode`

## Descripción
Implementar el modo Discovery de CosmosLearn: una experiencia de exploración guiada donde los usuarios completan misiones estructuradas, desbloquean logros y progresan por un árbol de aprendizaje. Incluye tutorial interactivo, UI de progreso persistente y sistema de notificaciones de logros.

## Criterios de Aceptación (Definition of Done)
- [ ] 2+ módulos de desafíos JSON creados: `exoplanet_hunting/`, `galaxy_crafting/`
- [ ] 3+ desafíos por módulo con dificultad progresiva
- [ ] Componente `ChallengeHUD` con progreso visual de misión actual
- [ ] Componente `ProgressTracker` mostrando módulos completados
- [ ] Sistema de logros con badges visuales
- [ ] Tutorial interactivo paso a paso para primer uso
- [ ] Persistencia de progreso en localStorage
- [ ] Notificaciones toast para logros desbloqueados
- [ ] Store Zustand `educationalStore` con estado global de progreso
- [ ] Transiciones animadas entre desafíos
- [ ] Pantalla de celebración al completar módulo

## Archivos a Modificar/Crear

### Crear (Content)
- `content/challenges/exoplanet_hunting/habitable_planet_101.json`
- `content/challenges/exoplanet_hunting/gas_giant_hunter.json`
- `content/challenges/exoplanet_hunting/ice_world_explorer.json`
- `content/challenges/galaxy_crafting/spiral_artist.json`
- `content/challenges/galaxy_crafting/elliptical_elegance.json`
- `content/challenges/galaxy_crafting/barred_beauty.json`

### Crear (Frontend)
- `frontend/src/components/education/ChallengeHUD.tsx`
- `frontend/src/components/education/ProgressTracker.tsx`
- `frontend/src/components/education/AchievementBadge.tsx`
- `frontend/src/components/education/TutorialOverlay.tsx`
- `frontend/src/components/education/ChallengeCompleteModal.tsx`
- `frontend/src/stores/educationalStore.ts`
- `frontend/src/hooks/useChallengeProgress.ts`
- `frontend/src/hooks/useTutorial.ts`
- `frontend/src/types/challenges.ts`

### Modificar
- `frontend/src/App.tsx` - Integrar Discovery Mode
- `frontend/src/components/layout/Navigation.tsx` - Agregar link a Discovery

## Dependencias
- **TICKET-CL-003** - Componentes educativos base
- **TICKET-CL-004** - Sistema de validación de desafíos
- **TICKET-CL-005** - Contenido educativo para misiones

## Notas Técnicas

### Estructura de Desafío

```json
{
  "id": "habitable_planet_101",
  "module_id": "exoplanet_hunting",
  "order": 1,
  "difficulty": 1,
  "title": {
    "es": "El Planeta Habitable",
    "en": "The Habitable Planet"
  },
  "description": {
    "es": "Aprende a identificar las condiciones necesarias para la vida...",
    "en": "Learn to identify the conditions necessary for life..."
  },
  "learning_objectives": [
    "Entender la zona habitable (Goldilocks zone)",
    "Relacionar temperatura con distancia estelar",
    "Comprender la importancia del agua líquida"
  ],
  "scenario": {
    "context": "Eres un astrónomo en busca de exoplanetas habitables...",
    "mission_brief": "Tu misión es crear un planeta con condiciones similares a la Tierra...",
    "hints": [
      "La temperatura debe estar entre 273K y 373K",
      "La cobertura de agua afecta el albedo planetario"
    ]
  },
  "objective": {
    "type": "parameter_match",
    "target": {
      "temperature": 288,
      "water_coverage": 0.71,
      "atmosphere.density": 1.0
    }
  },
  "constraints": [
    {
      "type": "allowed_algorithms",
      "value": ["simplex"]
    },
    {
      "type": "max_iterations",
      "value": 10
    }
  ],
  "success_criteria": [
    {
      "type": "parameter_match",
      "parameter": "temperature",
      "target_value": 288,
      "tolerance": 0.1,
      "weight": 0.4
    },
    {
      "type": "parameter_match",
      "parameter": "water_coverage",
      "target_value": 0.71,
      "tolerance": 0.15,
      "weight": 0.3
    },
    {
      "type": "time_limit",
      "target_value": 300000,
      "weight": 0.3
    }
  ],
  "rewards": {
    "xp": 150,
    "badges": ["exoplanet_hunter_novice"],
    "unlocks": ["gas_giant_hunter"]
  },
  "educational_content": {
    "category": "ocean",
    "feature_id": "ocean_waves"
  }
}
```

### Store Zustand educationalStore

```typescript
// stores/educationalStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  score: number;
  attempts: number;
  bestTimeMs: number;
  completedAt?: Date;
}

interface ModuleProgress {
  moduleId: string;
  challenges: Record<string, ChallengeProgress>;
  completedCount: number;
  totalCount: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

interface EducationalState {
  // Progreso
  modules: Record<string, ModuleProgress>;
  currentChallengeId: string | null;
  currentModuleId: string | null;
  
  // Logros
  achievements: Record<string, Achievement>;
  xp: number;
  level: number;
  
  // Tutorial
  hasCompletedTutorial: boolean;
  tutorialStep: number;
  
  // Acciones
  startChallenge: (moduleId: string, challengeId: string) => void;
  completeChallenge: (challengeId: string, score: number, timeMs: number) => void;
  unlockAchievement: (achievementId: string) => void;
  addXp: (amount: number) => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
}

export const useEducationalStore = create<EducationalState>()(
  persist(
    (set, get) => ({
      modules: {},
      currentChallengeId: null,
      currentModuleId: null,
      achievements: {},
      xp: 0,
      level: 1,
      hasCompletedTutorial: false,
      tutorialStep: 0,
      
      startChallenge: (moduleId, challengeId) => set({
        currentModuleId: moduleId,
        currentChallengeId: challengeId,
      }),
      
      completeChallenge: (challengeId, score, timeMs) => {
        const state = get();
        const moduleId = state.currentModuleId;
        if (!moduleId) return;
        
        set((state) => {
          const module = state.modules[moduleId] || {
            moduleId,
            challenges: {},
            completedCount: 0,
            totalCount: 0,
          };
          
          const existing = module.challenges[challengeId];
          const progress: ChallengeProgress = {
            challengeId,
            completed: true,
            score: Math.max(score, existing?.score || 0),
            attempts: (existing?.attempts || 0) + 1,
            bestTimeMs: existing 
              ? Math.min(timeMs, existing.bestTimeMs) 
              : timeMs,
            completedAt: new Date(),
          };
          
          const newCompletedCount = Object.values(module.challenges)
            .filter(c => c.completed).length + (existing?.completed ? 0 : 1);
          
          return {
            modules: {
              ...state.modules,
              [moduleId]: {
                ...module,
                challenges: {
                  ...module.challenges,
                  [challengeId]: progress,
                },
                completedCount: newCompletedCount,
              },
            },
          };
        });
        
        // Calcular XP ganado
        const xpGain = Math.floor(score * 1.5);
        get().addXp(xpGain);
      },
      
      unlockAchievement: (achievementId) => {
        const state = get();
        if (state.achievements[achievementId]?.unlockedAt) return;
        
        set((state) => ({
          achievements: {
            ...state.achievements,
            [achievementId]: {
              ...state.achievements[achievementId],
              unlockedAt: new Date(),
            },
          },
        }));
      },
      
      addXp: (amount) => set((state) => {
        const newXp = state.xp + amount;
        const newLevel = Math.floor(newXp / 1000) + 1;
        return { xp: newXp, level: newLevel };
      }),
      
      advanceTutorial: () => set((state) => ({
        tutorialStep: state.tutorialStep + 1,
      })),
      
      skipTutorial: () => set({ 
        hasCompletedTutorial: true,
        tutorialStep: 999,
      }),
      
      resetTutorial: () => set({
        hasCompletedTutorial: false,
        tutorialStep: 0,
      }),
    }),
    {
      name: 'cosmoslearn-education',
      partialize: (state) => ({
        modules: state.modules,
        achievements: state.achievements,
        xp: state.xp,
        level: state.level,
        hasCompletedTutorial: state.hasCompletedTutorial,
      }),
    }
  )
);
```

### Componente ChallengeHUD

```tsx
// ChallengeHUD.tsx
import { useEducationalStore } from '../../stores/educationalStore';
import { useChallengeValidation } from '../../hooks/useChallengeValidation';

export const ChallengeHUD: React.FC = () => {
  const { currentChallengeId, currentModuleId, xp, level } = useEducationalStore();
  const { data: challenge } = useChallenge(currentChallengeId);
  const { data: progress } = useChallengeProgress(currentChallengeId);
  
  if (!challenge) return null;
  
  return (
    <div className="challenge-hud">
      {/* Header con info del desafío */}
      <div className="challenge-header">
        <h3>{challenge.title.es}</h3>
        <div className="difficulty-stars">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < challenge.difficulty ? 'filled' : ''}>
              ⭐
            </span>
          ))}
        </div>
      </div>
      
      {/* Objetivos */}
      <div className="challenge-objectives">
        <h4>Objetivos:</h4>
        <ul>
          {challenge.learning_objectives.map((obj, i) => (
            <li key={i}>📚 {obj}</li>
          ))}
        </ul>
      </div>
      
      {/* Progreso actual */}
      <div className="challenge-progress">
        <div className="attempt-counter">
          Intentos: {progress?.attempts || 0}
        </div>
        {progress?.bestScore && (
          <div className="best-score">
            Mejor puntuación: {progress.bestScore}%
          </div>
        )}
      </div>
      
      {/* Recompensas */}
      <div className="challenge-rewards">
        <span className="xp-reward">+{challenge.rewards.xp} XP</span>
        {challenge.rewards.badges.map(badge => (
          <span key={badge} className="badge-reward">🏆 {badge}</span>
        ))}
      </div>
      
      {/* Botón de validación */}
      <ValidateButton challengeId={challenge.id} />
    </div>
  );
};
```

### Tutorial Interactivo

```tsx
// TutorialOverlay.tsx
import { useEducationalStore } from '../../stores/educationalStore';
import { useEffect, useState } from 'react';

const TUTORIAL_STEPS = [
  {
    target: '.generator-panel',
    title: 'Panel de Generación',
    content: 'Aquí puedes ajustar los parámetros del planeta. Prueba cambiar la temperatura.',
    action: 'Cambia la temperatura a 288K',
  },
  {
    target: '.algorithm-selector',
    title: 'Selector de Algoritmo',
    content: 'Cada algoritmo genera patrones diferentes. El Simplex Noise es ideal para superficies naturales.',
    action: 'Selecciona "Simplex Noise"',
  },
  {
    target: '.education-panel',
    title: 'Aprende Mientras Creas',
    content: 'Clickea en los íconos (?) para ver explicaciones científicas.',
    action: null,
  },
];

export const TutorialOverlay: React.FC = () => {
  const { tutorialStep, hasCompletedTutorial, advanceTutorial, skipTutorial } = useEducationalStore();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    if (hasCompletedTutorial || tutorialStep >= TUTORIAL_STEPS.length) return;
    
    const step = TUTORIAL_STEPS[tutorialStep];
    const element = document.querySelector(step.target);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    }
  }, [tutorialStep, hasCompletedTutorial]);
  
  if (hasCompletedTutorial || tutorialStep >= TUTORIAL_STEPS.length) return null;
  
  const currentStep = TUTORIAL_STEPS[tutorialStep];
  
  return (
    <div className="tutorial-overlay">
      {/* Spotlight en el elemento objetivo */}
      {targetRect && (
        <div 
          className="tutorial-spotlight"
          style={{
            top: targetRect.top - 10,
            left: targetRect.left - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
        />
      )}
      
      {/* Tooltip del tutorial */}
      <div className="tutorial-tooltip">
        <h4>{currentStep.title}</h4>
        <p>{currentStep.content}</p>
        {currentStep.action && (
          <p className="tutorial-action">👉 {currentStep.action}</p>
        )}
        
        <div className="tutorial-controls">
          <button onClick={skipTutorial}>Omitir Tutorial</button>
          <button onClick={advanceTutorial}>
            {tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Siguiente' : 'Comenzar'}
          </button>
        </div>
        
        {/* Indicador de progreso */}
        <div className="tutorial-progress">
          {TUTORIAL_STEPS.map((_, i) => (
            <span key={i} className={i === tutorialStep ? 'active' : ''} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Estilos CSS Sugeridos

```css
.challenge-hud {
  @apply fixed top-4 right-4 w-80 bg-gray-900/90 text-white rounded-xl p-4 shadow-2xl;
  @apply backdrop-blur-md border border-gray-700;
}

.challenge-header h3 {
  @apply text-lg font-bold text-blue-400;
}

.difficulty-stars .filled {
  @apply text-yellow-400;
}

.challenge-objectives {
  @apply mt-4 text-sm;
}

.challenge-objectives li {
  @apply text-gray-300 mb-1;
}

.challenge-rewards {
  @apply mt-4 flex gap-2;
}

.xp-reward {
  @apply bg-purple-600 px-2 py-1 rounded-full text-xs font-bold;
}

.badge-reward {
  @apply bg-yellow-600 px-2 py-1 rounded-full text-xs;
}

.tutorial-overlay {
  @apply fixed inset-0 z-50 pointer-events-none;
}

.tutorial-spotlight {
  @apply absolute rounded-xl border-2 border-blue-400;
  @apply shadow-[0_0_0_9999px_rgba(0,0,0,0.7)];
  @apply pointer-events-none;
}

.tutorial-tooltip {
  @apply absolute bottom-8 left-1/2 -translate-x-1/2;
  @apply bg-white text-gray-900 p-6 rounded-xl max-w-md;
  @apply shadow-2xl pointer-events-auto;
}
```

## Estimación
- **Story Points:** 13
- **Dificultad:** Alta
- **Riesgos:** Integración de múltiples sistemas; requiere testing exhaustivo de flujo completo

---

## 📋 Checklist Final

Antes de marcar este documento como completo, verificar:

- [x] 8 tickets detallados creados
- [x] Cada ticket incluye branch específico
- [x] Criterios de aceptación claros y medibles
- [x] Archivos a modificar/crear listados
- [x] Dependencias entre tickets documentadas
- [x] Notas técnicas con código de referencia
- [x] Estimaciones de Story Points
- [x] Diagrama de dependencias incluido

---

## 🔄 Proceso de Trabajo

1. **Crear branches** desde `develop` siguiendo el formato `feature/CL-XXX-nombre`
2. **Desarrollar** siguiendo los criterios de aceptación del ticket
3. **Testear** localmente con los comandos del proyecto
4. **Crear PR** hacia `develop` con descripción clara
5. **Code review** por otro miembro del equipo
6. **Merge** solo después de aprobación y CI passing

**Referencia:** Ver `docs/git-workflow.md` para detalles completos del flujo Git.
