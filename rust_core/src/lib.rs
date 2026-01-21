use pyo3::prelude::*;
use noise::{NoiseFn, Perlin, Seedable};
use rand::prelude::*;

#[pyclass]
#[derive(Clone, Debug)]
struct Genome {
    #[pyo3(get, set)]
    frequency: f64,
    #[pyo3(get, set)]
    lacunarity: f64,
    #[pyo3(get, set)]
    persistence: f64,
    #[pyo3(get, set)]
    octaves: usize,
    #[pyo3(get, set)]
    seed: u32,
    #[pyo3(get, set)]
    offset_x: f64,
    #[pyo3(get, set)]
    offset_y: f64,
    #[pyo3(get, set)]
    ridge_threshold: f64,
    #[pyo3(get, set)]
    turbulence: f64,
}

#[pymethods]
impl Genome {
    #[new]
    fn new(frequency: f64, lacunarity: f64, persistence: f64, octaves: usize, seed: u32) -> Self {
        Genome { 
            frequency, 
            lacunarity, 
            persistence, 
            octaves, 
            seed, 
            offset_x: 0.0, 
            offset_y: 0.0,
            ridge_threshold: 0.5,
            turbulence: 0.0,
        }
    }

    #[staticmethod]
    fn random() -> Self {
        let mut rng = rand::thread_rng();
        Genome {
            frequency: rng.gen_range(0.005..0.15),
            lacunarity: rng.gen_range(1.8..2.5),
            persistence: rng.gen_range(0.3..0.6),
            octaves: rng.gen_range(2..7),
            seed: rng.gen(),
            offset_x: rng.gen_range(-5000.0..5000.0),
            offset_y: rng.gen_range(-5000.0..5000.0),
            ridge_threshold: rng.gen_range(0.2..0.8),
            turbulence: rng.gen_range(0.0..1.0),
        }
    }
}

#[pyclass]
#[derive(Clone, Debug)]
struct PlanetGenome {
    #[pyo3(get, set)]
    elevation_scale: f64,
    #[pyo3(get, set)]
    ocean_level: f64,
    #[pyo3(get, set)]
    mountain_sharpness: f64,
    #[pyo3(get, set)]
    crater_density: f64,
    #[pyo3(get, set)]
    ice_cap_coverage: f64,
    #[pyo3(get, set)]
    desert_threshold: f64,
    #[pyo3(get, set)]
    forest_density: f64,
    #[pyo3(get, set)]
    cloud_density: f64,
    #[pyo3(get, set)]
    frequency: f64,
    #[pyo3(get, set)]
    lacunarity: f64,
    #[pyo3(get, set)]
    persistence: f64,
    #[pyo3(get, set)]
    octaves: usize,
    #[pyo3(get, set)]
    seed: u32,
    #[pyo3(get, set)]
    atmosphere_thickness: f64,
}

#[pymethods]
impl PlanetGenome {
    #[new]
    fn new(elevation_scale: f64, ocean_level: f64, mountain_sharpness: f64, 
           crater_density: f64, ice_cap_coverage: f64, desert_threshold: f64, 
           forest_density: f64, cloud_density: f64, frequency: f64, 
           lacunarity: f64, persistence: f64, octaves: usize, 
           seed: u32, atmosphere_thickness: f64) -> Self {
        PlanetGenome {
            elevation_scale,
            ocean_level,
            mountain_sharpness,
            crater_density,
            ice_cap_coverage,
            desert_threshold,
            forest_density,
            cloud_density,
            frequency,
            lacunarity,
            persistence,
            octaves,
            seed,
            atmosphere_thickness,
        }
    }

    #[staticmethod]
    fn random() -> Self {
        let mut rng = rand::thread_rng();
        PlanetGenome {
            elevation_scale: rng.gen_range(0.0..1.0),
            ocean_level: rng.gen_range(0.0..1.0),
            mountain_sharpness: rng.gen_range(0.1..2.0),
            crater_density: rng.gen_range(0.0..1.0),
            ice_cap_coverage: rng.gen_range(0.0..1.0),
            desert_threshold: rng.gen_range(0.0..1.0),
            forest_density: rng.gen_range(0.0..1.0),
            cloud_density: rng.gen_range(0.0..1.0),
            frequency: rng.gen_range(0.005..0.15),
            lacunarity: rng.gen_range(1.8..2.5),
            persistence: rng.gen_range(0.3..0.6),
            octaves: rng.gen_range(2..7),
            seed: rng.gen(),
            atmosphere_thickness: rng.gen_range(0.0..1.0),
        }
    }
}

