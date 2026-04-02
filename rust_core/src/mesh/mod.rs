//! Mesh Module
//!
//! Generacion y manipulacion de mallas 3D para objetos astronomicos.

use pyo3::prelude::*;

/// Representacion de una malla 3D
#[pyclass]
#[derive(Clone, Debug)]
pub struct Mesh {
    pub vertices: Vec<[f64; 3]>,
    pub faces: Vec<[u32; 3]>,
    pub normals: Vec<[f64; 3]>,
    pub uvs: Vec<[f64; 2]>,
}

impl Mesh {
    pub fn new() -> Self {
        Self {
            vertices: Vec::new(),
            faces: Vec::new(),
            normals: Vec::new(),
            uvs: Vec::new(),
        }
    }

    pub fn add_vertex(&mut self, x: f64, y: f64, z: f64) -> usize {
        self.vertices.push([x, y, z]);
        self.vertices.len() - 1
    }

    pub fn add_face(&mut self, v1: u32, v2: u32, v3: u32) {
        self.faces.push([v1, v2, v3]);
    }
}
