# 🗺️ Roadmap Técnico: ProceduralGraph AI

Este documento delinea la dirección estratégica y los hitos técnicos planificados para el proyecto. Nuestro objetivo es mover la carga computacional hacia el borde (Edge/Client) y mejorar la complejidad de los algoritmos genéticos.

---

## 📍 Q1: Estabilización y Optimización (Backend Focus)

El enfoque actual es maximizar el rendimiento del servidor y la eficiencia del caché.

- [x] **Arquitectura Base:** Integración FastAPI + Rust (PyO3).
- [ ] **SIMD en Rust:** Implementar instrucciones vectoriales (`std::simd` o crate `packed_simd`) para acelerar el cálculo de ruido en CPUs modernas.
- [ ] **Compresión de Blobs:** Implementar compresión LZ4 antes de guardar las mallas en Redis para reducir el I/O de red y uso de memoria.
- [ ] **Observabilidad:** Integrar Prometheus y Grafana para monitorear latencia de generación de Rust vs. tiempo de respuesta de API.

---

## 📍 Q2: Escalabilidad y Experiencia de Usuario

Mejorar la interactividad y soportar múltiples usuarios concurrentes evolucionando avatares.

- [ ] **WebSockets (FastAPI):** Migrar de polling HTTP a WebSockets para transmitir el proceso de evolución en tiempo real (streaming de generaciones intermedias).
- [ ] **Cola de Tareas (Celery/Arq):** Desacoplar evoluciones masivas (>100 individuos) del hilo principal usando un worker dedicado.
- [ ] **Persistencia Relacional:** Migrar metadatos de usuario y configuraciones de "semillas favoritas" a PostgreSQL.

---

## 📍 Q3: WebAssembly & Client-Side Compute (Major Refactor)

El gran salto técnico: reducir costos de servidor moviendo la lógica de Rust al navegador.

- [ ] **Rust to WASM:** Compilar el núcleo de `rust_core` a WebAssembly (`wasm-pack`).
- [ ] **Web Workers:** Ejecutar el algoritmo genético en un Web Worker del navegador para no bloquear el renderizado de Three.js.
- [ ] **Modo Híbrido:** El servidor solo actúa como validador y almacenamiento persistente; la generación ocurre en el cliente.

---

## 📍 Q4: Inteligencia Artificial Avanzada

Ir más allá del ruido procedural clásico.

- [ ] **Style Transfer:** Implementar una pequeña red neuronal (ONNX runtime en Rust) para transferir estilos artísticos a las texturas generadas.
- [ ] **Exportación:** Soporte para exportar avatares en formatos estandarizados (`.gltf`, `.obj`) con rigging básico automático.

---

### 📉 Deuda Técnica Conocida

* Refactorizar el manejo de errores en `rust_core` para retornar `PyResult` descriptivos en lugar de `panic!`.
* Mejorar la cobertura de tipos estáticos (Type Hinting) en el lado de Python para los objetos que retornan de Rust.
