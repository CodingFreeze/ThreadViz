import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import SimulationCanvas from '../components/SimulationCanvas';
import EventLog from '../components/EventLog';
import { SimulationConfig, SimulationState } from '../models/Simulation';
import { simulationService } from '../services/SimulationService';
import { visualizationService } from '../services/VisualizationService';

// Container layout
const PageContainer = styled.div`
  padding: 24px;
  padding-bottom: 100px;
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
`;

const SimulationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;
  margin-bottom: 30px;
`;

// Configuration panel
const ConfigurationPanel = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 500px;
`;

const ConfigTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
`;

const ConfigDescription = styled.p`
  margin: 0 0 24px 0;
  color: #666;
  font-size: 16px;
  line-height: 1.5;
`;

const ConfigForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormSectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const FormInput = styled.input`
  padding: 12px 16px;
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
  padding: 12px 16px;
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
  margin-top: 30px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
  position: relative;
  z-index: 20;
`;

const Button = styled.button<{primary?: boolean}>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Simulation visualization panel
const VisualizationContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 24px;
  flex: 1;
  min-height: 0;
  
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
`;

const VisualizationPanel = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  min-height: 0;
  position: relative;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 600px;
  border: 1px solid #eaeaea;
  background-color: #fafafa;
`;

const SimulationInfo = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #eaeaea;
  background-color: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetricsPanel = styled.div`
  display: flex;
  gap: 24px;
`;

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MetricValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
`;

// Control panel
const ControlPanel = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 12px;
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

