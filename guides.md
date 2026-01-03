# 📘 Guías de Desarrollo e Inicialización

Este documento detalla los flujos de trabajo para configurar, desarrollar y depurar **ProceduralGraph AI**. Debido a la naturaleza híbrida (Rust + Python), es crucial seguir el orden de compilación de los bindings.

---

## 🛠️ Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu entorno local:

- **Rust (Cargo):** `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.org | sh`
- **Python 3.11+**: Recomendamos usar `pyenv` o `conda`.
- **Node.js v18+**: Para el cliente React.
- **Redis**: Instancia local o vía Docker.
- **Maturin**: Herramienta esencial para compilar y publicar crates de Rust como módulos de Python.
  ```bash
  pip install maturin
  ```

---

## 🚀 Inicialización Local (Modo Desarrollo)

Si deseas desarrollar sin Docker para aprovechar el _hot-reloading_ y depuración rápida:

### 1. Compilación del Núcleo (Rust → Python)

El backend de Python no funcionará si no compilas primero el módulo de Rust.

```bash
cd rust_core
# Compila en modo desarrollo e instala el paquete en tu entorno virtual actual
maturin develop --release
```
