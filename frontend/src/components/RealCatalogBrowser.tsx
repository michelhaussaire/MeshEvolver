import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Globe, 
  BookOpen, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  Dna,
  Info
} from 'lucide-react';
import RealObjectCard from './RealObjectCard';
import { GalaxyCatalogItem, PlanetCatalogItem, CatalogTab } from '../types/catalog';

interface RealCatalogBrowserProps {
  onClose: () => void;
  onSelectObject: (genome: Record<string, number>, type: 'galaxy' | 'planet') => void;
}

interface GalaxyGenome {
  num_arms: number;
  arm_tightness: number;
  core_density: number;
  arm_spread: number;
  star_count: number;
  color_temperature: number;
  rotation_speed: number;
  ellipticity: number;
  thickness: number;
  seed: number;
}

interface PlanetGenome {
  elevation_scale: number;
  ocean_level: number;
  mountain_sharpness: number;
  crater_density: number;
  ice_cap_coverage: number;
  desert_threshold: number;
  forest_density: number;
  cloud_density: number;
  frequency: number;
  lacunarity: number;
  persistence: number;
  octaves: number;
  seed: number;
  atmosphere_thickness: number;
}

const RealCatalogBrowser: React.FC<RealCatalogBrowserProps> = ({ onClose, onSelectObject }) => {
  const [activeTab, setActiveTab] = useState<CatalogTab>('galaxies');
  const [galaxies, setGalaxies] = useState<GalaxyCatalogItem[]>([]);
  const [planets, setPlanets] = useState<PlanetCatalogItem[]>([]);
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyCatalogItem | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetCatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [galaxiesRes, planetsRes] = await Promise.all([
        fetch('/api/catalog/galaxies'),
        fetch('/api/catalog/planets')
      ]);

      if (!galaxiesRes.ok || !planetsRes.ok) {
        throw new Error('Failed to fetch catalog');
      }

      const galaxiesData = await galaxiesRes.json();
      const planetsData = await planetsRes.json();

      setGalaxies(galaxiesData);
      setPlanets(planetsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGalaxy = async (galaxy: GalaxyCatalogItem) => {
    try {
      const res = await fetch(`/api/catalog/galaxies/${galaxy.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setSelectedGalaxy(fullData);
        setSelectedPlanet(null);
      }
    } catch (err) {
      console.error('Failed to fetch galaxy details', err);
    }
  };

  const handleSelectPlanet = async (planet: PlanetCatalogItem) => {
    try {
      const res = await fetch(`/api/catalog/planets/${planet.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setSelectedPlanet(fullData);
        setSelectedGalaxy(null);
      }
    } catch (err) {
      console.error('Failed to fetch planet details', err);
    }
  };

  const handleUseGenome = () => {
    if (selectedGalaxy && selectedGalaxy.comparison_params?.galaxy_genome) {
      const genome: GalaxyGenome = {
        ...selectedGalaxy.comparison_params.galaxy_genome,
        arm_spread: 0.5,
        color_temperature: selectedGalaxy.visual_properties?.color_temperature || 5778,
        rotation_speed: 0.5,
        ellipticity: 0.1,
        thickness: 0.2,
        seed: Math.floor(Math.random() * 10000)
      };
      onSelectObject(genome as unknown as Record<string, number>, 'galaxy');
    } else if (selectedPlanet && selectedPlanet.comparison_params?.planet_genome) {
      const planetGenome = selectedPlanet.comparison_params.planet_genome;
      const genome: PlanetGenome = {
        elevation_scale: 0.5,
        ocean_level: planetGenome.water_coverage,
        mountain_sharpness: 0.5,
        crater_density: 0.3,
        ice_cap_coverage: 0.1,
        desert_threshold: 0.4,
        forest_density: 0.3,
        cloud_density: 0.5,
        frequency: 2.0,
        lacunarity: 2.0,
        persistence: 0.5,
        octaves: 6,
        seed: Math.floor(Math.random() * 10000),
        atmosphere_thickness: planetGenome.atmosphere_type === 'gas_giant' ? 1.0 : 
                              planetGenome.atmosphere_type === 'moderate' ? 0.5 : 0.2
      };
      onSelectObject(genome as unknown as Record<string, number>, 'planet');
    }
  };

  const currentItems = activeTab === 'galaxies' ? galaxies : planets;
  const selectedItem = activeTab === 'galaxies' ? selectedGalaxy : selectedPlanet;
  const accentColor = activeTab === 'galaxies' ? 'purple' : 'emerald';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="w-full max-w-7xl h-[90vh] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-${accentColor}-500/10 border border-${accentColor}-500/20 flex items-center justify-center`}>
                <BookOpen className={`text-${accentColor}-400`} size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Catálogo de Objetos Reales</h2>
                <p className="text-xs text-slate-500">Explora galaxias y planetas del universo conocido</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="text-slate-400" size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 flex gap-2">
            <button
              onClick={() => { setActiveTab('galaxies'); setSelectedGalaxy(null); setSelectedPlanet(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'galaxies' 
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Star size={16} />
              <span className="font-semibold text-sm">Galaxias</span>
            </button>
            <button
              onClick={() => { setActiveTab('planets'); setSelectedGalaxy(null); setSelectedPlanet(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'planets' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Globe size={16} />
              <span className="font-semibold text-sm">Planetas</span>
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                  <Dna className="animate-spin" size={24} />
                  <span>Cargando catálogo...</span>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-red-400 text-center">
                  <p className="font-semibold">Error al cargar el catálogo</p>
                  <p className="text-sm text-slate-500">{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((item) => (
                  <RealObjectCard
                    key={item.id}
                    item={item}
                    type={activeTab === 'galaxies' ? 'galaxy' : 'planet'}
                    isSelected={selectedItem?.id === item.id}
                    onSelect={() => {
                      if (activeTab === 'galaxies') {
                        handleSelectGalaxy(item as GalaxyCatalogItem);
                      } else {
                        handleSelectPlanet(item as PlanetCatalogItem);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="w-96 border-l border-slate-800 bg-slate-900/50 flex flex-col">
          {selectedItem ? (
            <>
              <div className="p-6 border-b border-slate-800">
                <span className={`text-[10px] font-bold text-${accentColor}-400 uppercase tracking-wider`}>
                  {activeTab === 'galaxies' ? 'Galaxia' : 'Planeta'}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">{selectedItem.name}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{selectedItem.description}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Physical Properties */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info size={12} /> Propiedades Físicas
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedItem.physical_properties).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-slate-300 font-mono">
                          {typeof value === 'number' ? value.toExponential(2) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fun Facts */}
                {selectedItem.fun_facts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles size={12} /> Datos Curiosos
                    </h4>
                    <ul className="space-y-2">
                      {selectedItem.fun_facts.map((fact, i) => (
                        <li key={i} className="text-xs text-slate-400 leading-relaxed flex gap-2">
                          <span className={`text-${accentColor}-400 mt-0.5`}>•</span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Educational Links */}
                {selectedItem.educational_links && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ExternalLink size={12} /> Aprender Más
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedItem.educational_links).map(([name, url]) => (
                        <a
                          key={name}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-1.5 bg-slate-800 hover:bg-${accentColor}-500/10 rounded-lg text-xs text-slate-400 hover:text-${accentColor}-400 transition-colors flex items-center gap-1`}
                        >
                          {name.toUpperCase()}
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-6 border-t border-slate-800">
                <button
                  onClick={handleUseGenome}
                  className={`w-full py-3 rounded-xl bg-${accentColor}-500 hover:bg-${accentColor}-400 text-white font-bold transition-all flex items-center justify-center gap-2 group`}
                >
                  <Dna size={18} />
                  Usar Parámetros
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                  Carga el genoma en el generador procedural
                </p>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center">
              <div className={`w-16 h-16 rounded-full bg-${accentColor}-500/5 flex items-center justify-center mb-4`}>
                {activeTab === 'galaxies' ? <Star size={32} /> : <Globe size={32} />}
              </div>
              <p className="text-sm">Selecciona un {activeTab === 'galaxies' ? 'objeto' : 'planeta'} para ver detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealCatalogBrowser;
