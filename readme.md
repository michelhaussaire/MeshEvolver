# ProceduralGraph AI

Motor de generacion procedimental de alto rendimiento para crear y evolucionar avatares 3D/2D. El sistema utiliza una arquitectura hibrida que combina la facilidad de orquestacion de Python con la potencia de computo bare-metal de Rust.

## Nucleo Tecnologico

El sistema genera texturas y mallas mediante **Perlin Noise** y refina estos modelos utilizando **Algoritmos Geneticos** (seleccion, cruce y mutacion). La carga computacional pesada se delega a Rust para garantizar tiempos de respuesta en milisegundos y seguridad de memoria (memory safety).

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    React + Three.js                              │    │
│  │              Visualizacion y renderizado WebGL                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           ORQUESTADOR                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Python (FastAPI)                              │    │
│  │           Endpoints REST + Logica de negocio                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    │ PyO3 Bindings                       │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Rust Core (procedural_graph_core)             │    │
│  │         Perlin Noise │ Algoritmos Geneticos │ Generacion Mallas  │    │
│  │              ndarray │ nalgebra │ Operaciones matriciales        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Binary Blobs
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PERSISTENCIA                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         Redis                                    │    │
│  │         Cache de mallas (SHA-256 hash de parametros ADN)         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Stack Tecnologico

| Capa | Tecnologia | Proposito |
|------|------------|-----------|
| **Frontend** | React 19 + Three.js + @react-three/fiber | Visualizacion y renderizado 3D en cliente |
| **Orquestador** | Python (FastAPI) | Endpoints REST y tareas en segundo plano |
| **Motor de Computo** | Rust + PyO3 | Operaciones matriciales, generacion de mallas |
| **Persistencia** | Redis | Almacenamiento de binary blobs (mallas cacheadas) |
| **DevOps** | Docker Multi-stage | Rust Builder -> Python Runtime |

## Decisiones de Arquitectura (ADRs)

### Rust sobre C++

Se eligio Rust por su garantia de **"Fearless Concurrency"**, permitiendo paralelizar la evolucion de la poblacion genetica sin riesgo de Data Races, y por su ergonomia moderna (Cargo/Maturin).

### Estrategia de Hashing

Para optimizar recursos, se genera un hash **SHA-256** de los parametros de entrada (semilla/genes). Si el hash existe en Redis, se sirve el blob binario directamente, evitando el recalculo de la geometria.

### Python como "Pegamento"

Python gestiona la logica de negocio de alto nivel y la API web debido a su velocidad de desarrollo, mientras actua como un wrapper ligero sobre el nucleo compilado de Rust.

## Estructura del Proyecto

```
MeshEvolver/
├── backend/                    # API FastAPI
│   ├── src/
│   │   └── main.py            # Punto de entrada de la API
│   ├── tests/
│   │   └── test_api.py        # Tests de integracion
│   └── requirements.txt       # Dependencias Python
├── frontend/                   # Cliente React
│   ├── src/
│   │   ├── App.tsx            # Componente principal
│   │   ├── main.tsx           # Punto de entrada
│   │   └── components/
│   │       └── Scene.tsx      # Escena Three.js
│   ├── package.json
│   └── vite.config.ts
├── rust_core/                  # Nucleo Rust (PyO3)
│   ├── src/
│   │   └── lib.rs             # Modulo principal
│   ├── Cargo.toml
│   └── pyproject.toml         # Configuracion Maturin
├── guides.md                   # Guias de desarrollo
├── ROADMAP.md                  # Roadmap tecnico
└── readme.md                   # Este archivo
```

## Prerrequisitos

- **Rust (Cargo):** `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.org | sh`
- **Python 3.11+**: Recomendamos usar `pyenv` o `conda`
- **Node.js v18+**: Para el cliente React
- **Redis**: Instancia local o via Docker
- **Maturin**: Herramienta para compilar crates de Rust como modulos de Python
  ```bash
  pip install maturin
  ```

## Inicializacion Local (Modo Desarrollo)

### 1. Compilacion del Nucleo (Rust -> Python)

El backend de Python no funcionara si no compilas primero el modulo de Rust.

```bash
cd rust_core
# Compila en modo desarrollo e instala el paquete en tu entorno virtual actual
maturin develop --release
```

### 2. Configuracion del Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Iniciar servidor con hot-reload
uvicorn src.main:app --reload --port 8000
```

### 3. Configuracion del Frontend (React + Three.js)

```bash
cd frontend
npm install
npm run dev
```

El frontend estara disponible en `http://localhost:5173`

## Testing y Benchmarking

### Unit Tests (Rust)

Para garantizar la integridad de los algoritmos matematicos:

```bash
cd rust_core
cargo test -- --nocapture
```

### Integration Tests (Python)

Para verificar la integracion de endpoints y cache de Redis:

```bash
cd backend
pytest tests/
```

### Benchmarking

Para comparar el rendimiento entre implementaciones:

```bash
python scripts/benchmark_compare.py
```

## Troubleshooting

| Error | Causa Probable | Solucion |
|-------|----------------|----------|
| `ModuleNotFoundError: No module named 'procedural_graph_core'` | Bindings de Rust no compilados o entorno virtual incorrecto | Ejecuta `maturin develop` dentro del venv activo |
| `RedisConnectionError` | Redis no se esta ejecutando en el puerto 6379 | Ejecuta `docker run -d -p 6379:6379 redis` |
| Panic en Rust (unwrap) | Datos de malla corruptos o dimensiones de matriz invalidas | Revisa los logs de la consola de Python; Rust pasara el panic como excepcion |

## API Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Estado de la API |
| GET | `/health` | Health check |
| GET | `/api/rust-test` | Verificar bindings de Rust |

## Roadmap

Consulta [ROADMAP.md](./ROADMAP.md) para ver el plan de desarrollo tecnico, incluyendo:

- Q1: Estabilizacion y Optimizacion (SIMD, Compresion LZ4, Observabilidad)
- Q2: Escalabilidad (WebSockets, Cola de Tareas, PostgreSQL)
- Q3: WebAssembly y Client-Side Compute
- Q4: IA Avanzada (Style Transfer, Exportacion GLTF/OBJ)

## Licencia

MIT
