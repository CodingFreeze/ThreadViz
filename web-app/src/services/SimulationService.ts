import { SimulationConfig, SimulationState, SimulationType, SimulationEvent } from "../models/Simulation";
import { Thread, ThreadState } from "../models/Thread";
import { Resource } from "../models/Resource";
import { v4 as uuidv4 } from 'uuid';

// Canvas dimensions - used for positioning elements
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 700;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

// Performance optimization parameters
const SIMULATION_UPDATE_INTERVAL = 64; // ms (15fps, increased from 8fps)
const EVENT_BATCH_SIZE = 5; // Limit events per update to avoid memory bloat
const MAX_EVENTS = 1000; // Cap total events to prevent memory issues
const MAX_SIMULATION_STEPS = 100; // Maximum number of steps before simulation ends

class SimulationService {
  private simulations: Map<string, SimulationState> = new Map();
  private simulationSpeed: number = 1;
  
  private createProducerConsumerSimulation(config: SimulationConfig): SimulationState {
    const { 
      numThreads = 4, 
      bufferSize = 5,
      producerSleepTime = 300,
      consumerSleepTime = 300
    } = config;
    
    const producerCount = Math.floor(numThreads / 2);
    const consumerCount = numThreads - producerCount;
    
    // Position buffer at center
    const buffer: Resource = {
      id: uuidv4(),
      name: "Buffer",
      type: "BUFFER",
      state: "FREE",
      capacity: bufferSize,
      currentValue: 0,
      waitingThreads: [],
      position: { x: CENTER_X, y: CENTER_Y }
    };
    
    const threads: Thread[] = [];
    
    // Create producers in a semi-circle on the left
    const producerRadius = Math.min(CENTER_X * 0.6, CENTER_Y * 0.6);
    for (let i = 0; i < producerCount; i++) {
      const angle = (Math.PI / 2) - (Math.PI * i / (producerCount - 1 || 1));
      threads.push({
        id: uuidv4(),
        name: `Producer ${i+1}`,
        state: "NEW",
        position: { 
          x: CENTER_X - Math.cos(angle) * producerRadius, 
          y: CENTER_Y - Math.sin(angle) * producerRadius
        },
        resourcesHeld: [],
        resourcesWaitingFor: []
      });
    }
    
    // Create consumers in a semi-circle on the right
    const consumerRadius = Math.min(CENTER_X * 0.6, CENTER_Y * 0.6);
    for (let i = 0; i < consumerCount; i++) {
      const angle = (Math.PI / 2) - (Math.PI * i / (consumerCount - 1 || 1));
      threads.push({
        id: uuidv4(),
        name: `Consumer ${i+1}`,
        state: "NEW",
        position: { 
          x: CENTER_X + Math.cos(angle) * consumerRadius, 
          y: CENTER_Y - Math.sin(angle) * consumerRadius
        },
        resourcesHeld: [],
        resourcesWaitingFor: []
      });
    }
    
    return {
      id: uuidv4(),
      type: "PRODUCER_CONSUMER",
      threads,
      resources: [buffer],
      events: [],
      isRunning: false,
      isPaused: false,
      stepCount: 0,
      config
    };
  }
  
  private createDiningPhilosophersSimulation(config: SimulationConfig): SimulationState {
    const { 
      numThreads = 5,
      thinkingTime = 300,
      eatingTime = 500
    } = config;
    
    const threads: Thread[] = [];
    const resources: Resource[] = [];
    
    // Calculate radius based on canvas size
    const radius = Math.min(CENTER_X, CENTER_Y) * 0.5;
    
    // Create forks
    for (let i = 0; i < numThreads; i++) {
      const angle = 2 * Math.PI * i / numThreads;
      resources.push({
        id: uuidv4(),
        name: `Fork ${i+1}`,
        type: "LOCK",
        state: "FREE",
        position: {
          x: CENTER_X + radius * 1.2 * Math.cos(angle),
          y: CENTER_Y + radius * 1.2 * Math.sin(angle)
        }
      });
    }
    
    // Create philosophers
    for (let i = 0; i < numThreads; i++) {
      const angle = 2 * Math.PI * i / numThreads;
      threads.push({
        id: uuidv4(),
        name: `Philosopher ${i+1}`,
        state: "NEW",
        position: { 
          x: CENTER_X + radius * Math.cos(angle), 
          y: CENTER_Y + radius * Math.sin(angle) 
        },
        resourcesHeld: [],
        resourcesWaitingFor: []
      });
    }
    
    return {
      id: uuidv4(),
      type: "DINING_PHILOSOPHERS",
      threads,
      resources,
      events: [],
      isRunning: false,
      isPaused: false,
      stepCount: 0,
      config
    };
  }
  
