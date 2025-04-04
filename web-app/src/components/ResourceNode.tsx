import React, { memo } from 'react';
import styled, { keyframes, css } from 'styled-components';

type ResourceType = 'LOCK' | 'BUFFER' | 'SEMAPHORE' | 'BARRIER' | 'RESOURCE';
type ResourceState = 'FREE' | 'OCCUPIED';

interface ResourceNodeProps {
  name: string;
  type: ResourceType;
  state: ResourceState;
  x: number;
  y: number;
  currentValue?: number;
  capacity?: number;
}

// Enhanced animations
const pulseAnimation = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(2, 136, 209, 0.5)); }
  50% { filter: drop-shadow(0 0 10px rgba(2, 136, 209, 0.8)); }
  100% { filter: drop-shadow(0 0 2px rgba(2, 136, 209, 0.5)); }
`;

const flowAnimation = keyframes`
  0% { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0; }
`;

const fillAnimation = keyframes`
  0% { transform: scaleY(0); }
  100% { transform: scaleY(1); }
`;

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Main node group with hover effects
const NodeGroup = styled.g`
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
  }
`;

// Base shape that all resources share
const BaseShape = styled.rect<{ state: ResourceState }>`
  fill: ${props => props.state === 'FREE' ? '#E3F2FD' : '#0288D1'};
  stroke: #01579B;
  stroke-width: 2;
  rx: 4;
  ry: 4;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.15));
  animation: ${props => props.state === 'OCCUPIED' ? css`${pulseAnimation} 2s infinite` : 'none'};
`;

// Specialized shape for the barrier
const BarrierShape = styled.polygon<{ state: ResourceState }>`
  fill: ${props => props.state === 'FREE' ? '#E3F2FD' : '#0288D1'};
  stroke: #01579B;
  stroke-width: 2;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.15));
  animation: ${props => props.state === 'OCCUPIED' ? css`${pulseAnimation} 2s infinite` : 'none'};
`;

// Flow path for buffer visualization
const FlowPath = styled.path<{ active: boolean }>`
  fill: none;
  stroke: ${props => props.active ? '#4CAF50' : 'rgba(0, 0, 0, 0.1)'};
  stroke-width: 2;
  stroke-dasharray: 4;
  animation: ${props => props.active ? css`${flowAnimation} 1s linear infinite` : 'none'};
`;

// Progress bar for buffer and semaphore
const ProgressBar = styled.rect<{ currentValue: number; capacity: number }>`
  fill: #4CAF50;
  transform-origin: bottom;
  transform: scaleY(${props => props.currentValue / props.capacity});
  animation: ${fillAnimation} 0.5s ease-out;
`;

// Semaphore tokens visualization
const SemaphoreTokens = styled.g<{ tokens: number; capacity: number }>`
  opacity: ${props => props.tokens > 0 ? 1 : 0.3};
`;

// Lock indicator
const LockIcon = styled.g<{ locked: boolean }>`
  transform-origin: center;
  animation: ${props => props.locked ? css`${rotateAnimation} 10s linear infinite` : 'none'};
