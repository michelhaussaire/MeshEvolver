# 🌌 CosmosLearn - Documento de Arquitectura

## 1. Topología del Sistema

### 1.1 Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  CosmosLearn │  │ Educational  │  │   Challenge  │        │
│  │      UI      │  │    Module    │  │     HUD      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Three.js   │  │   Shaders    │  │    State     │        │
│  │    Scenes    │  │   (GLSL)     │  │    Mgmt      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
                              │ REST API
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Generate   │  │   Content    │  │   Challenge  │        │
│  │    API v2    │  │   Service    │  │    Engine    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │    Cache     │  │     i18n     │                          │
│  │    Redis     │  │  Middleware  │                          │
│  └──────────────┘  └──────────────┘                          │
└──────────────────────────────────────────────────────────────┘
                              │ PyO3 Bindings
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      CORE (Rust)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │    Noise     │  │  Algorithm   │  │   Genetic    │        │
│  │    Engine    │  │   Registry   │  │   Evolution  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
                              │ File System
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     CONTENT (JSON)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Educational │  │   Catalog    │  │  Challenges  │        │
│  │    Content   │  │    Objects   │  │   Missions   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Arquitectura en Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                      LAYER 4: PRESENTATION                      │
│  React 19 + Three.js + @react-three/fiber + Tailwind CSS v4    │
│  - Educational Tooltips - Challenge UI - Discovery Mode         │
├─────────────────────────────────────────────────────────────────┤
│                      LAYER 3: APPLICATION                       │
│  FastAPI + Python Orchestration                                 │
│  - Content Service - Generation API - Challenge System          │
├─────────────────────────────────────────────────────────────────┤
│                      LAYER 2: CORE ENGINE                       │
│  Rust + PyO3 Bindings                                           │
│  - Multi-Algorithm Noise Engine - Genetic Evolution            │
├─────────────────────────────────────────────────────────────────┤
│                      LAYER 1: CONTENT                           │
│  JSON/YAML Educational Content + i18n Translations             │
│  - Dual Explanations - Real Catalog - Missions                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Carpetas

```
MeshEvolver/
├── frontend/                       # React 19 + Three.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── education/         # Componentes educativos
│   │   │   │   ├── DualExplanation.tsx
│   │   │   │   ├── AlgorithmSelector.tsx
│   │   │   │   ├── TooltipEducational.tsx
│   │   │   │   └── ChallengeHUD.tsx
│   │   │   ├── generators/        # Generadores visuales
│   │   │   │   ├── GalaxyScene.tsx
│   │   │   │   ├── PlanetScene.tsx
│   │   │   │   └── OceanShader.tsx
│   │   │   └── ui/                # Componentes UI
│   │   ├── hooks/                 # Custom hooks
│   │   ├── stores/                # State management (Zustand)
│   │   ├── shaders/               # GLSL shaders
│   │   │   ├── perlin.glsl
│   │   │   ├── simplex.glsl
│   │   │   ├── worley.glsl
│   │   │   └── fbm.glsl
│   │   └── utils/
│   └── package.json
│
├── backend/                        # FastAPI + Python
│   ├── src/
│   │   ├── main.py                # Entry point
│   │   ├── models/                # Pydantic models
│   │   │   ├── educational.py
│   │   │   ├── challenges.py
│   │   │   └── generation.py
│   │   ├── routers/               # API endpoints
│   │   │   ├── generation.py
│   │   │   ├── education.py
│   │   │   └── challenges.py
│   │   ├── services/              # Business logic
│   │   │   ├── content_service.py
│   │   │   └── challenge_engine.py
│   │   └── utils/
│   └── requirements.txt
│
├── rust_core/                      # Rust + PyO3
│   ├── src/
│   │   ├── lib.rs                 # Entry point
│   │   ├── noise/                 # Algoritmos de ruido
│   │   │   ├── perlin.rs
│   │   │   ├── simplex.rs
│   │   │   ├── worley.rs
│   │   │   └── fbm.rs
│   │   ├── genomes/               # Estructuras de genomas
│   │   │   ├── galaxy.rs
│   │   │   ├── planet.rs
│   │   │   └── terrain.rs
│   │   ├── evolution/             # Algoritmos geneticos
│   │   │   ├── selection.rs
│   │   │   ├── crossover.rs
│   │   │   └── mutation.rs
│   │   └── mesh/                  # Generacion de mallas
│   └── Cargo.toml
│
├── content/                        # Contenido educativo
│   ├── education/                  # Explicaciones dual
│   │   ├── es/                    # Español
│   │   │   ├── ocean/
│   │   │   │   └── ocean_waves.json
│   │   │   ├── atmosphere/
│   │   │   ├── vegetation/
│   │   │   └── evolution/
│   │   └── en/                    # Ingles
│   ├── catalog/                    # Objetos astronomicos reales
│   │   ├── galaxies/
│   │   │   ├── milky_way.json
│   │   │   ├── andromeda.json
│   │   │   └── m51_whirlpool.json
│   │   └── planets/
│   │       ├── earth.json
│   │       ├── mars.json
│   │       └── jupiter.json
│   ├── challenges/                 # Sistema de desafios
│   │   ├── exoplanet_hunting/
│   │   │   ├── habitable_planet_101.json
│   │   │   └── gas_giant_hunter.json
│   │   └── galaxy_crafting/
│   └── schemas/                    # JSON schemas validacion
│       ├── dual_explanation.json
│       ├── astronomical_object.json
│       └── challenge.json
│
└── docs/                           # Documentacion
    ├── architecture.md             # Este documento
    ├── api.md
    └── development.md
```

