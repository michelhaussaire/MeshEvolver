//! Evolution Module
//! 
//! Algoritmos genéticos para evolución de genomas.
//! Implementa selección, crossover y mutación.

pub mod selection;
pub mod crossover;
pub mod mutation;

use crate::genomes::Genome;
use pyo3::prelude::*;

/// Configuración del algoritmo genético
#[pyclass]
#[derive(Clone, Debug)]
pub struct EvolutionConfig {
    /// Tamaño de la población
    pub population_size: usize,
    
    /// Número de generaciones
    pub generations: usize,
    
    /// Tasa de crossover (0.0 - 1.0)
    pub crossover_rate: f64,
    
    /// Tasa de mutación (0.0 - 1.0)
    pub mutation_rate: f64,
    
    /// Fuerza de la mutación
    pub mutation_strength: f64,
    
    /// Porcentaje de elitismo (mejores individuos que se conservan)
    pub elitism_rate: f64,
    
    /// Tamaño del torneo para selección
    pub tournament_size: usize,
}

impl Default for EvolutionConfig {
    fn default() -> Self {
        Self {
            population_size: 100,
            generations: 50,
            crossover_rate: 0.8,
            mutation_rate: 0.1,
            mutation_strength: 0.2,
            elitism_rate: 0.1,
            tournament_size: 5,
        }
    }
}

/// Resultado de una generación de evolución
#[pyclass]
#[derive(Clone, Debug)]
pub struct GenerationResult {
    /// Número de generación
    pub generation: usize,
    
    /// Mejor fitness
    pub best_fitness: f64,
    
    /// Fitness promedio
    pub avg_fitness: f64,
    
    /// Peor fitness
    pub worst_fitness: f64,
    
    /// Desviación estándar del fitness
    pub std_fitness: f64,
}
