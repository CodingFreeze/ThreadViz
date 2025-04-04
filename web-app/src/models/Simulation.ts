import { Thread } from './Thread';
import { Resource } from './Resource';

export type SimulationType = 'PRODUCER_CONSUMER' | 'DINING_PHILOSOPHERS' | 'READER_WRITER' | 'BARRIER' | 'SLEEPING_BARBER' | 'CIGARETTE_SMOKERS';
export type FairnessPolicy = 'FIFO' | 'RANDOM' | 'PRIORITY';
export type AnimationStyle = 'SMOOTH' | 'STEP' | 'INSTANT' | 'DISCRETE' | 'STATIC' | 'DYNAMIC';
export type DeadlockDetectionStrategy = 'NONE' | 'TIMEOUT' | 'RESOURCE_ALLOCATION_GRAPH';

export interface SimulationConfig {
  // Basic settings
  type: SimulationType;
  numThreads?: number;
  threadCount?: number;
  bufferSize?: number;
  speed?: number;
  executionSpeed?: number;
  resourceCount?: number;
  maxSteps?: number;
  
  // Timing parameters
  producerSleepTime?: number;
  consumerSleepTime?: number;
  thinkingTime?: number;
  eatingTime?: number;
  readTime?: number;
  writeTime?: number;
  
  // New timing parameters for additional simulations
  barrierWaitTime?: number;
  barberServiceTime?: number;
  customerArrivalTime?: number;
  smokerWaitTime?: number;
  agentWaitTime?: number;
  
  // Behavioral settings
  fairnessPolicy?: FairnessPolicy;
  visualizeDeadlocks?: boolean;
  deadlockDetection?: DeadlockDetectionStrategy;
  deadlockRecovery?: boolean;
  priorityInversion?: boolean;
  
  // Reader-Writer specific
  readerPreference?: boolean;
  writerPreference?: boolean;
  
  // Barrier specific
  barrierThreshold?: number;
  
  // Sleeping Barber specific
  waitingRoomSize?: number;
  
  // Cigarette Smokers specific
  ingredientTypes?: number;
  
  // Visual settings
  showThreadPaths?: boolean;
  animationStyle?: AnimationStyle;
  colorScheme?: string;
  showDetailedStats?: boolean;
  
  // Advanced settings
  randomSeed?: number;
  simulationStepDelay?: number;
  maxEvents?: number;
  logLevel?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
}

export interface SimulationState {
  id: string;
  type: SimulationType;
  threads: Thread[];
  resources: Resource[];
  events: SimulationEvent[];
  isRunning: boolean;
  isPaused: boolean;
  startTime?: number;
  endTime?: number;
  config?: SimulationConfig;
  statistics?: SimulationStatistics;
  stepCount?: number;
}

export interface SimulationStatistics {
  threadStats: {
    runningTime: Record<string, number>;
    waitingTime: Record<string, number>;
    blockedTime: Record<string, number>;
    resourceAcquisitions: Record<string, number>;
  };
  resourceStats: {
    utilizationRate: Record<string, number>;
    contention: Record<string, number>;
    averageHoldTime: Record<string, number>;
  };
  systemStats: {
    throughput: number;
    averageTurnaroundTime: number;
    deadlockCount: number;
    deadlockRecoveryCount: number;
  };
}

export interface SimulationEvent {
  id: string;
  time: number;
  threadId?: string;
  resourceId?: string;
  type: 'THREAD_CREATED' | 'THREAD_STARTED' | 'THREAD_WAITING' | 'THREAD_BLOCKED' | 
         'THREAD_RESUMED' | 'THREAD_TERMINATED' | 'RESOURCE_ACQUIRED' | 'RESOURCE_RELEASED' |
         'BUFFER_ITEM_ADDED' | 'BUFFER_ITEM_REMOVED' | 'BARRIER_ARRIVED' | 'BARRIER_RELEASED' |
         'CUSTOMER_ARRIVED' | 'BARBER_SLEEPING' | 'BARBER_SERVING' | 'CUSTOMER_SERVED' |
         'AGENT_SUPPLIED' | 'SMOKER_SMOKING' | 'SIMULATION_STARTED' | 'SIMULATION_PAUSED' | 
         'SIMULATION_RESUMED' | 'SIMULATION_STOPPED' | 'DEADLOCK_DETECTED' | 'DEADLOCK_RESOLVED';
  description: string;
  details?: Record<string, any>;
} 