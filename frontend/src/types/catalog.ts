export interface GalaxyCatalogItem {
  id: string;
  name: string;
  type: string;
  category: 'real' | 'procedural';
  description: string;
  physical_properties: {
    mass?: number;
    mass_unit?: string;
    diameter?: number;
    diameter_unit?: string;
    star_count?: string;
    distance_light_years?: number;
  };
  visual_properties: {
    color_temperature?: number;
    num_arms?: number;
    barred_spiral?: boolean;
    color_hex?: string;
    texture_type?: string;
    brightness?: number;
    apparent_magnitude?: number;
  };
  comparison_params: {
    galaxy_genome: {
      num_arms: number;
      arm_tightness: number;
      core_density: number;
      star_count: number;
    }
  };
  fun_facts: string[];
  discovery?: {
    year: number | null;
    discoverer: string | null;
    method: string | null;
  };
  educational_links?: {
    nasa?: string;
    esahubble?: string;
    esa?: string;
    wikipedia?: string;
  };
  image_urls?: {
    thumbnail?: string;
    high_res?: string;
  };
}

export interface PlanetCatalogItem {
  id: string;
  name: string;
  type: string;
  category: 'real' | 'procedural';
  description: string;
  physical_properties: {
    mass?: number;
    mass_unit?: string;
    diameter?: number;
    diameter_unit?: string;
    gravity?: number;
    mass_kg?: number;
    radius_km?: number;
    age_gyr?: number;
    temperature_k?: number;
    density_g_cm3?: number;
    gravity_m_s2?: number;
    orbital_period_days?: number;
    rotation_period_hours?: number;
    axial_tilt_degrees?: number;
    moons_count?: number;
    surface_pressure_atm?: number;
  };
  visual_properties: {
    color?: string;
    atmosphere?: boolean;
    clouds?: boolean;
    water_coverage?: number;
    color_hex?: string;
    texture_type?: string;
    brightness?: number;
    apparent_magnitude?: number;
  };
  comparison_params: {
    planet_genome: {
      radius: number;
      water_coverage: number;
      atmosphere_type: string;
    }
  };
  atmosphere_composition?: Record<string, number | string[]>;
  notable_moons?: string[];
  rings?: boolean;
  magnetic_field?: boolean;
  exploration_missions?: string[];
  fun_facts: string[];
  discovery?: {
    year: number | null;
    discoverer: string | null;
    method: string | null;
  };
  educational_links?: {
    nasa?: string;
    esa?: string;
    wikipedia?: string;
  };
  image_urls?: {
    thumbnail?: string;
    high_res?: string;
  };
}

export type CatalogTab = 'galaxies' | 'planets';
