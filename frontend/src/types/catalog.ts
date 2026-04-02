export interface GalaxyCatalogItem {
  id: string;
  name: string;
  type: string;
  description: string;
  physical_properties: {
    mass?: number;
    mass_unit?: string;
    diameter?: number;
    diameter_unit?: string;
    star_count?: string;
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
}

export interface PlanetCatalogItem {
  id: string;
  name: string;
  type: string;
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
}

export type CatalogTab = 'galaxies' | 'planets';
