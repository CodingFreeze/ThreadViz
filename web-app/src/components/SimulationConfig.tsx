import React, { useState } from 'react';
import styled from 'styled-components';
import { SimulationConfig, SimulationType, FairnessPolicy, AnimationStyle } from '../models/Simulation';

interface SimulationConfigProps {
  onSubmit: (config: SimulationConfig) => void;
}

const ConfigContainer = styled.div`
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
  max-width: 600px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 14px;
  color: #333;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #2196F3;
  }
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #2196F3;
  }
  
  &[type="range"] {
    width: 100%;
  }
`;

const Button = styled.button`
  padding: 12px;
  background-color: #4CAF50;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #388E3C;
  }
`;

const ConfigTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
`;

const SectionTitle = styled.h3`
  margin-top: 10px;
  margin-bottom: 10px;
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
`;

const ConfigDescription = styled.p`
  margin-top: 0;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  text-align: center;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 15px;
  background: ${props => props.active ? '#f0f0f0' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#2196F3' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const TabContent = styled.div`
  padding: 15px 0;
`;

const RangeValue = styled.span`
  margin-left: 10px;
`;

const ButtonContainer = styled.div`
  text-align: center;
`;

const SubmitButton = styled.button`
  padding: 12px;
  background-color: #4CAF50;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #388E3C;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #333;
`;

const HelpText = styled.span`
  font-size: 12px;
  color: #666;
`;

const SimulationConfigComponent: React.FC<SimulationConfigProps> = ({ onSubmit }) => {
  const [activeTab, setActiveTab] = useState('Basic');
  const [config, setConfig] = useState<SimulationConfig>({
    type: 'PRODUCER_CONSUMER',
    numThreads: 4,
    bufferSize: 5,
    producerSleepTime: 300,
    consumerSleepTime: 300,
    fairnessPolicy: 'FIFO',
    visualizeDeadlocks: true,
    showThreadPaths: false,
    animationStyle: 'SMOOTH',
    simulationStepDelay: 50,
    speed: 1,
    deadlockDetection: 'NONE',
    logLevel: 'INFO'
  });

  const [speed, setSpeed] = useState<number>(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setConfig(prev => ({
      ...prev,
      [name]: name === 'type' || name === 'fairnessPolicy' || name === 'animationStyle' 
        ? value 
        : name === 'visualizeDeadlocks' || name === 'showThreadPaths'
          ? (e.target as HTMLInputElement).checked
          : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Basic':
        return (
          <>
            <FormGroup>
              <Label>Simulation Type</Label>
              <Select name="type" value={config.type} onChange={handleChange}>
                <option value="PRODUCER_CONSUMER">Producer-Consumer</option>
                <option value="DINING_PHILOSOPHERS">Dining Philosophers</option>
                <option value="READER_WRITER">Reader-Writer</option>
                <option value="BARRIER">Barrier Synchronization</option>
                <option value="SLEEPING_BARBER">Sleeping Barber</option>
                <option value="CIGARETTE_SMOKERS">Cigarette Smokers</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Number of Threads</Label>
              <Input 
                type="number" 
                name="numThreads" 
                value={config.numThreads} 
                onChange={handleChange}
                min="2"
                max="20"
              />
            </FormGroup>
            
            {config.type === 'PRODUCER_CONSUMER' && (
              <FormGroup>
                <Label>Buffer Size</Label>
                <Input 
                  type="number" 
                  name="bufferSize" 
                  value={config.bufferSize} 
                  onChange={handleChange}
                  min="1"
                  max="20"
                />
              </FormGroup>
            )}
            
            {config.type === 'BARRIER' && (
              <FormGroup>
                <Label>Barrier Threshold</Label>
                <Input 
                  type="number" 
                  name="barrierThreshold" 
                  value={config.barrierThreshold || config.numThreads} 
                  onChange={handleChange}
                  min="2"
                  max={config.numThreads}
                />
                <HelpText>Number of threads that must reach the barrier before all can proceed</HelpText>
              </FormGroup>
            )}
            
            {config.type === 'SLEEPING_BARBER' && (
              <FormGroup>
                <Label>Waiting Room Size</Label>
                <Input 
                  type="number" 
                  name="waitingRoomSize" 
                  value={config.waitingRoomSize || 5} 
                  onChange={handleChange}
                  min="1"
                  max="15"
                />
                <HelpText>Number of chairs in the waiting room</HelpText>
              </FormGroup>
            )}
            
            {config.type === 'CIGARETTE_SMOKERS' && (
              <FormGroup>
                <Label>Ingredient Types</Label>
                <Input 
                  type="number" 
                  name="ingredientTypes" 
                  value={config.ingredientTypes || 3} 
                  onChange={handleChange}
                  min="3"
                  max="5"
                  disabled={true}
                />
                <HelpText>Number of different ingredients (fixed at 3)</HelpText>
              </FormGroup>
            )}
            
            <FormGroup>
              <Label>Simulation Speed</Label>
              <Input 
                type="range" 
                name="speed" 
                value={config.speed || 1} 
                onChange={handleChange}
                min="0.1"
                max="10"
                step="0.1"
                defaultValue="1"
              />
              <RangeValue>{config.speed || 1}x</RangeValue>
            </FormGroup>
          </>
        );
        
      case 'Timing':
        return (
          <>
            {config.type === 'PRODUCER_CONSUMER' && (
              <>
                <FormGroup>
                  <Label>Producer Sleep Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="producerSleepTime" 
                    value={config.producerSleepTime} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Consumer Sleep Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="consumerSleepTime" 
                    value={config.consumerSleepTime} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
              </>
            )}
            
            {config.type === 'DINING_PHILOSOPHERS' && (
              <>
                <FormGroup>
                  <Label>Thinking Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="thinkingTime" 
                    value={config.thinkingTime} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Eating Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="eatingTime" 
                    value={config.eatingTime} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
              </>
            )}
            
            {config.type === 'READER_WRITER' && (
              <>
                <FormGroup>
                  <Label>Reading Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="readTime" 
                    value={config.readTime} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Writing Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="writeTime" 
                    value={config.writeTime} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
              </>
            )}
            
            {config.type === 'BARRIER' && (
              <FormGroup>
                <Label>Barrier Wait Time (ms)</Label>
                <Input 
                  type="number" 
                  name="barrierWaitTime" 
                  value={config.barrierWaitTime || 1000} 
                  onChange={handleChange}
                  min="100"
                  max="5000"
                  step="100"
                />
              </FormGroup>
            )}
            
            {config.type === 'SLEEPING_BARBER' && (
              <>
                <FormGroup>
                  <Label>Barber Service Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="barberServiceTime" 
                    value={config.barberServiceTime || 2000} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Customer Arrival Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="customerArrivalTime" 
                    value={config.customerArrivalTime || 1500} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
              </>
            )}
            
            {config.type === 'CIGARETTE_SMOKERS' && (
              <>
                <FormGroup>
                  <Label>Smoker Wait Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="smokerWaitTime" 
                    value={config.smokerWaitTime || 1000} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Agent Wait Time (ms)</Label>
                  <Input 
                    type="number" 
                    name="agentWaitTime" 
                    value={config.agentWaitTime || 2000} 
                    onChange={handleChange}
                    min="100"
                    max="5000"
                    step="100"
                  />
                </FormGroup>
              </>
            )}
            
            <FormGroup>
              <Label>Simulation Step Delay (ms)</Label>
              <Input 
                type="number" 
                name="simulationStepDelay" 
                value={config.simulationStepDelay} 
                onChange={handleChange}
                min="10"
                max="1000"
                step="10"
              />
            </FormGroup>
          </>
        );
        
      case 'Behavior':
        return (
          <>
            <FormGroup>
              <Label>Fairness Policy</Label>
              <Select name="fairnessPolicy" value={config.fairnessPolicy} onChange={handleChange}>
                <option value="FIFO">First-In-First-Out</option>
                <option value="RANDOM">Random</option>
                <option value="PRIORITY">Priority-based</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Deadlock Detection</Label>
              <Select name="deadlockDetection" value={config.deadlockDetection} onChange={handleChange}>
                <option value="NONE">None</option>
                <option value="TIMEOUT">Timeout-based</option>
                <option value="RESOURCE_ALLOCATION_GRAPH">Resource Allocation Graph</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <CheckboxContainer>
                <Checkbox 
                  type="checkbox" 
                  name="visualizeDeadlocks" 
                  checked={config.visualizeDeadlocks} 
                  onChange={handleChange}
                />
                <CheckboxLabel>Visualize Deadlocks</CheckboxLabel>
              </CheckboxContainer>
            </FormGroup>
            
            <FormGroup>
              <CheckboxContainer>
                <Checkbox 
                  type="checkbox" 
                  name="deadlockRecovery" 
                  checked={config.deadlockRecovery} 
                  onChange={handleChange}
                  disabled={config.deadlockDetection === 'NONE'}
                />
                <CheckboxLabel>Enable Deadlock Recovery</CheckboxLabel>
              </CheckboxContainer>
            </FormGroup>
            
            <FormGroup>
              <CheckboxContainer>
                <Checkbox 
                  type="checkbox" 
                  name="priorityInversion" 
                  checked={config.priorityInversion} 
                  onChange={handleChange}
                />
                <CheckboxLabel>Simulate Priority Inversion</CheckboxLabel>
              </CheckboxContainer>
            </FormGroup>
            
            {config.type === 'READER_WRITER' && (
              <>
                <FormGroup>
                  <CheckboxContainer>
                    <Checkbox 
                      type="checkbox" 
                      name="readerPreference" 
                      checked={config.readerPreference} 
                      onChange={handleChange}
                    />
                    <CheckboxLabel>Reader Preference</CheckboxLabel>
                  </CheckboxContainer>
                </FormGroup>
                
                <FormGroup>
                  <CheckboxContainer>
                    <Checkbox 
                      type="checkbox" 
                      name="writerPreference" 
                      checked={config.writerPreference} 
                      onChange={handleChange}
                      disabled={config.readerPreference}
                    />
                    <CheckboxLabel>Writer Preference</CheckboxLabel>
                  </CheckboxContainer>
                </FormGroup>
              </>
            )}
          </>
        );
        
      case 'Visual':
        return (
          <>
            <FormGroup>
              <Label>Animation Style</Label>
              <Select name="animationStyle" value={config.animationStyle} onChange={handleChange}>
                <option value="SMOOTH">Smooth</option>
                <option value="STEP">Step-by-Step</option>
                <option value="INSTANT">Instant</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Color Scheme</Label>
              <Select name="colorScheme" value={config.colorScheme} onChange={handleChange}>
                <option value="default">Default</option>
                <option value="pastel">Pastel</option>
                <option value="highContrast">High Contrast</option>
                <option value="monochrome">Monochrome</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <CheckboxContainer>
                <Checkbox 
                  type="checkbox" 
                  name="showThreadPaths" 
                  checked={config.showThreadPaths} 
                  onChange={handleChange}
                />
                <CheckboxLabel>Show Thread Paths</CheckboxLabel>
              </CheckboxContainer>
            </FormGroup>
            
            <FormGroup>
              <CheckboxContainer>
                <Checkbox 
                  type="checkbox" 
                  name="showDetailedStats" 
                  checked={config.showDetailedStats} 
                  onChange={handleChange}
                />
                <CheckboxLabel>Show Detailed Statistics</CheckboxLabel>
              </CheckboxContainer>
            </FormGroup>
          </>
        );
        
      case 'Advanced':
        return (
          <>
            <FormGroup>
              <Label>Random Seed</Label>
              <Input 
                type="number" 
                name="randomSeed" 
                value={config.randomSeed} 
                onChange={handleChange}
              />
              <HelpText>For reproducible simulations</HelpText>
            </FormGroup>
            
            <FormGroup>
              <Label>Max Events</Label>
              <Input 
                type="number" 
                name="maxEvents" 
                value={config.maxEvents} 
                onChange={handleChange}
                min="100"
                max="10000"
                step="100"
              />
              <HelpText>Maximum events to store in history</HelpText>
            </FormGroup>
            
            <FormGroup>
              <Label>Log Level</Label>
              <Select name="logLevel" value={config.logLevel} onChange={handleChange}>
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
              </Select>
            </FormGroup>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <ConfigContainer>
      <ConfigTitle>Configure Simulation</ConfigTitle>
      <ConfigDescription>
        Customize the parameters of your concurrency simulation
      </ConfigDescription>
      
      <Tabs>
        {['Basic', 'Timing', 'Behavior', 'Visual', 'Advanced'].map(tab => (
          <Tab 
            key={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </Tabs>
      
      <TabContent>
        {renderTabContent()}
      </TabContent>
      
      <ButtonContainer>
        <SubmitButton onClick={handleSubmit}>Start Simulation</SubmitButton>
      </ButtonContainer>
    </ConfigContainer>
  );
};

export default SimulationConfigComponent; 