---

## 3. Esquemas de Datos Principales

### 3.1 Contenido Educativo Dual

Archivo: `content/education/{locale}/{category}/{feature_id}.json`

Campos principales:
- `id`: identificador unico
- `category`: ocean, atmosphere, vegetation, evolution
- `title.scientific`: titulo del concepto cientifico
- `title.algorithmic`: titulo de la explicacion algoritmica
- `scientific.concept`: explicacion del fenomeno real
- `scientific.analogy`: analogia accesible
- `scientific.real_world_example`: ejemplo del mundo real
- `scientific.physics_formula`: formula relevante (opcional)
- `algorithmic.algorithm`: nombre del algoritmo usado
- `algorithmic.complexity.time`: complejidad temporal (Big O)
- `algorithmic.complexity.space`: complejidad espacial
- `algorithmic.why_this_algorithm`: justificacion de eleccion
- `algorithmic.comparison`: comparativa con alternativas
- `algorithmic.pseudocode`: pseudocodigo del algoritmo
- `algorithmic.parameters`: parametros configurables

### 3.2 Catálogo de Objetos Reales

Archivo: `content/catalog/{object_type}/{object_id}.json`

Campos principales:
- `id`: identificador (ej: "milky_way")
- `name`: nombre del objeto
- `type`: spiral_galaxy, elliptical_galaxy, terrestrial_planet, etc.
- `category`: real, fictional, hypothetical
- `discovery`: year, discoverer, method, telescope
- `physical_properties`: mass, diameter, star_count, age
- `visual_properties`: color_temperature, num_arms, images
- `comparison_params`: parametros de genoma para recrearlo
- `fun_facts`: curiosidades

### 3.3 Sistema de Desafios

Archivo: `content/challenges/{module_id}/{challenge_id}.json`

Campos principales:
- `id`: identificador del desafio
- `module_id`: modulo al que pertenece
- `difficulty`: 1-5
- `title`: titulo del desafio
- `description`: descripcion
- `learning_objectives`: objetivos de aprendizaje
- `scenario.context`: contexto narrativo
- `scenario.mission_brief`: brief de la mision
- `scenario.hints`: pistas disponibles
- `objective.type`: tipo de objetivo
- `constraints`: restricciones (algoritmos permitidos, iteraciones)
- `success_criteria`: criterios de exito con metricas
- `rewards`: xp, unlocks, badges

---

## 4. API Specification

### 4.1 Endpoints de Generacion

