use pyo3::prelude::*;

/// Suma dos números como ejemplo básico
#[pyfunction]
fn sum_as_string(a: usize, b: usize) -> PyResult<String> {
    Ok((a + b).to_string())
}

/// Módulo principal de ProceduralGraph AI Core
#[pymodule]
fn procedural_graph_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(sum_as_string, m)?)?;
    Ok(())
}
