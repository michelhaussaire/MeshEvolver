//! Terrain Genome
//!
//! Parámetros genéticos para generación procedural de terrenos.

use super::Genome;

/// Tipo de bioma
#[derive(Clone, Debug)]
pub enum BiomeType {
    Desert,
    Forest,
    Mountain,
    Ocean,
    Tundra,
    Grassland,
    Wetland,
}

/// Genoma para terrenos
#[derive(Clone, Debug)]
pub struct TerrainGenome {
    /// Altura máxima del terreno
    pub max_height: f64,

    /// Factor de rugosidad (0.0 = suave, 1.0 = muy rugoso)
    pub roughness: f64,

    /// Escala del terreno
    pub scale: f64,

    /// Número de octavas para FBM
    pub octaves: u32,

    /// Persistencia del ruido
    pub persistence: f64,

    /// Lacunarity del ruido
    pub lacunarity: f64,

    /// Exponente para control de altura
    pub exponent: f64,

    /// Offset vertical
    pub height_offset: f64,

    /// Frecuencia base del ruido
    pub base_frequency: f64,

    /// Tipo de bioma predominante
    pub biome: BiomeType,

    /// Nivel de detalle
    pub detail_level: u32,
}

impl Genome for TerrainGenome {
    fn random() -> Self {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        Self {
            max_height: rng.gen_range(10.0..=1000.0),
            roughness: rng.gen_range(0.1..=0.9),
            scale: rng.gen_range(0.001..=0.1),
            octaves: rng.gen_range(1..=8),
            persistence: rng.gen_range(0.3..=0.7),
            lacunarity: rng.gen_range(1.5..=2.5),
            exponent: rng.gen_range(0.5..=2.0),
            height_offset: rng.gen_range(-50.0..=50.0),
            base_frequency: rng.gen_range(0.5..=2.0),
            biome: match rng.gen_range(0..7) {
                0 => BiomeType::Desert,
                1 => BiomeType::Forest,
                2 => BiomeType::Mountain,
                3 => BiomeType::Ocean,
                4 => BiomeType::Tundra,
                5 => BiomeType::Grassland,
                _ => BiomeType::Wetland,
            },
            detail_level: rng.gen_range(3..=10),
        }
    }

    fn crossover(&self, other: &Self, ratio: f64) -> Self {
        let r = ratio.clamp(0.0, 1.0);
        Self {
            max_height: self.max_height * (1.0 - r) + other.max_height * r,
            roughness: self.roughness * (1.0 - r) + other.roughness * r,
            scale: self.scale * (1.0 - r) + other.scale * r,
            octaves: if r < 0.5 { self.octaves } else { other.octaves },
            persistence: self.persistence * (1.0 - r) + other.persistence * r,
            lacunarity: self.lacunarity * (1.0 - r) + other.lacunarity * r,
            exponent: self.exponent * (1.0 - r) + other.exponent * r,
            height_offset: self.height_offset * (1.0 - r) + other.height_offset * r,
            base_frequency: self.base_frequency * (1.0 - r) + other.base_frequency * r,
            biome: if r < 0.5 {
                self.biome.clone()
            } else {
                other.biome.clone()
            },
            detail_level: if r < 0.5 {
                self.detail_level
            } else {
                other.detail_level
            },
        }
    }

    fn mutate(&mut self, rate: f64, strength: f64) {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        if rng.gen::<f64>() < rate {
            self.roughness += rng.gen_range(-strength..=strength);
            self.roughness = self.roughness.clamp(0.0, 1.0);
        }

        if rng.gen::<f64>() < rate {
            self.octaves = ((self.octaves as i32) + rng.gen_range(-1..=1)).clamp(1, 10) as u32;
        }

        if rng.gen::<f64>() < rate {
            self.max_height *= 1.0 + rng.gen_range(-strength..=strength);
            self.max_height = self.max_height.max(1.0);
        }
    }

    fn fitness(&self) -> f64 {
        let mut score = 1.0;

        // Favorecer terrenos variados pero no extremos
        if self.roughness > 0.2 && self.roughness < 0.8 {
            score *= 1.2;
        }

        // Favorecer rango dinámico adecuado de altura
        if self.max_height > 50.0 && self.max_height < 500.0 {
            score *= 1.1;
        }

        score
    }
}
