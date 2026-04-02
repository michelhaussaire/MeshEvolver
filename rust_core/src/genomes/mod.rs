//! Genomes Module
//! 
//! Define los genomas para diferentes tipos de objetos astronómicos.
//! Cada genoma representa los parámetros que definen la forma de un objeto.

pub mod galaxy;
pub mod planet;
pub mod terrain;

use pyo3::prelude::*;

/// Trait base para todos los genomas
pub trait Genome: Clone {
    /// Crea un genoma aleatorio
    fn random() -> Self;
    
    /// Realiza crossover con otro genoma
    fn crossover(&self, other: &Self, ratio: f64) -> Self;
    
    /// Muta el genoma
    fn mutate(&mut self, rate: f64, strength: f64);
    
    /// Calcula el fitness (qué tan "bueno" es este genoma)
    fn fitness(&self) -> f64;
}

/// Tipos de genomas disponibles
#[pyclass]
#[derive(Clone, Copy, Debug)]
pub enum GenomeType {
    Galaxy,
    Planet,
    Terrain,
}
