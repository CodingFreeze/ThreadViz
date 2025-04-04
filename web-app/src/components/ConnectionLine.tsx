import React, { memo } from 'react';
import styled, { keyframes, css } from 'styled-components';

interface ConnectionLineProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: 'HOLDING' | 'WAITING';
}

// Animations for connection lines
const dashAnimation = keyframes`
  to {
    stroke-dashoffset: 24;
  }
`;

const glowAnimation = keyframes`
  0% { stroke-opacity: 0.4; }
  50% { stroke-opacity: 0.8; }
  100% { stroke-opacity: 0.4; }
`;

const pulseAnimation = keyframes`
  0% { stroke-width: 2; }
  50% { stroke-width: 3.5; }
  100% { stroke-width: 2; }
`;

// Main line styling
const ConnectionPath = styled.path<{ connectionType: 'HOLDING' | 'WAITING' }>`
  fill: none;
  stroke: ${props => props.connectionType === 'HOLDING' ? '#4CAF50' : '#FF9800'};
  stroke-width: ${props => props.connectionType === 'HOLDING' ? 2.5 : 2};
  stroke-dasharray: ${props => props.connectionType === 'WAITING' ? '4 4' : 'none'};
  stroke-linecap: round;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2));
  animation: ${props => props.connectionType === 'WAITING' ? 
    css`${dashAnimation} 1s linear infinite` : 
    css`${pulseAnimation} 3s ease-in-out infinite`};
  transition: stroke 0.3s ease;
`;

// Glow effect for resource holding
const GlowPath = styled.path<{ connectionType: 'HOLDING' | 'WAITING' }>`
  fill: none;
  stroke: ${props => props.connectionType === 'HOLDING' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'};
  stroke-width: ${props => props.connectionType === 'HOLDING' ? 6 : 5};
  stroke-linecap: round;
  filter: blur(3px);
  animation: ${glowAnimation} 2s ease-in-out infinite;
  opacity: 0.8;
`;

// Arrow marker for directionality
const ArrowMarker = () => (
  <marker
    id="arrow-holding"
    viewBox="0 0 10 10"
    refX="9"
    refY="5"
    markerWidth="6"
    markerHeight="6"
    orient="auto"
  >
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#4CAF50" />
  </marker>
);

const WaitingMarker = () => (
  <marker
    id="arrow-waiting"
    viewBox="0 0 10 10"
    refX="9"
    refY="5"
    markerWidth="6"
    markerHeight="6"
    orient="auto"
  >
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF9800" />
  </marker>
);

// Calculate the quadratic bezier curve control point
const calculateControlPoint = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): { cpx: number; cpy: number } => {
  // Calculate midpoint
  const mpx = (sourceX + targetX) / 2;
  const mpy = (sourceY + targetY) / 2;
  
  // Calculate distance between points
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate perpendicular offset (create a curve)
  const offset = length / 4; // Control curve intensity
  const angle = Math.atan2(dy, dx) + Math.PI / 2;
  
  // Calculate control point with offset
  const cpx = mpx + Math.cos(angle) * offset;
  const cpy = mpy + Math.sin(angle) * offset;
  
  return { cpx, cpy };
};

// Memoized ConnectionLine component to prevent unnecessary re-renders
const ConnectionLine: React.FC<ConnectionLineProps> = memo(({
  sourceX,
  sourceY,
  targetX,
  targetY,
  type
}) => {
  // Calculate offset to connect to node edges
  const sourceRadius = 35; // Thread node radius
  const targetRadius = type === 'HOLDING' ? 42 : 40; // Resource node size (adjust for visual balance)
  
  // Calculate distance and angle between points
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angle = Math.atan2(dy, dx);
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate edge points with offsets
  const offsetRatio = sourceRadius / distance;
  const startX = sourceX + dx * offsetRatio;
  const startY = sourceY + dy * offsetRatio;
  
  const offsetRatio2 = targetRadius / distance;
  const endX = targetX - dx * offsetRatio2;
  const endY = targetY - dy * offsetRatio2;
  
  // Calculate control point for the quadratic bezier curve
  const { cpx, cpy } = calculateControlPoint(startX, startY, endX, endY);
  
  // Create path
  const path = `M ${startX} ${startY} Q ${cpx} ${cpy} ${endX} ${endY}`;
  
  // Add unique identifiers to ensure proper marker rendering
  const markerId = `marker-${type.toLowerCase()}-${Math.floor(sourceX)}-${Math.floor(sourceY)}-${Math.floor(targetX)}-${Math.floor(targetY)}`;
  
  return (
    <g>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path 
            d="M 0 0 L 10 5 L 0 10 z" 
            fill={type === 'HOLDING' ? '#4CAF50' : '#FF9800'} 
          />
        </marker>
      </defs>
      
      {/* Glow effect */}
      <GlowPath
        d={path}
        connectionType={type}
      />
      
      {/* Main visible line */}
      <ConnectionPath
        d={path}
        connectionType={type}
        markerEnd={`url(#${markerId})`}
      />
    </g>
  );
}, (prevProps, nextProps) => {
  // Prevent unnecessary re-renders with custom comparison
  const positionThreshold = 0.5;
  return (
    prevProps.type === nextProps.type &&
    Math.abs(prevProps.sourceX - nextProps.sourceX) < positionThreshold &&
    Math.abs(prevProps.sourceY - nextProps.sourceY) < positionThreshold &&
    Math.abs(prevProps.targetX - nextProps.targetX) < positionThreshold &&
    Math.abs(prevProps.targetY - nextProps.targetY) < positionThreshold
  );
});

export default ConnectionLine; 