#[pyclass]
#[derive(Clone, Debug)]
struct GalaxyGenome {
    #[pyo3(get, set)]
    num_arms: usize,
    #[pyo3(get, set)]
    arm_tightness: f64,
    #[pyo3(get, set)]
    core_density: f64,
    #[pyo3(get, set)]
    arm_spread: f64,
    #[pyo3(get, set)]
    star_count: usize,
    #[pyo3(get, set)]
    color_temperature: f64,
    #[pyo3(get, set)]
    rotation_speed: f64,
    #[pyo3(get, set)]
    ellipticity: f64,
    #[pyo3(get, set)]
    seed: u32,
}

#[pymethods]
impl GalaxyGenome {
    #[new]
    fn new(num_arms: usize, arm_tightness: f64, core_density: f64, arm_spread: f64, 
           star_count: usize, color_temperature: f64, rotation_speed: f64, 
           ellipticity: f64, seed: u32) -> Self {
        GalaxyGenome {
            num_arms,
            arm_tightness,
            core_density,
            arm_spread,
            star_count,
            color_temperature,
            rotation_speed,
            ellipticity,
            seed,
        }
    }

    #[staticmethod]
    fn random() -> Self {
        let mut rng = rand::thread_rng();
        GalaxyGenome {
            num_arms: rng.gen_range(1..9),
            arm_tightness: rng.gen_range(0.1..2.0),
            core_density: rng.gen_range(0.0..1.0),
            arm_spread: rng.gen_range(0.1..1.0),
            star_count: rng.gen_range(10000..100001),
            color_temperature: rng.gen_range(2000.0..10000.0),
            rotation_speed: rng.gen_range(0.0..1.0),
            ellipticity: rng.gen_range(0.0..1.0),
            seed: rng.gen(),
        }
    }
}

#[pyclass]
#[derive(Clone, serde::Serialize)]
struct GalaxyPoints {
    #[pyo3(get)]
    positions: Vec<f64>,
    #[pyo3(get)]
    colors: Vec<f64>,
    #[pyo3(get)]
    sizes: Vec<f64>,
}

#[pymethods]
impl GalaxyPoints {
    fn to_json(&self) -> String {
        serde_json::json!({
            "positions": self.positions,
            "colors": self.colors,
            "sizes": self.sizes
        }).to_string()
    }
}

fn star_color_from_temperature(temp: f64, rng: &mut impl rand::Rng) -> (f64, f64, f64) {
    let mut r = 0.0;
    let mut g = 0.0;
    let mut b = 0.0;

    if temp < 3500.0 {
        r = 1.0;
        g = temp / 3500.0 * 0.8;
        b = 0.0;
    } else if temp < 5000.0 {
        r = 1.0;
        g = (temp - 3500.0) / 1500.0 * 0.9 + 0.1;
        b = (temp - 3500.0) / 1500.0 * 0.3;
    } else if temp < 6500.0 {
        r = 1.0;
        g = 0.9 + (temp - 5000.0) / 1500.0 * 0.1;
        b = 0.3 + (temp - 5000.0) / 1500.0 * 0.7;
    } else if temp < 8000.0 {
        r = 1.0 - (temp - 6500.0) / 1500.0 * 0.1;
        g = 1.0;
        b = 1.0;
    } else {
        r = 0.7 + (temp - 8000.0) / 2000.0 * 0.1;
        g = 0.8 + (temp - 8000.0) / 2000.0 * 0.2;
        b = 1.0;
    }

    let variation = rng.gen_range(-0.05..0.05);
    (
        (r + variation).clamp(0.0, 1.0),
        (g + variation).clamp(0.0, 1.0),
        (b + variation).clamp(0.0, 1.0),
    )
}

#[pyclass]
struct Texture {
    #[pyo3(get)]
    width: usize,
    #[pyo3(get)]
    height: usize,
    #[pyo3(get)]
    data: Vec<f64>, // Flattened 2D array
}

#[pyclass]
struct Mesh {
    #[pyo3(get)]
    vertices: Vec<f64>, // Flattened x, y, z
    #[pyo3(get)]
    indices: Vec<u32>,
}

