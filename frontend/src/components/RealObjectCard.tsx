import React from 'react';
import { Star, Globe, Sparkles, Image as ImageIcon, Orbit, Thermometer, Gauge } from 'lucide-react';
import { GalaxyCatalogItem, PlanetCatalogItem } from '../types/catalog';

interface RealObjectCardProps {
  item: GalaxyCatalogItem | PlanetCatalogItem;
  onSelect: () => void;
  isSelected?: boolean;
  type: 'galaxy' | 'planet';
}

const RealObjectCard: React.FC<RealObjectCardProps> = ({ item, onSelect, isSelected, type }) => {
  const isGalaxy = type === 'galaxy';
  const accentColor = isGalaxy ? 'purple' : 'emerald';
  const Icon = isGalaxy ? Star : Globe;

  const getTypeLabel = (itemType: string) => {
    const labels: Record<string, string> = {
      'spiral_galaxy': 'Galaxia Espiral',
      'elliptical_galaxy': 'Galaxia Elíptica',
      'lenticular_galaxy': 'Galaxia Lenticular',
      'ring_galaxy': 'Galaxia Anular',
      'terrestrial_planet': 'Planeta Terrestre',
      'gas_giant': 'Gigante Gaseoso',
      'ice_giant': 'Gigante Helado',
      'moon': 'Luna'
    };
    return labels[itemType] || itemType;
  };

  const getFormattedProperties = () => {
    if (isGalaxy) {
      const galaxy = item as GalaxyCatalogItem;
      return [
        { label: 'Estrellas', value: galaxy.physical_properties.star_count || 'N/A' },
        { label: 'Diámetro', value: galaxy.physical_properties.diameter 
          ? `${(galaxy.physical_properties.diameter / 1000).toFixed(0)}k al` 
          : 'N/A' },
        { label: 'Distancia', value: galaxy.physical_properties.distance_light_years
          ? `${(galaxy.physical_properties.distance_light_years / 1000000).toFixed(1)}M al`
          : 'N/A' },
      ];
    } else {
      const planet = item as PlanetCatalogItem;
      return [
        { label: 'Radio', value: planet.physical_properties.radius_km 
          ? `${planet.physical_properties.radius_km.toLocaleString()} km` 
          : 'N/A' },
        { label: 'Gravedad', value: planet.physical_properties.gravity_m_s2 
          ? `${planet.physical_properties.gravity_m_s2} m/s²` 
          : 'N/A' },
        { label: 'Lunas', value: planet.moons_count?.toString() || '0' },
      ];
    }
  };

  const hasRings = !isGalaxy && (item as PlanetCatalogItem).rings;
  const thumbnailUrl = item.image_urls?.thumbnail;

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
        isSelected 
          ? `border-${accentColor}-500 shadow-lg shadow-${accentColor}-500/20` 
          : 'border-slate-800 hover:border-slate-700'
      } bg-slate-900/50`}
    >
      {/* Header with thumbnail or gradient */}
      <div className={`h-24 relative overflow-hidden ${
        !thumbnailUrl ? `bg-gradient-to-br ${
          isGalaxy 
            ? 'from-purple-900/40 via-slate-900 to-slate-950' 
            : 'from-emerald-900/40 via-slate-900 to-slate-950'
        }` : ''
      }`}>
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={item.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        ) : (
          <>
            {/* Animated particles */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-1 rounded-full bg-${accentColor}-400`}
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animation: `pulse ${2 + i * 0.3}s ease-in-out infinite`
                  }}
                />
              ))}
            </div>
            <Icon 
              size={40} 
              className={`text-${accentColor}-400/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
            />
          </>
        )}
        {isSelected && (
          <div className={`absolute top-3 right-3 bg-${accentColor}-500 text-white rounded-full p-1 shadow-lg z-10`}>
            <Sparkles size={14} />
          </div>
        )}
        {/* Type badge */}
        <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-${accentColor}-500/80 text-white z-10`}>
          {getTypeLabel(item.type)}
        </div>
        {/* Rings indicator */}
        {hasRings && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/80 text-white flex items-center gap-1 z-10">
            <Orbit size={10} />
            Anillos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white">{item.name}</h3>
          {!isGalaxy && (item as PlanetCatalogItem).notable_moons && (item as PlanetCatalogItem).notable_moons!.length > 0 && (
            <p className="text-[10px] text-slate-500 mt-0.5">
              Lunas: {(item as PlanetCatalogItem).notable_moons?.slice(0, 3).join(', ')}
              {(item as PlanetCatalogItem).notable_moons!.length > 3 && '...'}
            </p>
          )}
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Physical Properties Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
          {getFormattedProperties().map((prop, i) => (
            <div key={i} className="text-center">
              <span className="block text-[8px] font-bold text-slate-600 uppercase">{prop.label}</span>
              <span className={`text-[10px] font-mono text-${accentColor}-400/80`}>{prop.value}</span>
            </div>
          ))}
        </div>

        {/* Additional badges for planets */}
        {!isGalaxy && (
          <div className="flex flex-wrap gap-1">
            {(item as PlanetCatalogItem).atmosphere && (
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-blue-500/20 text-blue-400">Atmósfera</span>
            )}
            {(item as PlanetCatalogItem).magnetic_field && (
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-purple-500/20 text-purple-400">Campo Mag.</span>
            )}
            {(item as PlanetCatalogItem).rings && (
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/20 text-amber-400">Anillos</span>
            )}
          </div>
        )}

        {/* Fun Facts Preview */}
        {item.fun_facts.length > 0 && (
          <div className="pt-2">
            <span className="text-[9px] font-bold text-slate-600 uppercase">Dato Curioso</span>
            <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">
              "{item.fun_facts[0]}"
            </p>
          </div>
        )}

        {/* Image attribution */}
        {item.image_urls && (
          <div className="pt-2 flex items-center gap-1 text-[8px] text-slate-600">
            <ImageIcon size={10} />
            <span>Imagen: NASA/ESA</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealObjectCard;
