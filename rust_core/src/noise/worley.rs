//! Worley Noise Implementation
//!
//! También conocido como "Cellular Noise" o "Voronoi Noise".
//! Genera patrones de celdas basados en puntos aleatorios distribuidos
//! en el espacio. Ideal para texturas de rocas, mármol y patrones orgánicos.

use pyo3::prelude::*;
use std::f64;

/// Permutation table
const PERM: [u8; 256] = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69,
    142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219,
    203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
    74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
    220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76,
    132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173,
    186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
    59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163,
    70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
    178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162,
    241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204,
    176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141,
    128, 195, 78, 66, 215, 61, 156, 180,
];

/// Hash function for pseudo-random number generation
fn hash(n: u32) -> f64 {
    let n = n.wrapping_mul(374761393u32);
    let n = n.wrapping_add(668265263u32);
    let n = n ^ (n >> 13);
    let n = n.wrapping_mul(1274126177u32);
    (n as f64) / (u32::MAX as f64)
}

/// Distance to closest feature point (F1)
pub fn worley_f1(x: f64, y: f64, z: f64) -> f64 {
    let cell_x = x.floor() as i32;
    let cell_y = y.floor() as i32;
    let cell_z = z.floor() as i32;

    let local_x = x - cell_x as f64;
    let local_y = y - cell_y as f64;
    let local_z = z - cell_z as f64;

    let mut min_dist = f64::MAX;

    // Check neighboring cells
    for z_offset in -1..=1 {
        for y_offset in -1..=1 {
            for x_offset in -1..=1 {
                let neighbor_x = cell_x + x_offset;
                let neighbor_y = cell_y + y_offset;
                let neighbor_z = cell_z + z_offset;

                // Generate pseudo-random feature point in this cell
                let hash_val = neighbor_x.wrapping_mul(73856093)
                    ^ neighbor_y.wrapping_mul(19349663)
                    ^ neighbor_z.wrapping_mul(83492791);

                let fx = hash(hash_val as u32);
                let fy = hash(hash_val.wrapping_add(1) as u32);
                let fz = hash(hash_val.wrapping_add(2) as u32);

                // Distance to feature point
                let dx = local_x - (x_offset as f64 + fx);
                let dy = local_y - (y_offset as f64 + fy);
                let dz = local_z - (z_offset as f64 + fz);

                let dist = dx * dx + dy * dy + dz * dz;
                min_dist = min_dist.min(dist);
            }
        }
    }

    min_dist.sqrt()
}

/// F2 - F1 (cracks pattern)
pub fn worley_f2_f1(x: f64, y: f64, z: f64) -> f64 {
    let cell_x = x.floor() as i32;
    let cell_y = y.floor() as i32;
    let cell_z = z.floor() as i32;

    let local_x = x - cell_x as f64;
    let local_y = y - cell_y as f64;
    let local_z = z - cell_z as f64;

    let mut distances: Vec<f64> = Vec::with_capacity(27);

    // Collect distances to all neighboring feature points
    for z_offset in -1..=1 {
        for y_offset in -1..=1 {
            for x_offset in -1..=1 {
                let neighbor_x = cell_x + x_offset;
                let neighbor_y = cell_y + y_offset;
                let neighbor_z = cell_z + z_offset;

                let hash_val = neighbor_x.wrapping_mul(73856093)
                    ^ neighbor_y.wrapping_mul(19349663)
                    ^ neighbor_z.wrapping_mul(83492791);

                let fx = hash(hash_val as u32);
                let fy = hash(hash_val.wrapping_add(1) as u32);
                let fz = hash(hash_val.wrapping_add(2) as u32);

                let dx = local_x - (x_offset as f64 + fx);
                let dy = local_y - (y_offset as f64 + fy);
                let dz = local_z - (z_offset as f64 + fz);

                let dist = (dx * dx + dy * dy + dz * dz).sqrt();
                distances.push(dist);
            }
        }
    }

    distances.sort_by(|a, b| a.partial_cmp(b).unwrap());

    distances.get(1).copied().unwrap_or(1.0) - distances[0]
}

/// Python-exposed Worley F1 noise
#[pyfunction]
pub fn py_worley_f1(x: f64, y: f64, z: f64) -> f64 {
    worley_f1(x, y, z)
}

/// Python-exposed Worley F2-F1 noise
#[pyfunction]
pub fn py_worley_f2_f1(x: f64, y: f64, z: f64) -> f64 {
    worley_f2_f1(x, y, z)
}
