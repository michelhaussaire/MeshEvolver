import React from 'react';
import { Star, Globe, Sparkles } from 'lucide-react';
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
      'terrestrial_planet': 'Planeta Terrestre',
      'gas_giant': 'Gigante Gaseoso',
      'moon': 'Luna'
    };
    return labels[itemType] || itemType;
  };

  const getFormattedProperties = () => {
    if (isGalaxy) {
      const galaxy = item as GalaxyCatalogItem;
      return [
        { label: 'Masa', value: galaxy.physical_properties.mass ? `${(galaxy.physical_properties.mass / 1e12).toFixed(1)}×10¹² M☉` : 'N/A' },
        { label: 'Diámetro', value: galaxy.physical_properties.diameter ? `${(galaxy.physical_properties.diameter / 1000).toFixed(0)}k al` : 'N/A' },
      ];
    } else {
      const planet = item as PlanetCatalogItem;
      return [
        { label: 'Radio', value: planet.physical_properties.radius_km ? `${planet.physical_properties.radius_km.toLocaleString()} km` : 'N/A' },
        { label: 'Gravedad', value: planet.physical_properties.gravity_m_s2 ? `${planet.physical_properties.gravity_m_s2} m/s²` : 'N/A' },
      ];
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
        isSelected 
          ? `border-${accentColor}-500 shadow-lg shadow-${accentColor}-500/20` 
          : 'border-slate-800 hover:border-slate-700'
      } bg-slate-900/50`}
    >
      {/* Header with gradient */}
      <div className={`h-24 bg-gradient-to-br ${
        isGalaxy 
          ? 'from-purple-900/40 via-slate-900 to-slate-950' 
          : 'from-emerald-900/40 via-slate-900 to-slate-950'
      } flex items-center justify-center relative overflow-hidden`}>
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
          className={`text-${accentColor}-400/60`}
        />
        {isSelected && (
          <div className={`absolute top-3 right-3 bg-${accentColor}-500 text-white rounded-full p-1 shadow-lg`}>
            <Sparkles size={14} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <span className={`text-[10px] font-bold text-${accentColor}-400 uppercase tracking-wider`}>
            {getTypeLabel(item.type)}
          </span>
          <h3 className="text-lg font-bold text-white mt-1">{item.name}</h3>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Physical Properties */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          {getFormattedProperties().map((prop, i) => (
            <div key={i}>
              <span className="block text-[9px] font-bold text-slate-600 uppercase">{prop.label}</span>
              <span className={`text-[11px] font-mono text-${accentColor}-400/80`}>{prop.value}</span>
            </div>
          ))}
        </div>

        {/* Fun Facts Preview */}
        {item.fun_facts.length > 0 && (
          <div className="pt-2">
            <span className="text-[9px] font-bold text-slate-600 uppercase">Dato Curioso</span>
            <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">
              "{item.fun_facts[0]}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealObjectCard;
