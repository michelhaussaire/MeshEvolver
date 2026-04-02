/**
 * AlgorithmSelector Component
 * 
 * Selector visual de algoritmos de generación procedural
 * con información educativa sobre cada uno.
 */

import React from 'react';

export interface AlgorithmOption {
  id: string;
  name: string;
  description: string;
  complexity: string;
  useCases: string[];
}

interface AlgorithmSelectorProps {
  algorithms: AlgorithmOption[];
  selected: string;
  onSelect: (algorithmId: string) => void;
}

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  algorithms,
  selected,
  onSelect,
}) => {
  return (
    <div className="algorithm-selector">
      {/* TODO: Implementar selector visual */}
      <select value={selected} onChange={(e) => onSelect(e.target.value)}>
        {algorithms.map((algo) => (
          <option key={algo.id} value={algo.id}>
            {algo.name}
          </option>
        ))}
      </select>
    </div>
  );
};
