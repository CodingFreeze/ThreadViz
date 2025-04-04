import React from 'react';
import styled from 'styled-components';

interface SimulationControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (value: number) => void;
}

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#4CAF50';
      case 'secondary': return '#2196F3';
      case 'danger': return '#F44336';
      default: return '#e0e0e0';
    }
  }};
  
  color: ${props => props.variant ? 'white' : '#333'};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SpeedLabel = styled.label`
  font-size: 14px;
  color: #555;
`;

const SpeedSlider = styled.input`
  width: 100px;
`;

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  speed,
  onSpeedChange
}) => {
  return (
    <ControlsContainer>
      {!isRunning ? (
        <Button variant="primary" onClick={onStart}>
          Start
        </Button>
      ) : isPaused ? (
        <Button variant="primary" onClick={onResume}>
          Resume
        </Button>
      ) : (
        <Button onClick={onPause}>
          Pause
        </Button>
      )}
      
      <Button 
        variant="danger" 
        onClick={onStop} 
        disabled={!isRunning}
      >
        Stop
      </Button>
      
      <Button 
        variant="secondary" 
        onClick={onReset}
      >
        Reset
      </Button>
      
      <SpeedControl>
        <SpeedLabel>Speed:</SpeedLabel>
        <SpeedSlider 
          type="range" 
          min="0.5" 
          max="10" 
          step="0.1" 
          value={speed} 
          defaultValue={1}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        />
        <span>{speed.toFixed(1)}x</span>
      </SpeedControl>
    </ControlsContainer>
  );
};

export default SimulationControls; 