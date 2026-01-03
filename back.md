2. Configuración del Backend (FastAPI)Una vez que el módulo Rust está instalado en el entorno:Bashcd ../backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

# Iniciar servidor con hot-reload

uvicorn src.main:app --reload --port 8000 3. Configuración del Frontend (React + Three.js)Bashcd ../frontend
npm install
npm run dev

🧪 Testing y BenchmarkingUnit Tests (Rust)Para garantizar la integridad de los algoritmos matemáticos:Bashcd rust_core
cargo test -- --nocapture
Integration Tests (Python)Para verificar la integración de endpoints y caché de Redis:Bashcd backend
pytest tests/

BenchmarkingPara comparar el rendimiento entre la implementación Python pura y Rust (si aplica):Bashpython scripts/benchmark_compare.py
🐛 Troubleshooting ComúnErrorCausa ProbableSoluciónModuleNotFoundError: No module named 'procedural_core'Bindings de Rust no compilados o entorno virtual incorrecto.Ejecuta maturin develop dentro del venv activo.RedisConnectionErrorRedis no se está ejecutando en el puerto 6379.Ejecuta docker run -d -p 6379:6379 redis.Panic en Rust (unwrap)Datos de malla corruptos o dimensiones de matriz inválidas.Revisa los logs de la consola de Python; Rust pasará el panic como excepción.
