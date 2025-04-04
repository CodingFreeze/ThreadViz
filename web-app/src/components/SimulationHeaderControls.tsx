import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SimulationConfig, SimulationType } from '../models/Simulation';

interface SimulationHeaderControlsProps {
  simulationId: string;
  simulation: any;
  configSubmitted: boolean;
  isRunning?: boolean;
  isPaused?: boolean;
  speed?: number;
  onSpeedChange?: (value: number) => void;
  onNewSimulation?: () => void;
  onConfigSubmit: (config: SimulationConfig) => void;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onReset?: () => void;
}

// Main container with sleek glass morphism effect
const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
`;

// Main layout with tabs
const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// Title and description
const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  padding: 20px 24px 8px;
  color: #333;
`;

const Description = styled.p`
  margin: 0;
  padding: 0 24px 12px;
  color: #666;
  font-size: 14px;
`;

// Tab navigation
const TabsContainer = styled.div`
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid #eaeaea;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#2196F3' : 'transparent'};
  color: ${props => props.active ? '#2196F3' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #2196F3;
  }
`;

// Controls section
const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  gap: 16px;
  flex-wrap: wrap;
  border-bottom: 1px solid #eaeaea;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Button = styled.button<{primary?: boolean, large?: boolean}>`
  padding: ${props => props.large ? '12px 24px' : '8px 16px'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  background-color: ${props => props.primary ? '#4CAF50' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#333'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.primary ? '#43a047' : '#eeeeee'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SpeedLabel = styled.span`
  font-size: 14px;
  color: #424242;
  font-weight: 500;
`;

const SpeedValue = styled.span`
  font-size: 14px;
  color: #1976d2;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
`;

const SpeedKnob = styled.input`
  width: 120px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e0e0e0;
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2196F3;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }
`;

// Configuration panel
const ConfigPanel = styled.div`
  background-color: white;
  padding: 24px;
`;

const ConfigTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #333;
`;

const ConfigForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormSectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #2196F3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }
`;

const FormSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: white;
  
  &:focus {
    border-color: #2196F3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
`;

// Status panel
const StatusPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 16px 24px;
  background-color: #f9f9f9;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatusLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
`;

const StatusValue = styled.span`
  font-size: 16px;
  color: #333;
  font-weight: 600;
`;

// Icons
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M6 6h12v12H6z" />
  </svg>
);

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

const NewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

const SimulationHeaderControls: React.FC<SimulationHeaderControlsProps> = ({
  simulationId,
  simulation,
  configSubmitted,
  isRunning = false,
  isPaused = false,
  speed = 1,
  onSpeedChange,
  onNewSimulation,
  onConfigSubmit,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'config'>('controls');
  const [simulationType, setSimulationType] = useState<SimulationType>('PRODUCER_CONSUMER');
  const [formData, setFormData] = useState<SimulationConfig>({
    type: 'PRODUCER_CONSUMER',
    threadCount: 3,
    bufferSize: 5,
    animationStyle: 'DYNAMIC',
    maxSteps: 100
  });
  
  // Update local form data when simulation changes
  useEffect(() => {
    if (simulation) {
      setFormData({
        type: simulation.type || 'PRODUCER_CONSUMER',
        threadCount: simulation.threadCount || 3,
        bufferSize: simulation.bufferSize || 5,
        animationStyle: simulation.animationStyle || 'DYNAMIC',
        maxSteps: simulation.maxSteps || 100
      });
      setSimulationType(simulation.type || 'PRODUCER_CONSUMER');
    }
  }, [simulation]);
  
  // Set appropriate initial tab
  useEffect(() => {
    if (!configSubmitted) {
      setActiveTab('config');
    } else {
      setActiveTab('controls');
    }
  }, [configSubmitted]);
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as SimulationType;
    setSimulationType(newType);
    setFormData(prev => ({
      ...prev,
      type: newType
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigSubmit(formData);
    setActiveTab('controls');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = e.target.type === 'number' ? parseInt(value, 10) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const renderConfigForm = () => {
    return (
      <ConfigForm onSubmit={handleSubmit}>
        <FormSection>
          <FormSectionTitle>Basic Configuration</FormSectionTitle>
          <FormField>
            <label htmlFor="type">Simulation Type</label>
            <FormSelect 
              id="type" 
              name="type" 
              value={formData.type}
              onChange={handleTypeChange}
              disabled={configSubmitted && (isRunning || isPaused)}
            >
              <option value="PRODUCER_CONSUMER">Producer Consumer</option>
              <option value="DINING_PHILOSOPHERS">Dining Philosophers</option>
              <option value="READER_WRITER">Reader Writer</option>
              <option value="BARRIER">Barrier</option>
              <option value="SLEEPING_BARBER">Sleeping Barber</option>
              <option value="CIGARETTE_SMOKERS">Cigarette Smokers</option>
            </FormSelect>
          </FormField>
          
          <FormField>
            <label htmlFor="threadCount">Thread Count</label>
            <FormInput 
              id="threadCount" 
              name="threadCount" 
              type="number" 
              min="1"
              max="10"
              value={formData.threadCount} 
              onChange={handleInputChange}
              disabled={configSubmitted && (isRunning || isPaused)}
            />
          </FormField>
          
          <FormField>
            <label htmlFor="bufferSize">Buffer Size</label>
            <FormInput 
              id="bufferSize" 
              name="bufferSize" 
              type="number" 
              min="1"
              max="20"
              value={formData.bufferSize} 
              onChange={handleInputChange}
              disabled={configSubmitted && (isRunning || isPaused)}
            />
          </FormField>
        </FormSection>
        
        <FormSection>
          <FormSectionTitle>Advanced Options</FormSectionTitle>
          <FormField>
            <label htmlFor="animationStyle">Animation Style</label>
            <FormSelect 
              id="animationStyle" 
              name="animationStyle" 
              value={formData.animationStyle}
              onChange={handleSelectChange}
              disabled={configSubmitted && (isRunning || isPaused)}
            >
              <option value="STATIC">Static</option>
              <option value="DYNAMIC">Dynamic</option>
            </FormSelect>
          </FormField>
          
          <FormField>
            <label htmlFor="maxSteps">Maximum Steps</label>
            <FormInput 
              id="maxSteps" 
              name="maxSteps" 
              type="number" 
              min="10"
              max="1000"
              value={formData.maxSteps} 
              onChange={handleInputChange}
              disabled={configSubmitted && (isRunning || isPaused)}
            />
          </FormField>
        </FormSection>
        
        <ButtonContainer>
          {!configSubmitted ? (
            <Button type="submit" primary>Create Simulation</Button>
          ) : (
            <>
              {!isRunning && !isPaused && (
                <Button type="submit" primary disabled={isRunning || isPaused}>
                  Update Configuration
                </Button>
              )}
              {onNewSimulation && (
                <Button type="button" onClick={onNewSimulation}>
                  <NewIcon /> New Simulation
                </Button>
              )}
            </>
          )}
        </ButtonContainer>
      </ConfigForm>
    );
  };
  
  const renderControlsTab = () => {
    return (
      <>
        <Controls>
          <ButtonGroup>
            {!isRunning && !isPaused && onStart && (
              <Button primary onClick={onStart}>
                <PlayIcon /> Start
              </Button>
            )}
            
            {isRunning && !isPaused && onPause && (
              <Button onClick={onPause}>
                <PauseIcon /> Pause
              </Button>
            )}
            
            {isPaused && onResume && (
              <Button primary onClick={onResume}>
                <PlayIcon /> Resume
              </Button>
            )}
            
            {(isRunning || isPaused) && onStop && (
              <Button onClick={onStop}>
                <StopIcon /> Stop
              </Button>
            )}
            
            {onReset && (
              <Button onClick={onReset}>
                <ResetIcon /> Reset
              </Button>
            )}
          </ButtonGroup>
          
          <ButtonGroup>
            {onSpeedChange && (
              <SpeedControl>
                <SpeedLabel>Speed:</SpeedLabel>
                <SpeedKnob
                  type="range"
                  min="1"
                  max="10"
                  value={speed}
                  onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
                />
                <SpeedValue>{speed}x</SpeedValue>
              </SpeedControl>
            )}
            
            <Button onClick={() => setActiveTab('config')}>
              <SettingsIcon /> Configure
            </Button>
          </ButtonGroup>
        </Controls>
        
        {simulation && (
          <StatusPanel>
            <StatusItem>
              <StatusLabel>Simulation Type</StatusLabel>
              <StatusValue>{simulation.type || 'None'}</StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>Threads</StatusLabel>
              <StatusValue>{simulation.threads?.length || 0}</StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>Status</StatusLabel>
              <StatusValue>
                {isRunning && !isPaused 
                  ? 'Running' 
                  : isPaused 
                    ? 'Paused' 
                    : 'Stopped'}
              </StatusValue>
            </StatusItem>
            <StatusItem>
              <StatusLabel>Steps</StatusLabel>
              <StatusValue>{simulation.stepCount || 0}</StatusValue>
            </StatusItem>
          </StatusPanel>
        )}
      </>
    );
  };
  
  return (
    <HeaderContainer>
      <Title>Thread Visualization</Title>
      <Description>
        Visualize concurrent programming patterns and thread interactions
      </Description>
      
      <HeaderContent>
        <TabsContainer>
          <Tab 
            active={activeTab === 'controls'} 
            onClick={() => setActiveTab('controls')}
            disabled={!configSubmitted}
          >
            Controls & Status
          </Tab>
          <Tab 
            active={activeTab === 'config'} 
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </Tab>
        </TabsContainer>
        
        {activeTab === 'controls' && configSubmitted ? renderControlsTab() : null}
        {activeTab === 'config' ? (
          <ConfigPanel>
            <ConfigTitle>{configSubmitted ? 'Modify Configuration' : 'Create New Simulation'}</ConfigTitle>
            {renderConfigForm()}
          </ConfigPanel>
        ) : null}
      </HeaderContent>
    </HeaderContainer>
  );
};

export default SimulationHeaderControls; 