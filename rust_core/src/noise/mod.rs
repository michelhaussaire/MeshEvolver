//! Algorithm Registry for Noise Generation
//!
//! Este modulo implementa un registro de algoritmos de ruido en Rust
//! con soporte para multiples algoritmos (Perlin, Simplex, Worley, fBm)
//! y los expone a Python mediante PyO3.

use ::noise::{NoiseFn, Perlin, Simplex, Worley};
use pyo3::prelude::*;

/// AlgorithmType enum exposed to Python
/// Representa los diferentes tipos de algoritmos de ruido disponibles
#[pyclass]
#[derive(Clone, Copy, Debug)]
pub enum AlgorithmType {
    Perlin,
    Simplex,
    WorleyF1,
    WorleyF2F1,
    Fbm,
}

/// Genera un valor de ruido usando el algoritmo especificado
///
/// # Arguments
/// * `algorithm` - Tipo de algoritmo a usar (AlgorithmType)
/// * `x`, `y`, `z` - Coordenadas de entrada
/// * `seed` - Semilla para el generador de ruido
/// * `octaves` - Numero de octavas para fBm
/// * `persistence` - Factor de persistencia para fBm
/// * `lacunarity` - Factor de lacunaridad para fBm
///
/// # Returns
/// Valor de ruido en el rango [-1, 1] o [0, 1] dependiendo del algoritmo
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
) -> f64 {
    match algorithm {
        AlgorithmType::Perlin => {
            let perlin = Perlin::new(seed);
            perlin.get([x, y, z])
        }
        AlgorithmType::Simplex => {
            let simplex = Simplex::new(seed);
            simplex.get([x, y, z])
        }
        AlgorithmType::WorleyF1 => {
            let worley = Worley::new(seed);
            // Worley returns distance values, normalize to [-1, 1] range
            let value = worley.get([x, y, z]);
            // Worley noise typically returns [0, 1], map to [-1, 1]
            value * 2.0 - 1.0
        }
        AlgorithmType::WorleyF2F1 => {
            // F2-F1 (crack) pattern using Worley noise
            let worley = Worley::new(seed);
            // Get distance to closest feature point
            let f1 = worley.get([x, y, z]);
            // Approximate F2 by sampling at a small offset
            let f2 = worley.get([x + 0.1, y + 0.1, z + 0.1]);
            let diff = (f2 - f1).abs();
            diff * 2.0 - 1.0
        }
        AlgorithmType::Fbm => {
            // Use Perlin as base for fBm by default
            let perlin = Perlin::new(seed);
            fbm(&perlin, x, y, z, octaves, persistence, lacunarity)
        }
    }
}

/// Funcion generica para Fractal Brownian Motion
///
/// # Type Parameters
/// * `N` - Cualquier tipo que implemente NoiseFn<f64, 3>
///
/// # Arguments
/// * `noise` - Instancia del generador de ruido
/// * `x`, `y`, `z` - Coordenadas de entrada
/// * `octaves` - Numero de octavas (capas) de ruido
/// * `persistence` - Factor de atenuacion de amplitud por octava
/// * `lacunarity` - Factor de espaciado entre octavas
///
/// # Returns
/// Valor de ruido fBm normalizado
pub fn fbm<N: NoiseFn<f64, 3>>(
    noise: &N,
    x: f64,
    y: f64,
    z: f64,
    octaves: usize,
    persistence: f64,
    lacunarity: f64,
) -> f64 {
    let mut total = 0.0;
    let mut frequency = 1.0;
    let mut amplitude = 1.0;
    let mut max_value = 0.0;

    for _ in 0..octaves {
        let sample_x = x * frequency;
        let sample_y = y * frequency;
        let sample_z = z * frequency;

        total += noise.get([sample_x, sample_y, sample_z]) * amplitude;
        max_value += amplitude;

        amplitude *= persistence;
        frequency *= lacunarity;
    }

    // Normalizar y ajustar rango a [-1, 1]
    if max_value > 0.0 {
        total / max_value
    } else {
        0.0
    }
}