  private createReaderWriterSimulation(config: SimulationConfig): SimulationState {
    const { 
      numThreads = 6,
      readTime = 300,
      writeTime = 500
    } = config;
    
    const readerCount = Math.floor(3 * numThreads / 4);
    const writerCount = numThreads - readerCount;
    
    // Position shared resource at center
    const sharedResource: Resource = {
      id: uuidv4(),
      name: "Shared Resource",
      type: "LOCK",
      state: "FREE",
      position: { x: CENTER_X, y: CENTER_Y }
    };
    
    const threads: Thread[] = [];
    
    // Calculate radius based on canvas size
    const radius = Math.min(CENTER_X, CENTER_Y) * 0.5;
    
    // Create readers in a semi-circle on the left
    for (let i = 0; i < readerCount; i++) {
      const angle = Math.PI / 2 + (Math.PI * i / (readerCount - 1 || 1));
      threads.push({
        id: uuidv4(),
        name: `Reader ${i+1}`,
        state: "NEW",
        position: { 
          x: CENTER_X + Math.cos(angle) * radius, 
          y: CENTER_Y + Math.sin(angle) * radius
        },
        resourcesHeld: [],
        resourcesWaitingFor: []
      });
    }
    
    // Create writers in a semi-circle on the right
    for (let i = 0; i < writerCount; i++) {
      const angle = -Math.PI / 2 + (Math.PI * i / (writerCount - 1 || 1));
      threads.push({
        id: uuidv4(),
        name: `Writer ${i+1}`,
        state: "NEW",
        position: { 
          x: CENTER_X + Math.cos(angle) * radius, 
          y: CENTER_Y + Math.sin(angle) * radius
        },
        resourcesHeld: [],
        resourcesWaitingFor: []
      });
    }
    
    return {
      id: uuidv4(),
      type: "READER_WRITER",
      threads,
      resources: [sharedResource],
      events: [],
      isRunning: false,
      isPaused: false,
      stepCount: 0,
      config
    };
  }
  
  private createBarrierSimulation(config: SimulationConfig): SimulationState {
    const { 
      numThreads = 4,
      barrierThreshold = numThreads
    } = config;
    
    // Position barrier at center
    const barrier: Resource = {
      id: uuidv4(),
      name: "Barrier",
      type: "BARRIER",
      state: "FREE",
      capacity: barrierThreshold,
      currentValue: 0,
      waitingThreads: [],
      position: { x: CENTER_X, y: CENTER_Y }
    };
    
    const threads: Thread[] = [];
    
    // Position threads in a circle around the barrier
    const radius = Math.min(CENTER_X, CENTER_Y) * 0.6;
    for (let i = 0; i < numThreads; i++) {
      const angle = 2 * Math.PI * i / numThreads;
      threads.push({
        id: uuidv4(),
        name: `Thread ${i+1}`,
        state: "NEW",
        position: { 
          x: CENTER_X + Math.cos(angle) * radius, 
          y: CENTER_Y + Math.sin(angle) * radius
        },
        resourcesHeld: [],
        resourcesWaitingFor: []
      });
    }
    
    return {
      id: uuidv4(),
      type: "BARRIER",
      threads,
      resources: [barrier],
      events: [],
      isRunning: false,
      isPaused: false,
      stepCount: 0
    };
  }
  