```
POST /api/v2/generate/texture
POST /api/v2/generate/galaxy
POST /api/v2/generate/planet
POST /api/v2/generate/ocean
```

Request:
```json
{
  "algorithm": "simplex",
  "params": {
    "frequency": 0.05,
    "octaves": 6,
    "persistence": 0.5,
    "lacunarity": 2.0
  },
  "resolution": 256
}
```

Response:
```json
{
  "data": [],
  "metadata": {
    "algorithm_used": "simplex",
    "generation_time_ms": 12.4,
    "complexity": "O(n^2)"
  }
}
```

### 4.2 Endpoints de Contenido Educativo

```
GET /api/v2/education/{category}/{feature_id}
GET /api/v2/education/compare?algorithms=perlin,simplex,worley
GET /api/v2/catalog/{object_type}
GET /api/v2/catalog/{object_type}/{object_id}
```

### 4.3 Endpoints de Desafios

```
GET /api/v2/challenges
GET /api/v2/challenges/{challenge_id}
POST /api/v2/challenges/{challenge_id}/validate
GET /api/v2/challenges/{challenge_id}/progress
```

---

## 5. Modelos Pydantic (Backend)

Principales modelos:
- `AlgorithmType`: enum con los algoritmos disponibles
- `NoiseParams`: parametros de ruido (frequency, octaves, persistence, lacunarity)
- `GenerationRequest`: request de generacion
- `ScientificExplanation`: explicacion cientifica
- `AlgorithmicExplanation`: explicacion algoritmica
- `DualExplanation`: combinacion de ambas
- `Challenge`: estructura completa de desafio
- `SuccessCriterion`: criterio de exito individual

---

## 6. Integracion Rust-PyO3

### Exposicion de Algoritmos

Nuevo enum en Rust:
```rust
#[pyclass]
#[derive(Clone, Copy, Debug)]
pub enum AlgorithmType {
    Perlin,
    Simplex,
    WorleyF1,
    WorleyF2F1,
    Fbm,
}
```

Funcion unificada:
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
) -> f64
```

Funcion fbm generica:
```rust
fn fbm<N: NoiseFn<f64, 3>>(
    noise: &N,
    x: f64,
    y: f64,
    z: f64,
    octaves: usize,
    persistence: f64,
    lacunarity: f64,
) -> f64
```

---

## 7. Decisiones y Trade-offs

### 7.1 JSON vs Database para Contenido Educativo

Opcion A: JSON Files (Elegida)
- Versionable con Git
- Facil edicion por colaboradores
- No requiere DB para MVP
- No query complejos (limitacion aceptable)

Opcion B: PostgreSQL + JSONB
- Queries complejos
- Escalable
- Overhead para MVP (rechazada)

Decision: JSON files para MVP, migrar a DB si escala.

### 7.2 Shaders: Inline vs Dinamicos

Opcion A: Inline en TypeScript (Elegida)
- Compilacion en build time
- Type safety
- Tree shaking

Opcion B: Cargar GLSL dinamicamente
- Lazy loading
- Mas complejo

Decision: Inline con template literals.

### 7.3 State Management

Opcion A: Zustand (Elegida)
- Simple, minimalista
- Buena integracion React 19
- No boilerplate

Opcion B: Redux Toolkit
- Mas estructurado
- Overkill para este proyecto

Decision: Zustand + React Query.

---

## 8. Plan de Migracion desde MeshEvolver

Fase 1: Agregar algoritmos adicionales en Rust (Simplex, Worley)
Fase 2: Crear estructura de contenido JSON
Fase 3: Implementar endpoints de contenido educativo
Fase 4: Desarrollar componentes UI educativos
Fase 5: Sistema de desafios
Fase 6: Shaders avanzados (agua, vegetacion)

---

## 9. Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19 |
| 3D Rendering | Three.js + React Three Fiber |
| Shaders | GLSL |
| Styling | Tailwind CSS v4 |
| State | Zustand + React Query |
| Backend | FastAPI + Python 3.12 |
| Core | Rust + PyO3 |
| Content | JSON + i18n |