#[pymethods]
impl Mesh {
    fn to_obj(&self) -> String {
        let mut obj = String::new();
        for i in (0..self.vertices.len()).step_by(3) {
            obj.push_str(&format!("v {} {} {}\n", self.vertices[i], self.vertices[i+1], self.vertices[i+2]));
        }
        for i in (0..self.indices.len()).step_by(3) {
            obj.push_str(&format!("f {} {} {}\n", self.indices[i]+1, self.indices[i+1]+1, self.indices[i+2]+1));
        }
        obj
    }
}

#[pyfunction]
fn generate_texture(genome: &Genome, width: usize, height: usize) -> Texture {
    let perlin = Perlin::new(genome.seed);
    let mut data = Vec::with_capacity(width * height);

    for y in 0..height {
        for x in 0..width {
            let mut amplitude = 1.0;
            let mut frequency = genome.frequency;
            let mut noise_value = 0.0;
            let mut max_value = 0.0;

            for _ in 0..genome.octaves {
                let sample_x = (x as f64 + genome.offset_x) * frequency;
                let sample_y = (y as f64 + genome.offset_y) * frequency;
                
                let mut signal = perlin.get([sample_x, sample_y]);
                
                if genome.turbulence > 0.5 {
                    signal = signal.abs() * 2.0 - 1.0;
                }
                
                noise_value += signal * amplitude;
                max_value += amplitude;
                
                amplitude *= genome.persistence;
                frequency *= genome.lacunarity;
            }
            
            let normalized = if max_value > 0.0 { (noise_value / max_value) + 0.5 } else { 0.5 };
            
            let final_val = if normalized < genome.ridge_threshold {
                normalized * 0.5
            } else {
                normalized
            };

            data.push(final_val.clamp(0.0, 1.0));
        }
    }

    Texture { width, height, data }
}

#[pyfunction]
fn generate_mesh(genome: &Genome, width: usize, height: usize, scale: f64) -> Mesh {
    let texture = generate_texture(genome, width, height);
    let mut vertices = Vec::new();
    let mut indices = Vec::new();

    // Generate vertices
    for y in 0..height {
        for x in 0..width {
            let z = texture.data[y * width + x] * scale;
            vertices.push(x as f64);
            vertices.push(y as f64);
            vertices.push(z);
        }
    }

    // Generate indices
    for y in 0..height - 1 {
        for x in 0..width - 1 {
            let top_left = (y * width + x) as u32;
            let top_right = (y * width + x + 1) as u32;
            let bottom_left = ((y + 1) * width + x) as u32;
            let bottom_right = ((y + 1) * width + x + 1) as u32;

            // Triangle 1
            indices.push(top_left);
            indices.push(bottom_left);
            indices.push(top_right);

            // Triangle 2
            indices.push(top_right);
            indices.push(bottom_left);
            indices.push(bottom_right);
        }
    }

    Mesh { vertices, indices }
}

