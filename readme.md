# Backend (en una terminal)

source .venv/bin/activate
cd backend
uvicorn src.main:app --reload --port 8000

# Frontend (en otra terminal)

cd frontend
npm run dev