  private createSleepingBarberSimulation(config: SimulationConfig): SimulationState {
    const { 
      numThreads = 5,
      waitingRoomSize = 5
    } = config;
    
    const resources: Resource[] = [];
    
    // Position barber chair at center
    const barberChair: Resource = {
      id: uuidv4(),
      name: "Barber Chair",
      type: "LOCK",
      state: "FREE",
      position: { x: CENTER_X, y: CENTER_Y }
    };
    resources.push(barberChair);
    
    // Position waiting room queue
    const waitingRoom: Resource = {
      id: uuidv4(),
      name: "Waiting Room",
      type: "BUFFER",
      state: "FREE",
      capacity: waitingRoomSize,
      currentValue: 0,
      waitingThreads: [],
      position: { x: CENTER_X, y: CENTER_Y + 100 }
    };
    resources.push(waitingRoom);
    
    const threads: Thread[] = [];
    
    // Add barber
    threads.push({
      id: uuidv4(),
      name: "Barber",
      state: "NEW",
      position: { x: CENTER_X - 100, y: CENTER_Y },
      resourcesHeld: [],
      resourcesWaitingFor: []
    });
    
    // Add customers in a semi-circle
    const customerRadius = Math.min(CENTER_X, CENTER_Y) * 0.7;
    for (let i = 0; i < numThreads - 1; i++) {
      const angle = (Math.PI / 2) - (Math.PI * i / (numThreads - 2 || 1));
      threads.push({
        id: uuidv4(),
        name: `Customer ${i+1}`,
        state: "NEW",
        position: { 
          x: CENTER_X + Math.cos(angle) * customerRadius, 
          y: CENTER_Y + Math.sin(angle) * customerRadius
        },
        resourcesHeld: [],
        resourcesWaitingFor: []
      });
    }
    
    return {
      id: uuidv4(),
      type: "SLEEPING_BARBER",
      threads,
      resources,
      events: [],
      isRunning: false,
      isPaused: false,
      stepCount: 0
    };
  }
  
  private createCigaretteSmokersSimulation(config: SimulationConfig): SimulationState {
    const { 
      ingredientTypes = 3
    } = config;
    
    const threads: Thread[] = [];
    const resources: Resource[] = [];
    
    // Create agent thread
    threads.push({
      id: uuidv4(),
      name: "Agent",
      state: "NEW",
      position: { x: CENTER_X, y: CENTER_Y - 150 },
      resourcesHeld: [],
      resourcesWaitingFor: []
    });
    
    // Create table resource
    const table: Resource = {
      id: uuidv4(),
      name: "Table",
      type: "BUFFER",
      state: "FREE",
      capacity: 2, // Max 2 ingredients at a time
      currentValue: 0,
      waitingThreads: [],
      position: { x: CENTER_X, y: CENTER_Y }
    };
    resources.push(table);
    
    // Create ingredient resources
    const ingredientNames = ["Tobacco", "Paper", "Matches", "Lighter", "Filter"];
    for (let i = 0; i < ingredientTypes; i++) {
      resources.push({
        id: uuidv4(),
        name: ingredientNames[i],
        type: "RESOURCE",
        state: "FREE",
        position: { 
          x: CENTER_X + Math.cos(2 * Math.PI * i / ingredientTypes) * 80, 
          y: CENTER_Y + Math.sin(2 * Math.PI * i / ingredientTypes) * 80
        }
      });
    }
    
    // Create smoker threads positioned in a circle
    const radius = Math.min(CENTER_X, CENTER_Y) * 0.6;
    for (let i = 0; i < ingredientTypes; i++) {
      const angle = 2 * Math.PI * i / ingredientTypes;
      threads.push({
        id: uuidv4(),
        name: `Smoker ${i+1}`,
        state: "NEW",
        position: { 
          x: CENTER_X + Math.cos(angle) * radius, 
          y: CENTER_Y + Math.sin(angle) * radius + 100
        },
        resourcesHeld: [resources[i+2].id], // Each smoker has one ingredient
        resourcesWaitingFor: []
      });
    }
    
    return {
      id: uuidv4(),
      type: "CIGARETTE_SMOKERS",
      threads,
      resources,
      events: [],
      isRunning: false,
      isPaused: false,
      stepCount: 0
    };
  }
  
  createSimulation(config: SimulationConfig): string {
    console.log("Creating simulation with config:", config);
    
    let simulation: SimulationState;
    
    switch (config.type) {
      case 'PRODUCER_CONSUMER':
        simulation = this.createProducerConsumerSimulation(config);
        break;
      case 'DINING_PHILOSOPHERS':
        simulation = this.createDiningPhilosophersSimulation(config);
        break;
      case 'READER_WRITER':
        simulation = this.createReaderWriterSimulation(config);
        break;
      default:
        // Fallback to Producer-Consumer
        simulation = this.createProducerConsumerSimulation({
          ...config,
          type: 'PRODUCER_CONSUMER'
        });
        break;
    }
    
    // Save configuration
    simulation.config = config;
    
    // Initialize step count
    simulation.stepCount = 0;
    
    // Add to simulations map
    this.simulations.set(simulation.id, simulation);
    
    console.log(`Created simulation: ${simulation.type} with ID ${simulation.id}`);
    
    return simulation.id;
  }
  