#[pyfunction]
fn generate_sphere_mesh(genome: &PlanetGenome, resolution: usize) -> Mesh {
    let perlin = Perlin::new(genome.seed);
    let mut vertices = Vec::new();
    let mut indices = Vec::new();
    
    let cube_size = 2.0;
    let step = cube_size / resolution as f64;
    
    for face in 0..6 {
        let offset_x = if face == 1 { cube_size } else if face == 4 { cube_size } else { 0.0 };
        let offset_y = if face == 2 { cube_size } else if face == 5 { cube_size } else { 0.0 };
        let offset_z = if face == 3 { cube_size } else if face == 5 { cube_size } else { 0.0 };
        
        let axis_x = if face % 2 == 0 { 1 } else { 0 };
        let axis_y = if (face / 2) % 2 == 0 { 1 } else { 0 };
        let axis_z = 1 - axis_x - axis_y;
        
        for y in 0..=resolution {
            for x in 0..=resolution {
                let mut px = x as f64 * step - cube_size / 2.0;
                let mut py = y as f64 * step - cube_size / 2.0;
                let mut pz = 0.0;
                
                let (tx, ty) = match face {
                    0 => (px, py),
                    1 => (py, pz),
                    2 => (pz, px),
                    3 => (px, py),
                    4 => (py, pz),
                    5 => (pz, px),
                    _ => (px, py),
                };
                
                let nx = (face / 2) as f64 * 2.0 - 1.0;
                let (ny, nz) = if face % 2 == 0 { (tx, ty) } else { (ty, tx) };
                
                let x_normal = if face % 3 == 0 { 1.0 } else if face % 3 == 1 { 0.0 } else { 0.0 };
                let y_normal = if face % 3 == 1 { 1.0 } else if face % 3 == 2 { 0.0 } else { 0.0 };
                let z_normal = if face % 3 == 2 { 1.0 } else if face % 3 == 0 { 0.0 } else { 0.0 };
                
                let sample_x = (nx + genome.seed as f64 * 0.01) * genome.frequency;
                let sample_y = (ny + genome.seed as f64 * 0.01) * genome.frequency;
                let sample_z = (nz + genome.seed as f64 * 0.01) * genome.frequency;
                
                let mut noise_value = 0.0;
                let mut amplitude = 1.0;
                let mut frequency = genome.frequency;
                let mut max_value = 0.0;
                
                for _ in 0..genome.octaves {
                    let sample_vec = [sample_x * frequency, sample_y * frequency, sample_z * frequency];
                    let signal = perlin.get(sample_vec);
                    noise_value += signal * amplitude;
                    max_value += amplitude;
                    amplitude *= genome.persistence;
                    frequency *= genome.lacunarity;
                }
                
                let normalized = (noise_value / max_value) + 0.5;
                let elevation = (normalized.clamp(0.0, 1.0) * genome.elevation_scale * 10.0) * genome.mountain_sharpness.powf(normalized);
                
                let radius = 50.0 + elevation;
                let dir = [x_normal, y_normal, z_normal];
                let sum_squares = (dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]) as f64;
                let magnitude = sum_squares.sqrt();
                let dir_norm = [dir[0] / magnitude, dir[1] / magnitude, dir[2] / magnitude];
                
                vertices.push(dir_norm[0] * radius);
                vertices.push(dir_norm[1] * radius);
                vertices.push(dir_norm[2] * radius);
            }
        }
    }
    
    let vertices_per_face = (resolution + 1) * (resolution + 1);
    for face in 0..6 {
        let face_offset = face * vertices_per_face;
        for y in 0..resolution {
            for x in 0..resolution {
                let top_left = (face_offset + y * (resolution + 1) + x) as u32;
                let top_right = (face_offset + y * (resolution + 1) + x + 1) as u32;
                let bottom_left = (face_offset + (y + 1) * (resolution + 1) + x) as u32;
                let bottom_right = (face_offset + (y + 1) * (resolution + 1) + x + 1) as u32;
                
                indices.push(top_left);
                indices.push(bottom_left);
                indices.push(top_right);
                
                indices.push(top_right);
                indices.push(bottom_left);
                indices.push(bottom_right);
            }
        }
    }
    
    Mesh { vertices, indices }
}

#[pyfunction]
fn generate_galaxy_points(genome: &GalaxyGenome) -> GalaxyPoints {
    let mut rng = rand::thread_rng();
    let perlin = Perlin::new(genome.seed);
    
    let mut positions = Vec::with_capacity(genome.star_count * 3);
    let mut colors = Vec::with_capacity(genome.star_count * 3);
    let mut sizes = Vec::with_capacity(genome.star_count);
    
    let arm_count = genome.num_arms;
    let arm_angle_offset = 2.0 * std::f64::consts::PI / arm_count as f64;
    
    for i in 0..genome.star_count {
        let arm_index = i % arm_count;
        let distance_ratio = (i as f64 / genome.star_count as f64).powf(genome.core_density);
        let max_radius = 100.0;
        let radius = distance_ratio * max_radius;
        
        let angle = (radius * genome.arm_tightness * 0.1) + (arm_index as f64 * arm_angle_offset);
        
        let noise = perlin.get([
            radius * 0.01 + genome.seed as f64 * 0.01,
            angle * 10.0
        ]) * genome.arm_spread * 2.0;
        
        let spread = genome.arm_spread * distance_ratio * 10.0 + noise;
        
        let x = (radius + spread * rng.gen_range(-1.0..1.0)) * angle.cos();
        let y = (radius + spread * rng.gen_range(-1.0..1.0)) * angle.sin();
        let z = spread * rng.gen_range(-1.0..1.0) * (1.0 - genome.ellipticity);
        
        positions.push(x);
        positions.push(y);
        positions.push(z);
        
        let (r, g, b) = star_color_from_temperature(genome.color_temperature, &mut rng);
        colors.push(r);
        colors.push(g);
        colors.push(b);
        
        let size = (1.0 - distance_ratio * 0.7) * rng.gen_range(0.5..1.5);
        sizes.push(size);
    }
    
    GalaxyPoints {
        positions,
        colors,
        sizes,
    }
}

