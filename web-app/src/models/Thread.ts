export type ThreadState = 'READY' | 'RUNNING' | 'WAITING' | 'BLOCKED' | 'TERMINATED' | 'NEW';

export interface Position {
  x: number;
  y: number;
}

export interface Thread {
  id: string;
  name: string;
  state: ThreadState;
  position: Position;
  targetPosition?: Position;  // Target position for smooth animation
  resourcesHeld: string[];
  resourcesWaitingFor: string[];
  resources?: string[]; // For tracking resources in visualization
} 