  getSimulation(id: string): SimulationState | undefined {
    return this.simulations.get(id);
  }
  
  startSimulation(id: string): void {
    const simulation = this.simulations.get(id);
    if (!simulation) return;
    
    simulation.isRunning = true;
    simulation.isPaused = false;
    simulation.startTime = Date.now();
    simulation.stepCount = 0;
    
    // Add simulation started event
    simulation.events.push({
      id: uuidv4(),
      time: Date.now(),
      type: 'SIMULATION_STARTED',
      description: `Started ${simulation.type} simulation`
    });
    
    // Start all threads
    simulation.threads.forEach(thread => {
      thread.state = 'RUNNING';
    });
    
    // Update simulation
    this.simulations.set(id, { ...simulation });
  }
  
  pauseSimulation(id: string): void {
    const simulation = this.simulations.get(id);
    if (!simulation) return;
    
    simulation.isPaused = true;
    simulation.events.push({
      id: uuidv4(),
      time: Date.now(),
      type: 'SIMULATION_PAUSED',
      description: `Paused ${simulation.type} simulation`
    });
    
    this.simulations.set(id, { ...simulation });
  }
  
  resumeSimulation(id: string): void {
    const simulation = this.simulations.get(id);
    if (!simulation) return;
    
    simulation.isPaused = false;
    simulation.events.push({
      id: uuidv4(),
      time: Date.now(),
      type: 'SIMULATION_RESUMED',
      description: `Resumed ${simulation.type} simulation`
    });
    
    this.simulations.set(id, { ...simulation });
  }
  
  stopSimulation(id: string): void {
    const simulation = this.simulations.get(id);
    if (!simulation) return;
    
    simulation.isRunning = false;
    simulation.isPaused = false;
    simulation.endTime = Date.now();
    
    // Add simulation stopped event if not already added
    if (!simulation.events.some(e => e.type === 'SIMULATION_STOPPED')) {
      simulation.events.push({
        id: uuidv4(),
        time: Date.now(),
        type: 'SIMULATION_STOPPED',
        description: `Stopped ${simulation.type} simulation after ${simulation.stepCount} steps`
      });
    }
    
    this.simulations.set(id, { ...simulation });
  }
  
  resetSimulation(id: string): void {
    const simulation = this.simulations.get(id);
    if (!simulation || !simulation.config) return;
    
    // Create a new simulation with the same config
    const newId = this.createSimulation(simulation.config);
    
    // Replace the old simulation with the new one but keep the ID
    const newSimulation = this.simulations.get(newId);
    if (newSimulation) {
      newSimulation.id = id;
      this.simulations.set(id, newSimulation);
      this.simulations.delete(newId);
    }
  }
  
  setSimulationSpeed(speed: number): void {
    // Store speed as a property of the service
    this.simulationSpeed = Math.max(0.5, Math.min(10, speed));
    console.log(`Simulation speed set to ${this.simulationSpeed}x`);
    
    // Adjust the update interval based on speed
    // This would be implemented if we had a timer-based update mechanism
  }
  
