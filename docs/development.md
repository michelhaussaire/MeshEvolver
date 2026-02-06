# Development Guide

Setup, workflow, and troubleshooting.

## Prerequisites

- **Rust:** `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.org | sh`
- **Python 3.11+**
- **Node.js 18+**
- **Maturin:** `pip install maturin`

## Setup

### 1. Build Rust Core

```bash
cd rust_core
maturin develop --release
```

**Without --release:** Faster compilation, slower runtime (for development)

### 2. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

## Running

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Testing

### Rust Tests
```bash
cd rust_core
cargo test -- --nocapture
```

### Python Tests
```bash
cd backend
pytest tests/ -v
```

### API Test
```bash
curl http://localhost:8000/api/rust-test
```

## Workflow

### Modify Rust Core
1. Edit `rust_core/src/lib.rs`
2. Recompile: `maturin develop --release`
3. Restart backend server
4. Test changes

### Modify Backend
1. Edit `backend/src/main.py`
2. Server auto-reloads (with `--reload` flag)

### Modify Frontend
1. Edit files in `frontend/src/`
2. Vite auto-refreshes browser

## Troubleshooting

### `ModuleNotFoundError: procedural_graph_core`
**Fix:**
```bash
cd rust_core
maturin develop --release
# Verify .so file exists:
ls ../backend/src/*.so
```

### `undefined symbol` on import
**Fix:** Version mismatch between compile and runtime Python
```bash
cd rust_core
maturin develop --release --interpreter $(which python)
```

### Rust Panic
**Enable backtrace:**
```bash
RUST_BACKTRACE=1 uvicorn src.main:app --reload
```

### Frontend Can't Connect
- Verify backend running on port 8000
- Check browser console for CORS errors
- CORS is configured in `main.py` for development (`allow_origins=["*"]`)

## Project Structure

```
MeshEvolver/
├── backend/src/main.py        # FastAPI endpoints
├── frontend/src/              # React components
│   ├── App.tsx               # Main app
│   └── GalaxyApp.tsx         # Galaxy UI
├── rust_core/src/lib.rs       # Rust implementation
├── docs/                      # Documentation
└── plan/                      # Phase specifications
    ├── fase1-galaxias.md
    ├── fase2-planetas.md
    └── fase3-interfaz.md
```

## Key Commands

| Task | Command |
|------|---------|
| Build Rust | `cd rust_core && maturin develop --release` |
| Run backend | `cd backend && uvicorn src.main:app --reload` |
| Run frontend | `cd frontend && npm run dev` |
| Test Rust | `cd rust_core && cargo test` |
| Test Python | `cd backend && pytest` |

## Next Steps

- Read [Architecture](architecture.md) for system design
- Check [API Reference](api.md) for endpoints
- Review `plan/fase1-galaxias.md` for galaxy implementation details