/// Wrapper de fbm expuesto a Python usando Perlin
#[pyfunction]
pub fn fbm_perlin(
    x: f64,
    y: f64,
    z: f64,
    seed: u32,
    octaves: usize,
    persistence: f64,
    lacunarity: f64,
) -> f64 {
    let perlin = Perlin::new(seed);
    fbm(&perlin, x, y, z, octaves, persistence, lacunarity)
}

/// Wrapper de fbm expuesto a Python usando Simplex
#[pyfunction]
pub fn fbm_simplex(
    x: f64,
    y: f64,
    z: f64,
    seed: u32,
    octaves: usize,
    persistence: f64,
    lacunarity: f64,
) -> f64 {
    let simplex = Simplex::new(seed);
    fbm(&simplex, x, y, z, octaves, persistence, lacunarity)
}

/// Wrapper para Worley F1
#[pyfunction]
pub fn worley_f1(x: f64, y: f64, z: f64, seed: u32) -> f64 {
    let worley = Worley::new(seed);
    let value = worley.get([x, y, z]);
    value * 2.0 - 1.0
}

/// Wrapper para Worley F2-F1 (crack pattern)
#[pyfunction]
pub fn worley_f2_f1(x: f64, y: f64, z: f64, seed: u32) -> f64 {
    let worley = Worley::new(seed);
    let f1 = worley.get([x, y, z]);
    let f2 = worley.get([x + 0.05, y + 0.05, z + 0.05]);
    let diff = (f2 - f1).abs();
    diff * 2.0 - 1.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_algorithm_type_clone() {
        let alg = AlgorithmType::Perlin;
        let cloned = alg.clone();
        assert!(matches!(cloned, AlgorithmType::Perlin));
    }

    #[test]
    fn test_perlin_generation() {
        let value = generate_with_algorithm(AlgorithmType::Perlin, 1.0, 2.0, 3.0, 42, 4, 0.5, 2.0);
        // Perlin noise returns values roughly in [-1, 1]
        assert!(value >= -2.0 && value <= 2.0);
    }

    #[test]
    fn test_simplex_generation() {
        let value = generate_with_algorithm(AlgorithmType::Simplex, 1.0, 2.0, 3.0, 42, 4, 0.5, 2.0);
        assert!(value >= -2.0 && value <= 2.0);
    }

    #[test]
    fn test_fbm_generic() {
        let perlin = Perlin::new(123);
        let value = fbm(&perlin, 1.0, 2.0, 3.0, 4, 0.5, 2.0);
        assert!(value >= -2.0 && value <= 2.0);
    }

    #[test]
    fn test_fbm_zero_octaves() {
        let perlin = Perlin::new(123);
        let value = fbm(&perlin, 1.0, 2.0, 3.0, 0, 0.5, 2.0);
        assert_eq!(value, 0.0);
    }

    #[test]
    fn test_worley_f1() {
        let value =
            generate_with_algorithm(AlgorithmType::WorleyF1, 1.0, 2.0, 3.0, 42, 4, 0.5, 2.0);
        // Normalized to [-1, 1]
        assert!(value >= -1.0 && value <= 1.0);
    }

    #[test]
    fn test_fbm_wrapper_perlin() {
        let value = fbm_perlin(1.0, 2.0, 3.0, 42, 4, 0.5, 2.0);
        assert!(value >= -2.0 && value <= 2.0);
    }

    #[test]
    fn test_fbm_wrapper_simplex() {
        let value = fbm_simplex(1.0, 2.0, 3.0, 42, 4, 0.5, 2.0);
        assert!(value >= -2.0 && value <= 2.0);
    }

    #[test]
    fn test_worley_f1_wrapper() {
        let value = worley_f1(1.0, 2.0, 3.0, 42);
        assert!(value >= -1.0 && value <= 1.0);
    }

    #[test]
    fn test_worley_f2_f1_wrapper() {
        let value = worley_f2_f1(1.0, 2.0, 3.0, 42);
        assert!(value >= -1.0 && value <= 1.0);
    }
}
