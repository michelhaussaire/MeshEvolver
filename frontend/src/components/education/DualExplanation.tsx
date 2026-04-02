/**
 * DualExplanation Component
 * 
 * Componente educativo que muestra explicaciones duales:
 * - Perspectiva científica (astronomía/física)
 * - Perspectiva algorítmica (procedural generation)
 */

import React from 'react';

interface DualExplanationProps {
  contentId: string;
  category: 'ocean' | 'atmosphere' | 'vegetation' | 'evolution';
}

export const DualExplanation: React.FC<DualExplanationProps> = ({ contentId, category }) => {
  return (
    <div className="dual-explanation">
      {/* TODO: Implementar visualización dual */}
      <p>DualExplanation: {contentId} ({category})</p>
    </div>
  );
};