// Side panels
const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  min-height: 0;
  
  /* Make both panels take equal height */
  & > * {
    flex: 1;
    max-height: calc(50% - 12px); /* Half of height minus half of gap */
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const Panel = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PanelHeader = styled.div`
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
  font-weight: 600;
  color: #333;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelContent = styled.div`
  flex: 1;
  padding: 0;
  overflow: hidden;
  background-color: transparent;
  min-height: 0;
  position: relative;
`;

const LogPanel = styled(Panel)`
  min-height: 0;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ExplanationPanel = styled(Panel)`
  min-height: 0;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TimelineContainer = styled.div`
  padding: 8px 20px;
  border-top: 1px solid #eaeaea;
  background-color: #f8f9fa;
`;

const TimelineSlider = styled.input`
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e0e0e0;
  border-radius: 2px;
  outline: none;
  margin: 12px 0;
  
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

const TimelineLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;

const StepNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const StepButton = styled.button`
  background: none;
  border: none;
  color: #2196F3;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  
  &:hover {
    background-color: rgba(33, 150, 243, 0.1);
    border-radius: 4px;
  }
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const StepCounter = styled.div`
  font-size: 14px;
  color: #555;
  font-weight: 500;
`;

const ExplanationContent = styled(PanelContent)`
  padding: 16px 20px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const ExplanationText = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  padding: 0;
  
  p {
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: #333;
  }
`;

const ExplanationEntry = styled.div<{ isActive: boolean }>`
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: ${props => props.isActive ? 'rgba(33, 150, 243, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.isActive ? 'rgba(33, 150, 243, 0.3)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:last-child {
    margin-bottom: 0;
  }
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

const SimulationPage: React.FC = () => {
  // Core simulation state
  const [hasActiveSimulation, setHasActiveSimulation] = useState(false);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [visualizationId, setVisualizationId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [explanationText, setExplanationText] = useState("");
  
  // Config state
  const [formData, setFormData] = useState<SimulationConfig>({
    type: 'PRODUCER_CONSUMER',
    threadCount: 3,
    bufferSize: 5,
    animationStyle: 'DYNAMIC',
    maxSteps: 100
  });
  
  // Update the state to keep a history of explanations
  const [explanationHistory, setExplanationHistory] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Function to get updated simulation state
  const updateSimulation = useCallback(() => {
    if (!simulationId) return;
    
    try {
      // Get the current simulation state
      const currentSimulationState = simulationService.getSimulation(simulationId);
      
      if (currentSimulationState) {
        // Apply speed reduction factor (20% of normal speed = 5x slower)
        const effectiveSpeed = speed * 0.2;
        visualizationService.setSpeedFactor(effectiveSpeed);
        
        // Update the simulation state with interpolated positions
        const interpolatedState = visualizationService.interpolatePositions(
          currentSimulationState, 
          16 // Default frame time in ms for smooth animation
        );
        
        // Set the updated simulation state
        setSimulation(interpolatedState);
        
        // Generate explanation
        const newExplanation = generateExplanation(interpolatedState);
        
        // Add to history if there's a meaningful change (new event or step)
        const shouldAddToHistory = 
          interpolatedState.events && 
          interpolatedState.events.length > 0 && 
          (
            explanationHistory.length === 0 || 
            newExplanation !== explanationHistory[explanationHistory.length - 1] ||
            (interpolatedState.stepCount && interpolatedState.stepCount > explanationHistory.length)
          );
          
        if (shouldAddToHistory) {
          setExplanationHistory(prev => [...prev, newExplanation]);
          // Update current step to latest unless user is viewing history
          if (currentStep === explanationHistory.length - 1 || currentStep === 0) {
            setCurrentStep(explanationHistory.length);
          }
        }
        
        setExplanationText(newExplanation);
      }
    } catch (error) {
      console.error("Error updating simulation:", error);
    }
  }, [simulationId, explanationHistory, speed, currentStep]);
  
  // Register visualization callback
  useEffect(() => {
    if (!simulationId || !hasActiveSimulation) return;
    
    console.log("Setting up visualization for simulation:", simulationId);
    
    // Generate a visualization ID if not already set
    const newVisualizationId = visualizationId || `visualization-${simulationId}`;
    setVisualizationId(newVisualizationId);
    
    // Register visualization callback
    visualizationService.registerVisualization(newVisualizationId, () => {
      updateSimulation();
    });
    
    return () => {
      // Cleanup on unmount or when simulation changes
      console.log("Cleaning up visualization:", newVisualizationId);
      visualizationService.unregisterVisualization(newVisualizationId);
    };
  }, [simulationId, hasActiveSimulation, updateSimulation, visualizationId]);
  
  // Periodically update the simulation state through the service
  useEffect(() => {
    if (!simulationId || !simulation?.isRunning || simulation?.isPaused) return;
    
    console.log(`Setting up update interval for simulation: ${simulationId}, speed: ${speed}`);
    
    // Check if all threads are terminated and automatically stop the simulation
    const checkAndStopSimulation = () => {
      const current = simulationService.getSimulation(simulationId);
      if (current) {
        const allTerminated = current.threads.every(thread => thread.state === 'TERMINATED');
        const configuredMaxSteps = current.config?.maxSteps || 100;
        const maxStepsReached = current.stepCount && current.stepCount >= configuredMaxSteps;
        
        if (allTerminated || maxStepsReached) {
          console.log(`Stopping simulation: ${allTerminated ? 'All threads terminated' : 'Max steps reached'}`);
          simulationService.stopSimulation(simulationId);
          updateSimulation();
        }
      }
    };
    
    const interval = setInterval(() => {
      // Update simulation state through service
      simulationService.updateSimulation(simulationId);
      
      // Check if simulation should stop
      checkAndStopSimulation();
      
      // Only update directly if not using visualization service for smooth animations
      if (!simulation.config || simulation.config.animationStyle !== 'SMOOTH') {
        updateSimulation();
      }
    }, 64 / (speed || 1)); // Update at ~15fps
    
    return () => {
      console.log('Clearing simulation update interval');
      clearInterval(interval);
    };
  }, [simulationId, simulation?.isRunning, simulation?.isPaused, speed, updateSimulation, simulation?.config?.maxSteps]);
  
  // Form handling
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
  
  // Create and start simulation
  const handleCreateSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating simulation with config:", formData);
    
    try {
      // Set active simulation state immediately to switch to simulation view
      setHasActiveSimulation(true);
      
      // Create a new simulation with the config
      const id = simulationService.createSimulation(formData);
      console.log("Simulation created with ID:", id);
      
      setSimulationId(id);
      const simulationState = simulationService.getSimulation(id);
      console.log("Initial simulation state:", simulationState);
      
      if (simulationState) {
        // Calculate safe positioning area
        const canvasWidth = 800;  // Increased from 600
        const canvasHeight = 600; // Increased from 400
        const marginX = 100; // Margin from edges (increased from 80)
        const marginY = 100; // Increased from 80
        
        // Initialize positions for visualization - keeping nodes within boundaries
        simulationState.threads.forEach((thread, index) => {
          if (!thread.position) {
            // Position nodes in a circular pattern
            const angle = (index / simulationState.threads.length) * Math.PI * 2;
            const radius = Math.min(canvasWidth, canvasHeight) / 3;
            
            thread.position = {
              x: (canvasWidth / 2) + Math.cos(angle) * radius,
              y: (canvasHeight / 2) + Math.sin(angle) * radius
            };
          }
          
          // Ensure positions are within safe boundaries
          thread.position.x = Math.max(marginX, Math.min(canvasWidth - marginX, thread.position.x));
          thread.position.y = Math.max(marginY, Math.min(canvasHeight - marginY, thread.position.y));
          
          // Set initial target position to match position
          thread.targetPosition = { ...thread.position };
          
          // Add small random offset to prevent perfect overlaps
          const randomOffset = 10;
          thread.position.x += (Math.random() - 0.5) * randomOffset;
          thread.position.y += (Math.random() - 0.5) * randomOffset;
        });
        
        simulationState.resources.forEach((resource, index) => {
          if (!resource.position) {
            // Position resources in the center
            resource.position = {
              x: canvasWidth / 2,
              y: canvasHeight / 2
            };
          }
          
          // Ensure positions are within safe boundaries
          resource.position.x = Math.max(marginX, Math.min(canvasWidth - marginX, resource.position.x));
          resource.position.y = Math.max(marginY, Math.min(canvasHeight - marginY, resource.position.y));
          
          // Set initial target position to match position
          resource.targetPosition = { ...resource.position };
        });
        
        // Explicitly ensure simulation state properties are set
        const updatedState = {
          ...simulationState,
          isRunning: false,
          isPaused: false
        };
        
        setSimulation(updatedState);
        
        // Set speed and register visualization
        setSpeed(1);
        visualizationService.setSpeedFactor(1);
        
        const newVisualizationId = `visualization-${id}`;
        setVisualizationId(newVisualizationId);
        
        // Register visualization callback
        visualizationService.registerVisualization(newVisualizationId, updateSimulation);
        
        // Update the simulation state immediately
        updateSimulation();
      }
      
      // Reset explanation history and current step
      setExplanationHistory([]);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error creating simulation:", error);
    }
  };
  
  // Simulation controls
  const handleStart = () => {
    if (simulationId) {
      simulationService.startSimulation(simulationId);
      visualizationService.setSpeedFactor(speed);
      
      // Force an immediate update to populate the event log
      const initialState = simulationService.getSimulation(simulationId);
      if (initialState) {
        // Set the updated simulation state
        setSimulation(initialState);
        
        // Generate explanation and add to history
        const newExplanation = generateExplanation(initialState);
        setExplanationHistory([newExplanation]);
        setCurrentStep(0);
        setExplanationText(newExplanation);
      }
      
      // Then continue with regular updates
      updateSimulation();
    }
  };
  
  const handlePause = () => {
    if (simulationId) {
      simulationService.pauseSimulation(simulationId);
      updateSimulation();
    }
  };
  
  const handleResume = () => {
    if (simulationId) {
      simulationService.resumeSimulation(simulationId);
      visualizationService.setSpeedFactor(speed);
      updateSimulation();
    }
  };
  
  const handleStop = () => {
    if (simulationId) {
      simulationService.stopSimulation(simulationId);
      updateSimulation();
    }
  };
  
  const handleReset = () => {
    if (simulationId) {
      if (simulation?.isRunning) {
        simulationService.stopSimulation(simulationId);
      }
      simulationService.resetSimulation(simulationId);
      
      // Reset timeline and event log
      setExplanationHistory([]);
      setCurrentStep(0);
      
      // Force an immediate update
      const resetState = simulationService.getSimulation(simulationId);
      if (resetState) {
        setSimulation(resetState);
        const initialExplanation = generateExplanation(resetState);
        setExplanationText(initialExplanation);
        setExplanationHistory([initialExplanation]);
      }
      
      updateSimulation();
    }
  };
  
  const handleNewSimulation = () => {
    // Stop and clean up the current simulation
    if (simulationId) {
      simulationService.stopSimulation(simulationId);
    }
    
    if (visualizationId) {
      visualizationService.unregisterVisualization(visualizationId);
    }
    
    // Reset state to show configuration screen
    setHasActiveSimulation(false);
    setSimulationId(null);
    setSimulation(null);
    setVisualizationId(null);
  };
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSpeed(value);
    visualizationService.setSpeedFactor(value);
    if (simulationId) {
      simulationService.setSimulationSpeed(value);
    }
  };
  
  // Generate explanation based on simulation state
  const generateExplanation = (simulationState: SimulationState): string => {
    if (!simulationState || !simulationState.events || simulationState.events.length === 0) {
      return "No events to explain yet. Start the simulation to see explanations of the thread behavior.";
    }
    
    // Get the most recent events
    const recentEvents = simulationState.events.slice(-5);
    const latestEvent = recentEvents[recentEvents.length - 1];
    
    // Count thread states
    const activeThreads = simulationState.threads.filter(t => t.state === 'RUNNING').length;
    const blockedThreads = simulationState.threads.filter(t => t.state === 'BLOCKED').length;
    const waitingThreads = simulationState.threads.filter(t => t.state === 'WAITING').length;
    const terminatedThreads = simulationState.threads.filter(t => t.state === 'TERMINATED').length;
    
    // Generate pattern-specific explanation
    let patternExplanation = "";
    let stateExplanation = "";
    let algorithmExplanation = "";
    
    switch(simulationState.type) {
      case "PRODUCER_CONSUMER":
        const buffer = simulationState.resources.find(r => r.type === 'BUFFER');
        patternExplanation = `
          <p><strong>Producer-Consumer Pattern:</strong> Producers add items to a shared buffer, while consumers remove them. This pattern manages the coordination between threads that produce data and those that consume it.</p>
        `;
        
        stateExplanation = `
          <p><strong>Buffer Status:</strong> ${buffer?.currentValue || 0}/${buffer?.capacity || 0} slots filled. ${
            buffer?.currentValue === 0 ? "Buffer is empty. Consumers will wait." : 
            buffer?.currentValue === buffer?.capacity ? "Buffer is full. Producers will wait." : 
            "Buffer has space available."
          }</p>
          <p><strong>Thread States:</strong> ${activeThreads} active, ${blockedThreads} blocked, ${waitingThreads} waiting, ${terminatedThreads} terminated.</p>
        `;
        
        // Algorithm-specific explanation
        algorithmExplanation = `
          <p><strong>Pattern Characteristics:</strong></p>
          <ul>
            <li>Producers are blocked when the buffer is full</li>
            <li>Consumers are blocked when the buffer is empty</li>
            <li>This solves the bounded-buffer problem</li>
            <li>Synchronization prevents race conditions on the shared buffer</li>
          </ul>
        `;
        break;
        
      case "DINING_PHILOSOPHERS":
        patternExplanation = `
          <p><strong>Dining Philosophers Problem:</strong> Philosophers alternate between thinking and eating. Each philosopher needs two forks to eat, but there are only five forks for five philosophers.</p>
        `;
        
        stateExplanation = `
          <p><strong>Active Thread States:</strong> ${activeThreads} philosophers eating, ${blockedThreads} waiting for forks, ${waitingThreads} thinking.</p>
        `;
        
        // Just display total resources without trying to count by state
        const totalForks = simulationState.resources.length;
        algorithmExplanation = `
          <p><strong>Current Resources:</strong> ${totalForks} forks available for philosophers.</p>
          <p><strong>Pattern Characteristics:</strong></p>
          <ul>
            <li>Demonstrates deadlock avoidance techniques</li>
            <li>Each philosopher needs two adjacent forks to eat</li>
            <li>Resource hierarchy prevents circular wait condition</li>
            <li>Timeout mechanism prevents starvation</li>
          </ul>
        `;
        break;
        
      case "READER_WRITER":
        patternExplanation = `
          <p><strong>Reader-Writer Problem:</strong> Multiple readers can access a resource simultaneously, but writers need exclusive access.</p>
        `;
        
        // Count readers and writers
        const readers = simulationState.threads.filter(t => t.name?.includes('Reader'));
        const writers = simulationState.threads.filter(t => t.name?.includes('Writer'));
        const activeReaders = readers.filter(t => t.state === 'RUNNING').length;
        const waitingWriters = writers.filter(t => t.state === 'BLOCKED' || t.state === 'WAITING').length;
        
        stateExplanation = `
          <p><strong>Thread States:</strong> ${activeThreads} active, ${blockedThreads} blocked, ${waitingThreads} waiting.</p>
          <p><strong>Reader/Writer Status:</strong> ${activeReaders} active readers, ${waitingWriters} writers waiting.</p>
        `;
        
        algorithmExplanation = `
          <p><strong>Pattern Characteristics:</strong></p>
          <ul>
            <li>Prioritizes either readers or writers based on policy</li>
            <li>Prevents race conditions on shared resources</li>
            <li>Balances throughput (readers) with update latency (writers)</li>
          </ul>
        `;
        break;
        
      default:
        patternExplanation = `
          <p><strong>Concurrency Pattern:</strong> This simulation demonstrates synchronization between multiple threads accessing shared resources.</p>
        `;
        
        stateExplanation = `
          <p><strong>Thread States:</strong> ${activeThreads} active, ${blockedThreads} blocked, ${waitingThreads} waiting, ${terminatedThreads} terminated.</p>
        `;
        
        algorithmExplanation = `
          <p><strong>Latest Event:</strong> ${getEventDescription(latestEvent, simulationState)}</p>
        `;
    }
    
    return `
      ${patternExplanation}
      ${stateExplanation}
      ${algorithmExplanation}
      <p><strong>Latest Event:</strong> ${getEventDescription(latestEvent, simulationState)}</p>
    `;
  };
  
  // Helper function to describe events
  const getEventDescription = (event: any, simulationState: SimulationState): string => {
    if (!event) return "No events yet.";
    
    const thread = event.threadId ? 
      simulationState.threads.find(t => t.id === event.threadId)?.name || "Unknown thread" : 
      "System";
      
    const resource = event.resourceId ?
      simulationState.resources.find(r => r.id === event.resourceId)?.name || "resource" :
      "resource";
    
    switch (event.type) {
      case "THREAD_STARTED":
        return `${thread} has started execution.`;
      case "THREAD_TERMINATED":
        return `${thread} has terminated.`;
      case "THREAD_BLOCKED":
        return `${thread} is blocked waiting for a resource.`;
      case "THREAD_WAITING":
        return `${thread} is temporarily sleeping.`;
      case "THREAD_RESUMED":
        return `${thread} has resumed execution.`;
      case "RESOURCE_ACQUIRED":
        return `${thread} acquired ${resource}.`;
      case "RESOURCE_RELEASED":
        return `${thread} released ${resource}.`;
      case "BUFFER_ITEM_ADDED":
        return `${thread} added an item to the buffer.`;
      case "BUFFER_ITEM_REMOVED":
        return `${thread} removed an item from the buffer.`;
      default:
        return event.description || "Event occurred.";
    }
  };
  
  // Handle timeline slider change
  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(e.target.value, 10);
    setCurrentStep(step);
    if (explanationHistory[step]) {
      setExplanationText(explanationHistory[step]);
    }
  };
  
  // Handle step navigation
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setExplanationText(explanationHistory[newStep]);
    }
  };
  
  const goToNextStep = () => {
    if (currentStep < explanationHistory.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setExplanationText(explanationHistory[newStep]);
    }
  };
  
  // Log simulation state changes
  useEffect(() => {
    if (simulation) {
      console.log("Simulation state updated:", {
        id: simulation.id,
        isRunning: simulation.isRunning,
        isPaused: simulation.isPaused,
        threadCount: simulation.threads.length,
        hasActiveSimulation
      });
    }
  }, [simulation, hasActiveSimulation]);
  
  // Render the configuration form
  const renderConfigurationForm = () => (
    <ConfigurationPanel>
      <ConfigTitle>Thread Visualization</ConfigTitle>
      <ConfigDescription>
        Configure a new simulation to visualize concurrent programming patterns and thread interactions.
      </ConfigDescription>
      
      <ConfigForm onSubmit={handleCreateSimulation}>
        <FormSection>
          <FormSectionTitle>Basic Configuration</FormSectionTitle>
          
          <FormField>
            <FormLabel htmlFor="type">Simulation Type</FormLabel>
            <FormSelect 
              id="type" 
              name="type" 
              value={formData.type}
              onChange={handleSelectChange}
            >
              <option value="PRODUCER_CONSUMER">Producer Consumer</option>
              <option value="DINING_PHILOSOPHERS">Dining Philosophers</option>
              <option value="READER_WRITER">Reader Writer</option>
              <option value="BARRIER">Barrier</option>
              <option value="SLEEPING_BARBER">Sleeping Barber</option>
            </FormSelect>
          </FormField>
          
          <FormField>
            <FormLabel htmlFor="threadCount">Thread Count</FormLabel>
            <FormInput 
              id="threadCount" 
              name="threadCount" 
              type="number" 
              min="1"
              max="10"
              value={formData.threadCount} 
              onChange={handleInputChange}
            />
          </FormField>
          
          <FormField>
            <FormLabel htmlFor="bufferSize">Buffer Size</FormLabel>
            <FormInput 
              id="bufferSize" 
              name="bufferSize" 
              type="number" 
              min="1"
              max="20"
              value={formData.bufferSize} 
              onChange={handleInputChange}
            />
          </FormField>
        </FormSection>
        
        <FormSection>
          <FormSectionTitle>Advanced Options</FormSectionTitle>
          
          <FormField>
            <FormLabel htmlFor="animationStyle">Animation Style</FormLabel>
            <FormSelect 
              id="animationStyle" 
              name="animationStyle" 
              value={formData.animationStyle}
              onChange={handleSelectChange}
            >
              <option value="STATIC">Static</option>
              <option value="DYNAMIC">Dynamic</option>
            </FormSelect>
          </FormField>
          
          <FormField>
            <FormLabel htmlFor="maxSteps">Maximum Steps</FormLabel>
            <FormInput 
              id="maxSteps" 
              name="maxSteps" 
              type="number" 
              min="10"
              max="1000"
              value={formData.maxSteps} 
              onChange={handleInputChange}
            />
          </FormField>
        </FormSection>
        
        <ButtonContainer>
          <Button 
            type="submit" 
            primary 
            style={{ 
              padding: '16px 32px', 
              fontSize: '18px',
              marginBottom: '20px',
            }}
          >
            Create Simulation
          </Button>
        </ButtonContainer>
      </ConfigForm>
    </ConfigurationPanel>
  );
  
  // Render the simulation visualization
  const renderSimulationView = () => {
    console.log("Rendering simulation view:", {
      isRunning: simulation?.isRunning,
      isPaused: simulation?.isPaused,
      shouldShowStartButton: !simulation?.isRunning
    });
    
    return (
      <>
        <ControlPanel>
          <ControlsContainer>
            <ButtonGroup>
              {(!simulation?.isRunning) && (
                <Button 
                  primary 
                  onClick={handleStart} 
                  style={{ 
                    padding: '12px 24px', 
                    fontSize: '16px', 
                    width: '120px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <PlayIcon /> Start
                </Button>
              )}
              
              {simulation?.isRunning && !simulation?.isPaused && (
                <Button 
                  onClick={handlePause}
                  style={{ 
                    width: '120px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <PauseIcon /> Pause
                </Button>
              )}
              
              {simulation?.isPaused && (
                <Button 
                  primary 
                  onClick={handleResume}
                  style={{ 
                    width: '120px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <PlayIcon /> Resume
                </Button>
              )}
              
              {(simulation?.isRunning || simulation?.isPaused) && (
                <Button 
                  onClick={handleStop}
                  style={{ 
                    width: '120px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <StopIcon /> Stop
                </Button>
              )}
              
              <Button 
                onClick={handleReset}
                style={{ 
                  width: '120px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <ResetIcon /> Reset
              </Button>
            </ButtonGroup>
            
            <ButtonGroup>
              <SpeedControl>
                <SpeedLabel>Speed:</SpeedLabel>
                <SpeedKnob
                  type="range"
                  min="1"
                  max="10"
                  value={speed}
                  onChange={handleSpeedChange}
                />
                <SpeedValue>{speed}x</SpeedValue>
              </SpeedControl>
              
              <Button 
                onClick={handleNewSimulation}
                style={{ 
                  width: '160px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <NewIcon /> New Simulation
              </Button>
            </ButtonGroup>
          </ControlsContainer>
        </ControlPanel>
        
        <VisualizationContainer>
          <VisualizationPanel>
            <CanvasContainer>
              {simulation && (
                <SimulationCanvas 
                  simulationId={simulation.id}
                  simulationType={simulation.type}
                  threads={simulation.threads}
                  resources={simulation.resources}
                  isRunning={simulation.isRunning}
                  isPaused={simulation.isPaused}
                  stepCount={simulation.stepCount || 0}
                />
              )}
            </CanvasContainer>
            
            <SimulationInfo>
              <MetricsPanel>
                <Metric>
                  <MetricValue>{simulation?.threads.filter(t => t.state === 'RUNNING').length || 0}</MetricValue>
                  <MetricLabel>RUNNING THREADS</MetricLabel>
                </Metric>
                <Metric>
                  <MetricValue>{simulation?.threads.filter(t => t.state === 'BLOCKED').length || 0}</MetricValue>
                  <MetricLabel>BLOCKED THREADS</MetricLabel>
                </Metric>
                <Metric>
                  <MetricValue>{simulation?.stepCount || 0}</MetricValue>
                  <MetricLabel>STEPS</MetricLabel>
                </Metric>
              </MetricsPanel>
            </SimulationInfo>
          </VisualizationPanel>
          
          <SidePanel>
            <LogPanel>
              <PanelHeader>Event Log</PanelHeader>
              <PanelContent>
                {simulation && simulation.events && (
                  <EventLog 
                    events={simulation.events} 
                    simulationState={simulation}
                  />
                )}
              </PanelContent>
            </LogPanel>
            
            <ExplanationPanel>
              <PanelHeader>Explanation</PanelHeader>
              <ExplanationContent>
                {explanationHistory.length > 0 ? (
                  explanationHistory.map((explanation, index) => (
                    <ExplanationEntry 
                      key={index} 
                      isActive={index === currentStep}
                      style={{ display: index === currentStep ? 'block' : 'none' }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: explanation }} />
                    </ExplanationEntry>
                  ))
                ) : (
                  <ExplanationText dangerouslySetInnerHTML={{ __html: explanationText }} />
                )}
              </ExplanationContent>
              {simulation && simulation.events && simulation.events.length > 0 && (
                <TimelineContainer>
                  <StepNavigation>
                    <StepButton 
                      onClick={goToPreviousStep} 
                      disabled={currentStep <= 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                      Previous
                    </StepButton>
                    <StepCounter>Step {currentStep + 1} of {simulation.stepCount || 1}</StepCounter>
                    <StepButton 
                      onClick={goToNextStep}
                      disabled={currentStep >= explanationHistory.length - 1}
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </StepButton>
                  </StepNavigation>
                  <TimelineSlider
                    type="range"
                    min="0"
                    max={Math.max(0, explanationHistory.length - 1)}
                    value={currentStep}
                    onChange={handleTimelineChange}
                    step="1"
                    style={{ width: '100%' }}
                  />
                  <TimelineLabels>
                    <span>Start</span>
                    <span>Step {currentStep + 1} of {simulation.stepCount || 1}</span>
                  </TimelineLabels>
                </TimelineContainer>
              )}
            </ExplanationPanel>
          </SidePanel>
        </VisualizationContainer>
      </>
    );
  };
  
  return (
    <PageContainer>
      <SimulationContainer>
        {!hasActiveSimulation ? renderConfigurationForm() : renderSimulationView()}
      </SimulationContainer>
    </PageContainer>
  );
};

export default SimulationPage; 