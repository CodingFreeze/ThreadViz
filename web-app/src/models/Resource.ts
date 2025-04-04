import { Position } from './Thread';

export type ResourceType = 'LOCK' | 'BUFFER' | 'SEMAPHORE' | 'BARRIER' | 'RESOURCE';
export type ResourceState = 'FREE' | 'OCCUPIED' | 'BUSY' | 'LOCKED';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  state: ResourceState;
  position?: Position;
  targetPosition?: Position;  // Target position for smooth animation
  capacity?: number;
  currentValue?: number;
  heldBy?: string[];
  waitingThreads?: string[];
} 