`;

// Memoize the ResourceNode component to prevent unnecessary re-renders
const ResourceNode: React.FC<ResourceNodeProps> = memo(({ 
  name, 
  type, 
  state, 
  x, 
  y, 
  currentValue = 0, 
  capacity = 1 
}) => {
  const textColor = state === 'FREE' ? '#01579B' : 'white';
  
  // Buffer visualization
  if (type === 'BUFFER') {
    return (
      <NodeGroup transform={`translate(${x}, ${y})`}>
        <BaseShape
          x={-60}
          y={-35}
          width={120}
          height={70}
          state={state}
        />
        
        {/* Buffer visualization with flowing arrows */}
        <FlowPath 
          d="M-50,0 L-30,0 L-20,-10 L0,-10 L10,0 L30,0 L40,10 L50,10" 
          active={state === 'OCCUPIED'} 
        />
        
        {/* Title */}
        <text
          textAnchor="middle"
          y={-15}
          fill={textColor}
          fontWeight="bold"
          fontSize={14}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
        
        {/* Type label */}
        <text
          textAnchor="middle"
          y={5}
          fill={textColor}
          fontSize={10}
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
        >
          Buffer
        </text>
        
        {/* Progress bar background */}
        <rect
          x={-50}
          y={15}
          width={100}
          height={12}
          rx={2}
          fill="rgba(0, 0, 0, 0.1)"
        />
        
        {/* Dynamic progress bar */}
        <rect
          x={-50}
          y={15}
          width={Math.min(Math.max(0, (currentValue / capacity) * 100), 100)}
          height={12}
          rx={2}
          fill="#4CAF50"
        />
        
        {/* Capacity indicator */}
        <text
          textAnchor="middle"
          y={25}
          fill="white"
          fontSize={9}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {currentValue}/{capacity}
        </text>
      </NodeGroup>
    );
  } 
  
  // Barrier visualization with hexagonal shape
  else if (type === 'BARRIER') {
    return (
      <NodeGroup transform={`translate(${x}, ${y})`}>
        <BarrierShape
          points="-40,0 -20,-35 20,-35 40,0 20,35 -20,35"
          state={state}
        />
        
        {/* Title */}
        <text
          textAnchor="middle"
          y={-10}
          fill={textColor}
          fontWeight="bold"
          fontSize={14}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
        
        {/* Type label */}
        <text
          textAnchor="middle"
          y={10}
          fill={textColor}
          fontSize={10}
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
        >
          Barrier
        </text>
        
        {/* Barrier count indicator */}
        <text
          textAnchor="middle"
          y={25}
          fill={textColor}
          fontSize={12}
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {currentValue}/{capacity}
        </text>
      </NodeGroup>
    );
  } 
  
  // Semaphore visualization with tokens
  else if (type === 'SEMAPHORE') {
    const tokens = currentValue > 0 ? currentValue : 0;
    
    return (
      <NodeGroup transform={`translate(${x}, ${y})`}>
        <BaseShape
          x={-50}
          y={-35}
          width={100}
          height={70}
          state={state}
        />
        
        {/* Title */}
        <text
          textAnchor="middle"
          y={-20}
          fill={textColor}
          fontWeight="bold"
          fontSize={14}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
        
        {/* Type label */}
        <text
          textAnchor="middle"
          y={-5}
          fill={textColor}
          fontSize={10}
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
        >
          Semaphore
        </text>
        
        {/* Tokens visualization */}
        <SemaphoreTokens tokens={tokens} capacity={capacity}>
          {Array.from({ length: capacity }).map((_, i) => {
            const isActive = i < tokens;
            const angle = (i / capacity) * 2 * Math.PI;
            const radius = 20;
            const cx = radius * Math.cos(angle);
            const cy = radius * Math.sin(angle) + 15;
            
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={6}
                fill={isActive ? '#4CAF50' : 'rgba(0, 0, 0, 0.1)'}
              />
            );
          })}
        </SemaphoreTokens>
      </NodeGroup>
    );
  } 
  
  // Lock visualization
  else if (type === 'LOCK') {
    return (
      <NodeGroup transform={`translate(${x}, ${y})`}>
        <BaseShape
          x={-40}
          y={-40}
          width={80}
          height={80}
          state={state}
        />
        
        {/* Title */}
        <text
          textAnchor="middle"
          y={-20}
          fill={textColor}
          fontWeight="bold"
          fontSize={14}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
        
        {/* Type label */}
        <text
          textAnchor="middle"
          y={-5}
          fill={textColor}
          fontSize={10}
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
        >
          Lock
        </text>
        
        {/* Lock visualization */}
        <LockIcon locked={state === 'OCCUPIED'}>
          <rect
            x={-15}
            y={5}
            width={30}
            height={25}
            rx={3}
            fill={state === 'FREE' ? '#BBDEFB' : '#0277BD'}
            stroke={textColor}
            strokeWidth={1}
          />
          <path
            d="M-10,5 L-10,-5 C-10,-13 10,-13 10,-5 L10,5"
            fill="none"
            stroke={textColor}
            strokeWidth={2}
          />
        </LockIcon>
      </NodeGroup>
    );
  } 
  
  // Default generic resource visualization
  else {
    return (
      <NodeGroup transform={`translate(${x}, ${y})`}>
        <BaseShape
          x={-40}
          y={-40}
          width={80}
          height={80}
          state={state}
        />
        
        {/* Title */}
        <text
          textAnchor="middle"
          y={-15}
          fill={textColor}
          fontWeight="bold"
          fontSize={14}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
        
        {/* Type label */}
        <text
          textAnchor="middle"
          y={5}
          fill={textColor}
          fontSize={10}
          style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
        >
          Resource
        </text>
        
        {/* Generic resource icon */}
        <circle
          cx={0}
          cy={20}
          r={12}
          fill={state === 'FREE' ? '#BBDEFB' : '#0277BD'}
          stroke={textColor}
          strokeWidth={1}
        />
      </NodeGroup>
    );
  }
}, (prevProps, nextProps) => {
  // Custom comparison function for memo - only update when necessary
  return prevProps.state === nextProps.state &&
    prevProps.name === nextProps.name &&
    prevProps.type === nextProps.type &&
    prevProps.currentValue === nextProps.currentValue &&
    prevProps.capacity === nextProps.capacity &&
    Math.abs(prevProps.x - nextProps.x) < 0.5 &&
    Math.abs(prevProps.y - nextProps.y) < 0.5;
});

export default ResourceNode; 