fn galaxy_crossover<R: Rng>(p1: &GalaxyGenome, p2: &GalaxyGenome, rng: &mut R) -> GalaxyGenome {
    GalaxyGenome {
        num_arms: if rng.gen() { p1.num_arms } else { p2.num_arms },
        arm_tightness: if rng.gen() { p1.arm_tightness } else { p2.arm_tightness },
        core_density: if rng.gen() { p1.core_density } else { p2.core_density },
        arm_spread: if rng.gen() { p1.arm_spread } else { p2.arm_spread },
        star_count: if rng.gen() { p1.star_count } else { p2.star_count },
        color_temperature: if rng.gen() { p1.color_temperature } else { p2.color_temperature },
        rotation_speed: if rng.gen() { p1.rotation_speed } else { p2.rotation_speed },
        ellipticity: if rng.gen() { p1.ellipticity } else { p2.ellipticity },
        seed: rng.gen(),
    }
}

fn galaxy_mutate<R: Rng>(genome: &mut GalaxyGenome, rate: f64, rng: &mut R) {
    if rng.gen_bool(rate) {
        if rng.gen() {
            if genome.num_arms < 8 { genome.num_arms += 1; }
        } else {
            if genome.num_arms > 1 { genome.num_arms -= 1; }
        }
    }
    if rng.gen_bool(rate) {
        genome.arm_tightness += rng.gen_range(-0.2..0.2);
        genome.arm_tightness = genome.arm_tightness.clamp(0.1, 2.0);
    }
    if rng.gen_bool(rate) {
        genome.core_density += rng.gen_range(-0.1..0.1);
        genome.core_density = genome.core_density.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.arm_spread += rng.gen_range(-0.1..0.1);
        genome.arm_spread = genome.arm_spread.clamp(0.1, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.color_temperature += rng.gen_range(-500.0..500.0);
        genome.color_temperature = genome.color_temperature.clamp(2000.0, 10000.0);
    }
    if rng.gen_bool(rate) {
        genome.rotation_speed += rng.gen_range(-0.1..0.1);
        genome.rotation_speed = genome.rotation_speed.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.ellipticity += rng.gen_range(-0.1..0.1);
        genome.ellipticity = genome.ellipticity.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate * 0.1) {
        genome.seed = rng.gen();
    }
}

#[pyfunction]
fn evolve_galaxy_population(
    current_population: Vec<(GalaxyGenome, f64)>,
    mutation_rate: f64,
    elitism_count: usize
) -> Vec<GalaxyGenome> {
    let mut rng = rand::thread_rng();
    let mut new_population = Vec::new();
    
    let mut sorted_pop = current_population.clone();
    sorted_pop.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    
    for i in 0..elitism_count {
        if i < sorted_pop.len() {
            new_population.push(sorted_pop[i].0.clone());
        }
    }
    
    while new_population.len() < current_population.len() {
        let idx1 = rng.gen_range(0..sorted_pop.len());
        let idx2 = rng.gen_range(0..sorted_pop.len());
        let parent1 = &sorted_pop[idx1].0;
        let parent2 = &sorted_pop[idx2].0;
        
        let mut child = galaxy_crossover(parent1, parent2, &mut rng);
        galaxy_mutate(&mut child, mutation_rate, &mut rng);
        
        new_population.push(child);
    }
    
    new_population
}

fn planet_crossover<R: Rng>(p1: &PlanetGenome, p2: &PlanetGenome, rng: &mut R) -> PlanetGenome {
    PlanetGenome {
        elevation_scale: if rng.gen() { p1.elevation_scale } else { p2.elevation_scale },
        ocean_level: if rng.gen() { p1.ocean_level } else { p2.ocean_level },
        mountain_sharpness: if rng.gen() { p1.mountain_sharpness } else { p2.mountain_sharpness },
        crater_density: if rng.gen() { p1.crater_density } else { p2.crater_density },
        ice_cap_coverage: if rng.gen() { p1.ice_cap_coverage } else { p2.ice_cap_coverage },
        desert_threshold: if rng.gen() { p1.desert_threshold } else { p2.desert_threshold },
        forest_density: if rng.gen() { p1.forest_density } else { p2.forest_density },
        cloud_density: if rng.gen() { p1.cloud_density } else { p2.cloud_density },
        frequency: if rng.gen() { p1.frequency } else { p2.frequency },
        lacunarity: if rng.gen() { p1.lacunarity } else { p2.lacunarity },
        persistence: if rng.gen() { p1.persistence } else { p2.persistence },
        octaves: if rng.gen() { p1.octaves } else { p2.octaves },
        seed: rng.gen(),
        atmosphere_thickness: if rng.gen() { p1.atmosphere_thickness } else { p2.atmosphere_thickness },
    }
}

fn planet_mutate<R: Rng>(genome: &mut PlanetGenome, rate: f64, rng: &mut R) {
    if rng.gen_bool(rate) {
        genome.elevation_scale += rng.gen_range(-0.1..0.1);
        genome.elevation_scale = genome.elevation_scale.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.ocean_level += rng.gen_range(-0.1..0.1);
        genome.ocean_level = genome.ocean_level.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.mountain_sharpness += rng.gen_range(-0.2..0.2);
        genome.mountain_sharpness = genome.mountain_sharpness.clamp(0.1, 2.0);
    }
    if rng.gen_bool(rate) {
        genome.crater_density += rng.gen_range(-0.1..0.1);
        genome.crater_density = genome.crater_density.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.ice_cap_coverage += rng.gen_range(-0.1..0.1);
        genome.ice_cap_coverage = genome.ice_cap_coverage.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.desert_threshold += rng.gen_range(-0.1..0.1);
        genome.desert_threshold = genome.desert_threshold.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.forest_density += rng.gen_range(-0.1..0.1);
        genome.forest_density = genome.forest_density.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.cloud_density += rng.gen_range(-0.1..0.1);
        genome.cloud_density = genome.cloud_density.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.frequency += rng.gen_range(-0.02..0.02);
        genome.frequency = genome.frequency.clamp(0.001, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.lacunarity += rng.gen_range(-0.2..0.2);
        genome.lacunarity = genome.lacunarity.clamp(1.0, 4.0);
    }
    if rng.gen_bool(rate) {
        genome.persistence += rng.gen_range(-0.1..0.1);
        genome.persistence = genome.persistence.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate * 0.1) {
        genome.seed = rng.gen();
    }
    if rng.gen_bool(rate) {
        genome.atmosphere_thickness += rng.gen_range(-0.1..0.1);
        genome.atmosphere_thickness = genome.atmosphere_thickness.clamp(0.0, 1.0);
    }
}

#[pyfunction]
fn evolve_planet_population(
    current_population: Vec<(PlanetGenome, f64)>,
    mutation_rate: f64,
    elitism_count: usize
) -> Vec<PlanetGenome> {
    let mut rng = rand::thread_rng();
    let mut new_population = Vec::new();
    
    let mut sorted_pop = current_population.clone();
    sorted_pop.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    
    for i in 0..elitism_count {
        if i < sorted_pop.len() {
            new_population.push(sorted_pop[i].0.clone());
        }
    }
    
    while new_population.len() < current_population.len() {
        let idx1 = rng.gen_range(0..sorted_pop.len());
        let idx2 = rng.gen_range(0..sorted_pop.len());
        let parent1 = &sorted_pop[idx1].0;
        let parent2 = &sorted_pop[idx2].0;
        
        let mut child = planet_crossover(parent1, parent2, &mut rng);
        planet_mutate(&mut child, mutation_rate, &mut rng);
        
        new_population.push(child);
    }
    
    new_population
}

fn tournament_select<'a, R: Rng>(population: &'a Vec<(Genome, f64)>, rng: &mut R) -> &'a Genome {
    let size = 3;
    let mut best: Option<&(Genome, f64)> = None;

    for _ in 0..size {
        let idx = rng.gen_range(0..population.len());
        let candidate = &population[idx];
        match best {
            None => best = Some(candidate),
            Some(b) => {
                if candidate.1 > b.1 {
                    best = Some(candidate);
                }
            }
        }
    }
    &best.unwrap().0
}

