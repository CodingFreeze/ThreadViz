import React, { memo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { ThreadState } from '../models/Thread';

interface ThreadNodeProps {
  name: string;
  state: ThreadState;
  x: number;
  y: number;
}

// Define state colors with updated modern palette
const stateColors: Record<ThreadState, string> = {
  'READY': '#8BC34A',    // Light Green
  'RUNNING': '#4CAF50',  // Green
  'WAITING': '#FF9800',  // Orange
  'BLOCKED': '#F44336',  // Red
  'TERMINATED': '#9E9E9E', // Gray
  'NEW': '#2196F3'       // Blue
};

// Define animations
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
`;

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-1deg); }
  75% { transform: translateX(2px) rotate(1deg); }
  100% { transform: translateX(0); }
`;

const growAnimation = keyframes`
  0% { stroke-width: 2; stroke-opacity: 0.3; }
  50% { stroke-width: 4; stroke-opacity: 0.6; }
  100% { stroke-width: 2; stroke-opacity: 0.3; }
`;

// Enhanced node group with better transitions
const NodeGroup = styled.g`
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  }
`;

// Circle with modern shadow and animated gradient
const ThreadCircle = styled.circle<{ state: ThreadState }>`
  fill: ${props => stateColors[props.state]};
  stroke: rgba(255, 255, 255, 0.4);
  stroke-width: 2;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15));
  animation: ${props => {
    switch (props.state) {
      case 'RUNNING':
        return css`${pulseAnimation} 3s ease-in-out infinite`;
      case 'WAITING':
        return css`${fadeAnimation} 2s ease-in-out infinite`;
      case 'BLOCKED':
        return css`${shakeAnimation} 0.5s ease-in-out infinite`;
      default:
        return 'none';
    }
  }};
`;

// Glow effect for running threads
const GlowEffect = styled.circle<{ state: ThreadState }>`
  fill: none;
  stroke: ${props => stateColors[props.state]};
  stroke-width: 2;
  stroke-opacity: 0.3;
  animation: ${props => props.state === 'RUNNING' ? 
    css`${growAnimation} 2s ease-in-out infinite` : 'none'};
`;

// Memoize the ThreadNode component to prevent unnecessary re-renders
const ThreadNode: React.FC<ThreadNodeProps> = memo(({ name, state, x, y }) => {
  return (
    <NodeGroup transform={`translate(${x}, ${y})`}>
      {/* Glow effect for active threads */}
      {state === 'RUNNING' && (
        <GlowEffect 
          r={45} 
          state={state} 
        />
      )}
      
      {/* Main thread circle */}
      <ThreadCircle
        r={35}
        state={state}
      />
      
      {/* Thread name label */}
      <text
        textAnchor="middle"
        y={-8}
        fill="white"
        fontWeight="bold"
        fontSize={14}
        style={{ 
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
          pointerEvents: 'none'
        }}
      >
        {name}
      </text>
      
      {/* Thread state label */}
      <text
        textAnchor="middle"
        y={12}
        fill="white"
        fontSize={10}
        fontWeight="500"
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          pointerEvents: 'none'
        }}
      >
        {state}
      </text>
    </NodeGroup>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if state or position changes significantly
  return prevProps.state === nextProps.state &&
    prevProps.name === nextProps.name &&
    Math.abs(prevProps.x - nextProps.x) < 0.5 &&
    Math.abs(prevProps.y - nextProps.y) < 0.5;
});

export default ThreadNode; 