  updateSimulation(id: string): void {
    const simulation = this.simulations.get(id);
    if (!simulation || !simulation.isRunning || simulation.isPaused) return;
    
    // Increment step count
    simulation.stepCount = (simulation.stepCount || 0) + 1;
    
    // Check if maximum steps reached
    const maxStepsReached = simulation.stepCount >= MAX_SIMULATION_STEPS;
    
    // Check if all threads are terminated
    const allThreadsTerminated = simulation.threads.every(thread => 
      thread.state === 'TERMINATED'
    );
    
    // Check if simulation has been running too long
    const hasRunTooLong = simulation.startTime && Date.now() - simulation.startTime > 60000; // 60 seconds max
    
    // Update the specific simulation type
    switch (simulation.type) {
      case 'PRODUCER_CONSUMER':
        this.updateProducerConsumerSimulation(simulation);
        break;
      case 'DINING_PHILOSOPHERS':
        this.updateDiningPhilosophersSimulation(simulation);
        break;
      case 'READER_WRITER':
        this.updateReaderWriterSimulation(simulation);
        break;
      default:
        // Do nothing for unimplemented types
        break;
    }
    
    // Trim events if there are too many
    if (simulation.events.length > MAX_EVENTS) {
      simulation.events = simulation.events.slice(-MAX_EVENTS);
    }
    
    if (allThreadsTerminated || hasRunTooLong || maxStepsReached) {
      this.stopSimulation(id);
      
      let reason = 'Simulation completed: all threads terminated';
      if (maxStepsReached) {
        reason = `Simulation completed: maximum ${MAX_SIMULATION_STEPS} steps reached`;
      } else if (hasRunTooLong) {
        reason = 'Simulation completed: maximum duration reached';
      }
      
      simulation.events.push({
        id: uuidv4(),
        time: Date.now(),
        type: 'SIMULATION_STOPPED',
        description: reason
      });
    }
    
    // Update the simulation in the map
    this.simulations.set(id, { ...simulation });
  }
  