fn crossover<R: Rng>(p1: &Genome, p2: &Genome, rng: &mut R) -> Genome {
    Genome {
        frequency: if rng.gen() { p1.frequency } else { p2.frequency },
        lacunarity: if rng.gen() { p1.lacunarity } else { p2.lacunarity },
        persistence: if rng.gen() { p1.persistence } else { p2.persistence },
        octaves: if rng.gen() { p1.octaves } else { p2.octaves },
        seed: if rng.gen() { p1.seed } else { p2.seed },
        offset_x: if rng.gen() { p1.offset_x } else { p2.offset_x },
        offset_y: if rng.gen() { p1.offset_y } else { p2.offset_y },
        ridge_threshold: if rng.gen() { p1.ridge_threshold } else { p2.ridge_threshold },
        turbulence: if rng.gen() { p1.turbulence } else { p2.turbulence },
    }
}

fn mutate<R: Rng>(genome: &mut Genome, rate: f64, rng: &mut R) {
    if rng.gen_bool(rate) {
        genome.frequency += rng.gen_range(-0.02..0.02);
        genome.frequency = genome.frequency.clamp(0.001, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.lacunarity += rng.gen_range(-0.2..0.2);
        genome.lacunarity = genome.lacunarity.clamp(1.0, 4.0);
    }
    if rng.gen_bool(rate) {
        genome.persistence += rng.gen_range(-0.1..0.1);
        genome.persistence = genome.persistence.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        if rng.gen() {
            if genome.octaves < 8 { genome.octaves += 1; }
        } else {
            if genome.octaves > 1 { genome.octaves -= 1; }
        }
    }
    if rng.gen_bool(rate) {
        genome.offset_x += rng.gen_range(-100.0..100.0);
        genome.offset_y += rng.gen_range(-100.0..100.0);
    }
    if rng.gen_bool(rate) {
        genome.ridge_threshold += rng.gen_range(-0.1..0.1);
        genome.ridge_threshold = genome.ridge_threshold.clamp(0.0, 1.0);
    }
    if rng.gen_bool(rate) {
        genome.turbulence = if genome.turbulence > 0.5 { 0.0 } else { 1.0 };
    }
    if rng.gen_bool(rate * 0.1) {
        genome.seed = rng.gen();
    }
}

#[pyfunction]
fn evolve_population(
    current_population: Vec<(Genome, f64)>, // (Genome, fitness)
    mutation_rate: f64,
    elitism_count: usize
) -> Vec<Genome> {
    let mut rng = rand::thread_rng();
    let mut new_population = Vec::new();
    
    // Sort by fitness (descending)
    let mut sorted_pop = current_population.clone();
    sorted_pop.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    // Elitism: Keep the best ones
    for i in 0..elitism_count {
        if i < sorted_pop.len() {
            new_population.push(sorted_pop[i].0.clone());
        }
    }

    // Fill the rest
    while new_population.len() < current_population.len() {
        // Tournament Selection
        let parent1 = tournament_select(&sorted_pop, &mut rng);
        let parent2 = tournament_select(&sorted_pop, &mut rng);

        // Crossover
        let mut child = crossover(parent1, parent2, &mut rng);

        // Mutation
        mutate(&mut child, mutation_rate, &mut rng);

        new_population.push(child);
    }

    new_population
}

#[pymodule]
fn procedural_graph_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Genome>()?;
    m.add_class::<GalaxyGenome>()?;
    m.add_class::<PlanetGenome>()?;
    m.add_class::<Texture>()?;
    m.add_class::<Mesh>()?;
    m.add_class::<GalaxyPoints>()?;
    m.add_function(wrap_pyfunction!(generate_texture, m)?)?;
    m.add_function(wrap_pyfunction!(generate_mesh, m)?)?;
    m.add_function(wrap_pyfunction!(evolve_population, m)?)?;
    m.add_function(wrap_pyfunction!(generate_galaxy_points, m)?)?;
    m.add_function(wrap_pyfunction!(evolve_galaxy_population, m)?)?;
    m.add_function(wrap_pyfunction!(generate_sphere_mesh, m)?)?;
    m.add_function(wrap_pyfunction!(evolve_planet_population, m)?)?;
    Ok(())
}
