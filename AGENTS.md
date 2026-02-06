# AGENTS.md

This document provides guidance for AI agents working on the MeshEvolver / ProceduralGraph AI project.

## Skills Installed

The following skills have been installed from https://github.com/wshobson/agents to assist development:

### 1. `rust-async-patterns`
**Location:** `.agents/skills/rust-async-patterns`

**Use when:**
- Implementing WebAssembly (WASM) compilation for the Rust core (Q3 roadmap)
- Working with async operations in the Rust procedural generation core
- Optimizing parallel genetic algorithm execution with fearless concurrency
- Setting up Web Workers for client-side computation

**Context:** The project uses Rust with PyO3 bindings for high-performance procedural mesh generation. Future plans include compiling Rust to WASM for client-side execution.

---

### 2. `python-testing-patterns`
**Location:** `.agents/skills/python-testing-patterns`

**Use when:**
- Writing tests for FastAPI endpoints
- Testing integration between Python and Rust (PyO3 bindings)
- Setting up test fixtures for Redis cache validation
- Implementing tests for the genetic algorithm orchestration logic

**Context:** Backend uses FastAPI with endpoints that interface with the Rust core module. Tests should verify both API functionality and the Python-Rust integration.

---

### 3. `react-state-management`
**Location:** `.agents/skills/react-state-management`

**Use when:**
- Managing 3D scene state with Three.js and React Three Fiber
- Handling real-time WebSocket data for genetic algorithm evolution streaming (Q2 roadmap)
- Implementing state for user avatar configurations and "favorite seeds"
- Coordinating state between the React UI and WebAssembly computations (Q3 roadmap)

**Context:** Frontend uses React 19 + Three.js + @react-three/fiber for 3D visualization. The UI needs to handle real-time updates during avatar evolution.

## Project Architecture Reminder

```
MeshEvolver/
├── backend/                    # FastAPI + Python orchestration
├── frontend/                   # React 19 + Three.js visualization
└── rust_core/                  # Rust core (PyO3 + future WASM)
```

## Key Technical Context

- **Perlin Noise**: Used for procedural texture generation in Rust core
- **Genetic Algorithms**: Selection, crossover, mutation for avatar evolution
- **PyO3**: Python-Rust bindings for performance-critical operations
- **Redis**: Cache for generated meshes (SHA-256 hash of DNA parameters)
- **WebAssembly (Future)**: Q3 roadmap includes client-side computation

## Testing Commands

```bash
# Rust unit tests
cd rust_core && cargo test -- --nocapture

# Python integration tests
cd backend && pytest tests/

# Frontend build
cd frontend && npm run build
```

## Development Workflow

1. Always compile Rust core before running Python backend:
   ```bash
   cd rust_core && maturin develop --release
   ```

2. Use the appropriate skill when working on:
   - Rust/WASM features → `rust-async-patterns`
   - Python/FastAPI features → `python-testing-patterns`
   - React/Three.js features → `react-state-management`