  // Implementation of the Producer-Consumer simulation update logic
  private updateProducerConsumerSimulation(simulation: SimulationState): void {
    if (!simulation || !simulation.threads || !simulation.resources) return;
    
    const buffer = simulation.resources.find(r => r.type === 'BUFFER');
    if (!buffer) return;
    
    // Get producers and consumers
    const producers = simulation.threads.filter(t => t.name.startsWith('Producer'));
    const consumers = simulation.threads.filter(t => t.name.startsWith('Consumer'));
    
    // Update producers
    producers.forEach(producer => {
      if (producer.state === 'TERMINATED') return;
      
      // Simulate producer behavior
      const randomChance = Math.random();
      
      if (producer.state === 'RUNNING') {
        // Try to produce if not at max capacity
        if (buffer.currentValue !== undefined && buffer.capacity !== undefined && 
            buffer.currentValue < buffer.capacity) {
          
          // Successfully produced an item
          buffer.currentValue++;
          
          // Add event
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: producer.id,
            resourceId: buffer.id,
            type: 'BUFFER_ITEM_ADDED',
            description: `${producer.name} added item to buffer (${buffer.currentValue}/${buffer.capacity})`
          });
          
          // Randomly go to sleep or continue producing
          if (randomChance < 0.3) {
            producer.state = 'WAITING';
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: producer.id,
              type: 'THREAD_WAITING',
              description: `${producer.name} is sleeping`
            });
          }
        } else {
          // Buffer is full, producer is blocked
          producer.state = 'BLOCKED';
          producer.resourcesWaitingFor = [buffer.id];
          
          if (!buffer.waitingThreads) {
            buffer.waitingThreads = [];
          }
          
          if (!buffer.waitingThreads.includes(producer.id)) {
            buffer.waitingThreads.push(producer.id);
          }
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: producer.id,
            resourceId: buffer.id,
            type: 'THREAD_BLOCKED',
            description: `${producer.name} is blocked (buffer full)`
          });
        }
      } else if (producer.state === 'WAITING') {
        // Wake up with some probability
        if (randomChance < 0.2) {
          producer.state = 'RUNNING';
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: producer.id,
            type: 'THREAD_RESUMED',
            description: `${producer.name} woke up`
          });
        }
      } else if (producer.state === 'BLOCKED') {
        // Check if buffer has space now
        if (buffer.currentValue !== undefined && buffer.capacity !== undefined && 
            buffer.currentValue < buffer.capacity) {
          producer.state = 'RUNNING';
          producer.resourcesWaitingFor = [];
          
          // Remove from waiting threads
          if (buffer.waitingThreads) {
            buffer.waitingThreads = buffer.waitingThreads.filter(id => id !== producer.id);
          }
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: producer.id,
            type: 'THREAD_RESUMED',
            description: `${producer.name} unblocked (buffer has space)`
          });
        }
      }
    });
    
    // Update consumers
    consumers.forEach(consumer => {
      if (consumer.state === 'TERMINATED') return;
      
      // Simulate consumer behavior
      const randomChance = Math.random();
      
      if (consumer.state === 'RUNNING') {
        // Try to consume if buffer has items
        if (buffer.currentValue !== undefined && buffer.currentValue > 0) {
          // Successfully consumed an item
          buffer.currentValue--;
          
          // Add event
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: consumer.id,
            resourceId: buffer.id,
            type: 'BUFFER_ITEM_REMOVED',
            description: `${consumer.name} removed item from buffer (${buffer.currentValue}/${buffer.capacity})`
          });
          
          // Randomly go to sleep or continue consuming
          if (randomChance < 0.3) {
            consumer.state = 'WAITING';
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: consumer.id,
              type: 'THREAD_WAITING',
              description: `${consumer.name} is sleeping`
            });
          }
        } else {
          // Buffer is empty, consumer is blocked
          consumer.state = 'BLOCKED';
          consumer.resourcesWaitingFor = [buffer.id];
          
          if (!buffer.waitingThreads) {
            buffer.waitingThreads = [];
          }
          
          if (!buffer.waitingThreads.includes(consumer.id)) {
            buffer.waitingThreads.push(consumer.id);
          }
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: consumer.id,
            resourceId: buffer.id,
            type: 'THREAD_BLOCKED',
            description: `${consumer.name} is blocked (buffer empty)`
          });
        }
      } else if (consumer.state === 'WAITING') {
        // Wake up with some probability
        if (randomChance < 0.2) {
          consumer.state = 'RUNNING';
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: consumer.id,
            type: 'THREAD_RESUMED',
            description: `${consumer.name} woke up`
          });
        }
      } else if (consumer.state === 'BLOCKED') {
        // Check if buffer has items now
        if (buffer.currentValue !== undefined && buffer.currentValue > 0) {
          consumer.state = 'RUNNING';
          consumer.resourcesWaitingFor = [];
          
          // Remove from waiting threads
          if (buffer.waitingThreads) {
            buffer.waitingThreads = buffer.waitingThreads.filter(id => id !== consumer.id);
          }
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: consumer.id,
            type: 'THREAD_RESUMED',
            description: `${consumer.name} unblocked (buffer has items)`
          });
        }
      }
    });
  }
  
  // Implementation of the Dining Philosophers simulation update logic
  private updateDiningPhilosophersSimulation(simulation: SimulationState): void {
    if (!simulation || !simulation.threads || !simulation.resources) return;
    
    const philosophers = simulation.threads;
    const forks = simulation.resources;
    
    // Update each philosopher
    philosophers.forEach((philosopher, index) => {
      if (philosopher.state === 'TERMINATED') return;
      
      // Determine which forks this philosopher needs
      const leftForkIndex = index;
      const rightForkIndex = (index + 1) % forks.length;
      
      const leftFork = forks[leftForkIndex];
      const rightFork = forks[rightForkIndex];
      
      // Simulate philosopher behavior based on current state
      const randomChance = Math.random();
      
      if (philosopher.state === 'RUNNING') {
        // Philosopher is thinking
        if (randomChance < 0.3) {
          // Philosopher gets hungry and tries to grab forks
          
          // Check if both forks are available
          if (leftFork.state === 'FREE' && rightFork.state === 'FREE') {
            // Acquire both forks
            leftFork.state = 'LOCKED';
            rightFork.state = 'LOCKED';
            
            // Update philosopher's held resources
            philosopher.resourcesHeld = [leftFork.id, rightFork.id];
            
            // Mark philosopher as eating (WAITING state)
            philosopher.state = 'WAITING';
            
            // Add events
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: philosopher.id,
              resourceId: leftFork.id,
              type: 'RESOURCE_ACQUIRED',
              description: `${philosopher.name} picked up left fork (${leftFork.name})`
            });
            
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: philosopher.id,
              resourceId: rightFork.id,
              type: 'RESOURCE_ACQUIRED',
              description: `${philosopher.name} picked up right fork (${rightFork.name})`
            });
            
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: philosopher.id,
              type: 'THREAD_WAITING',
              description: `${philosopher.name} is eating`
            });
          } else {
            // At least one fork is not available
            // Try to acquire left fork first (leads to deadlock!)
            if (leftFork.state === 'FREE') {
              leftFork.state = 'LOCKED';
              philosopher.resourcesHeld.push(leftFork.id);
              
              // Add event
              simulation.events.push({
                id: uuidv4(),
                time: Date.now(),
                threadId: philosopher.id,
                resourceId: leftFork.id,
                type: 'RESOURCE_ACQUIRED',
                description: `${philosopher.name} picked up left fork (${leftFork.name})`
              });
              
              // Wait for right fork
              philosopher.state = 'BLOCKED';
              philosopher.resourcesWaitingFor = [rightFork.id];
              
              // Add to waiting threads
              if (!rightFork.waitingThreads) {
                rightFork.waitingThreads = [];
              }
              
              if (!rightFork.waitingThreads.includes(philosopher.id)) {
                rightFork.waitingThreads.push(philosopher.id);
              }
              
              simulation.events.push({
                id: uuidv4(),
                time: Date.now(),
                threadId: philosopher.id,
                resourceId: rightFork.id,
                type: 'THREAD_BLOCKED',
                description: `${philosopher.name} is waiting for right fork (${rightFork.name})`
              });
            }
          }
        }
      } else if (philosopher.state === 'WAITING') {
        // Philosopher is eating, finish with some probability
        if (randomChance < 0.2) {
          // Release both forks
          leftFork.state = 'FREE';
          rightFork.state = 'FREE';
          
          // Wake up any waiting philosophers
          if (leftFork.waitingThreads && leftFork.waitingThreads.length > 0) {
            leftFork.waitingThreads = [];
          }
          
          if (rightFork.waitingThreads && rightFork.waitingThreads.length > 0) {
            rightFork.waitingThreads = [];
          }
          
          // Update philosopher
          philosopher.resourcesHeld = [];
          philosopher.state = 'RUNNING';
          
          // Add events
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: philosopher.id,
            resourceId: leftFork.id,
            type: 'RESOURCE_RELEASED',
            description: `${philosopher.name} put down left fork (${leftFork.name})`
          });
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: philosopher.id,
            resourceId: rightFork.id,
            type: 'RESOURCE_RELEASED',
            description: `${philosopher.name} put down right fork (${rightFork.name})`
          });
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: philosopher.id,
            type: 'THREAD_RESUMED',
            description: `${philosopher.name} finished eating and is thinking again`
          });
        }
      } else if (philosopher.state === 'BLOCKED') {
        // Check if the philosopher can now acquire the right fork
        if (rightFork.state === 'FREE') {
          rightFork.state = 'LOCKED';
          philosopher.resourcesHeld.push(rightFork.id);
          philosopher.resourcesWaitingFor = [];
          philosopher.state = 'WAITING'; // Start eating
          
          // Remove from waiting threads
          if (rightFork.waitingThreads) {
            rightFork.waitingThreads = rightFork.waitingThreads.filter(id => id !== philosopher.id);
          }
          
          // Add events
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: philosopher.id,
            resourceId: rightFork.id,
            type: 'RESOURCE_ACQUIRED',
            description: `${philosopher.name} picked up right fork (${rightFork.name})`
          });
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: philosopher.id,
            type: 'THREAD_WAITING',
            description: `${philosopher.name} is eating`
          });
        }
      }
    });
  }
  
  // Implementation of the Reader-Writer simulation update logic
  private updateReaderWriterSimulation(simulation: SimulationState): void {
    if (!simulation || !simulation.threads || !simulation.resources) return;
    
    const readers = simulation.threads.filter(t => t.name.startsWith('Reader'));
    const writers = simulation.threads.filter(t => t.name.startsWith('Writer'));
    const resource = simulation.resources[0]; // The shared resource
    
    // Count active readers
    const activeReaders = readers.filter(r => 
      r.resourcesHeld.includes(resource.id)
    ).length;
    
    // Check if there's an active writer
    const activeWriter = writers.find(w => 
      w.resourcesHeld.includes(resource.id)
    );
    
    // Update readers
    readers.forEach(reader => {
      if (reader.state === 'TERMINATED') return;
      
      const randomChance = Math.random();
      
      if (reader.state === 'RUNNING') {
        // Reader wants to read with some probability
        if (randomChance < 0.3) {
          if (!activeWriter) {
            // No active writer, reader can access the resource
            if (!reader.resourcesHeld.includes(resource.id)) {
              reader.resourcesHeld.push(resource.id);
            }
            reader.state = 'WAITING'; // Reading state
            
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: reader.id,
              resourceId: resource.id,
              type: 'RESOURCE_ACQUIRED',
              description: `${reader.name} started reading (${activeReaders + 1} active readers)`
            });
          } else {
            // There's an active writer, reader must wait
            reader.state = 'BLOCKED';
            reader.resourcesWaitingFor = [resource.id];
            
            if (!resource.waitingThreads) {
              resource.waitingThreads = [];
            }
            
            if (!resource.waitingThreads.includes(reader.id)) {
              resource.waitingThreads.push(reader.id);
            }
            
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: reader.id,
              resourceId: resource.id,
              type: 'THREAD_BLOCKED',
              description: `${reader.name} waiting to read (writer active)`
            });
          }
        }
      } else if (reader.state === 'WAITING') {
        // Reader is reading, finish with some probability
        if (randomChance < 0.2) {
          // Remove resource from held list
          reader.resourcesHeld = reader.resourcesHeld.filter(id => id !== resource.id);
          reader.state = 'RUNNING';
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: reader.id,
            resourceId: resource.id,
            type: 'RESOURCE_RELEASED',
            description: `${reader.name} finished reading (${activeReaders - 1} active readers)`
          });
        }
      } else if (reader.state === 'BLOCKED') {
        // Blocked reader waits for no active writer
        if (!activeWriter) {
          reader.state = 'RUNNING';
          reader.resourcesWaitingFor = [];
          
          // Remove from waiting threads
          if (resource.waitingThreads) {
            resource.waitingThreads = resource.waitingThreads.filter(id => id !== reader.id);
          }
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: reader.id,
            type: 'THREAD_RESUMED',
            description: `${reader.name} can now read (no active writer)`
          });
        }
      }
    });
    
    // Update writers
    writers.forEach(writer => {
      if (writer.state === 'TERMINATED') return;
      
      const randomChance = Math.random();
      
      if (writer.state === 'RUNNING') {
        // Writer wants to write with some probability
        if (randomChance < 0.3) {
          if (activeReaders === 0 && !activeWriter) {
            // No active readers or writers, writer can access the resource
            writer.resourcesHeld.push(resource.id);
            writer.state = 'WAITING'; // Writing state
            
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: writer.id,
              resourceId: resource.id,
              type: 'RESOURCE_ACQUIRED',
              description: `${writer.name} started writing`
            });
          } else {
            // Resource is in use, writer must wait
            writer.state = 'BLOCKED';
            writer.resourcesWaitingFor = [resource.id];
            
            if (!resource.waitingThreads) {
              resource.waitingThreads = [];
            }
            
            if (!resource.waitingThreads.includes(writer.id)) {
              resource.waitingThreads.push(writer.id);
            }
            
            const reason = activeWriter 
              ? 'another writer active' 
              : `${activeReaders} readers active`;
            
            simulation.events.push({
              id: uuidv4(),
              time: Date.now(),
              threadId: writer.id,
              resourceId: resource.id,
              type: 'THREAD_BLOCKED',
              description: `${writer.name} waiting to write (${reason})`
            });
          }
        }
      } else if (writer.state === 'WAITING') {
        // Writer is writing, finish with some probability
        if (randomChance < 0.2) {
          // Remove resource from held list
          writer.resourcesHeld = writer.resourcesHeld.filter(id => id !== resource.id);
          writer.state = 'RUNNING';
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: writer.id,
            resourceId: resource.id,
            type: 'RESOURCE_RELEASED',
            description: `${writer.name} finished writing`
          });
        }
      } else if (writer.state === 'BLOCKED') {
        // Blocked writer waits for no active readers or writers
        if (activeReaders === 0 && !activeWriter) {
          writer.state = 'RUNNING';
          writer.resourcesWaitingFor = [];
          
          // Remove from waiting threads
          if (resource.waitingThreads) {
            resource.waitingThreads = resource.waitingThreads.filter(id => id !== writer.id);
          }
          
          simulation.events.push({
            id: uuidv4(),
            time: Date.now(),
            threadId: writer.id,
            type: 'THREAD_RESUMED',
            description: `${writer.name} can now write (resource free)`
          });
        }
      }
    });
  }
}

// Create a singleton instance
export const simulationService = new SimulationService(); 