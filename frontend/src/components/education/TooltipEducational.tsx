/**
 * TooltipEducational Component
 * 
 * Tooltip enriquecido con contenido educativo que aparece
 * al interactuar con elementos del generador.
 */

import React from 'react';

interface TooltipEducationalProps {
  children: React.ReactNode;
  scientific: string;
  algorithmic: string;
  analogy?: string;
}

export const TooltipEducational: React.FC<TooltipEducationalProps> = ({
  children,
  scientific,
  algorithmic,
  analogy,
}) => {
  return (
    <span className="tooltip-educational">
      {children}
      {/* TODO: Implementar tooltip hover */}
    </span>
  );
};
