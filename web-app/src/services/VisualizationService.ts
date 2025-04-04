import { SimulationState } from "../models/Simulation";
import { Thread } from "../models/Thread";

type UpdateCallback = (timestamp: number) => void;

// Constants for collision prevention
const NODE_RADIUS = 40; // Approximate radius of a node
const MIN_DISTANCE = NODE_RADIUS * 2; // Minimum distance between nodes
const REPULSION_STRENGTH = 0.8; // Reduced from 1.5 to decrease repulsion force
const BOUNDARY_STRENGTH = 0.2; // New constant for boundary force
const RELATIONSHIP_ATTRACTION = 0.03; // New constant for attraction between related nodes

// Debug flag
const DEBUG_ENABLED = true;

class VisualizationService {
  private callbacks: Map<string, UpdateCallback> = new Map();
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private isRunning: boolean = false;
  private speedFactor: number = 1;
  private rafOptimized: boolean = true; // Use optimized requestAnimationFrame

  constructor() {
    this.log("VisualizationService initialized");
  }

  // Start the animation loop with improved error handling
  startVisualization(): void {
    if (this.isRunning) {
      this.log("Animation already running, not starting again");
      return;
    }
    
    try {
      this.log("Starting visualization animation loop");
      this.isRunning = true;
      this.lastTimestamp = performance.now();
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
    } catch (error) {
      console.error("Error starting visualization:", error);
      this.isRunning = false;
    }
  }

  // Stop the animation loop
  stopVisualization(): void {
    this.log(`Stopping visualization (running: ${this.isRunning}, frame ID: ${this.animationFrameId})`);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isRunning = false;
  }

  // Register a callback to be called on each animation frame
  registerVisualization(id: string, callback: UpdateCallback): void {
    this.log(`Registering visualization with ID: ${id}`);
    
    // Clear any previous callbacks with the same ID to prevent duplicates
    if (this.callbacks.has(id)) {
      this.log(`Replacing existing callback with ID: ${id}`);
      this.callbacks.delete(id);
    }
    
    this.callbacks.set(id, callback);
    this.log(`Total registered callbacks: ${this.callbacks.size}`);
    
    // If this is the first callback, start the animation loop
    if (this.callbacks.size > 0 && !this.isRunning) {
      this.log("Starting animation loop due to new registration");
      this.startVisualization();
    }
  }

  // Unregister a callback
  unregisterVisualization(id: string): void {
    this.log(`Unregistering visualization with ID: ${id}`);
    this.callbacks.delete(id);
    this.log(`Remaining callbacks: ${this.callbacks.size}`);
    
    // If there are no more callbacks, stop the animation loop
    if (this.callbacks.size === 0 && this.isRunning) {
      this.log("No more callbacks, stopping animation loop");
      this.stopVisualization();
    }
  }

  // Set the global speed factor
  setSpeedFactor(speed: number): void {
    this.log(`Setting speed factor to: ${speed}`);
    this.speedFactor = speed;
  }

  // Toggle RAF optimization for testing
  toggleRafOptimization(optimized: boolean): void {
    this.log(`Setting RAF optimization to: ${optimized}`);
    this.rafOptimized = optimized;
  }

  // Reset the visualization service
  resetService(): void {
    this.log("Resetting visualization service");
    this.stopVisualization();
    this.callbacks.clear();
    this.lastTimestamp = 0;
    this.speedFactor = 1;
  }

  // The main animation loop - optimized for performance
  private animationLoop = (timestamp: number): void => {
    try {
      // Use high-resolution timestamps for smoother animation 
      if (!timestamp) timestamp = performance.now();
      
      // Calculate delta time and apply speed factor
      const deltaTime = (timestamp - this.lastTimestamp) * this.speedFactor;
      this.lastTimestamp = timestamp;

      // Call all registered callbacks with the delta time
      if (this.callbacks.size > 0) {
        this.callbacks.forEach((callback, id) => {
          try {
            callback(deltaTime);
          } catch (callbackError) {
            console.error(`Error in visualization callback (ID: ${id}):`, callbackError);
            // Don't remove callback on error - it might recover
          }
        });
      } else {
        this.log("No callbacks registered, stopping animation loop");
        this.stopVisualization();
        return;
      }

      // Request the next frame with optimization
      if (this.isRunning) {
        if (this.rafOptimized) {
          // Use setTimeout with 0 delay to yield to the main thread occasionally
          // This prevents UI blocking during intensive simulations
          if (this.callbacks.size > 2 || this.speedFactor > 2) {
            setTimeout(() => {
              if (this.isRunning) { // Check again in case it was stopped during timeout
                this.animationFrameId = requestAnimationFrame(this.animationLoop);
              }
            }, 0);
          } else {
            this.animationFrameId = requestAnimationFrame(this.animationLoop);
          }
        } else {
          this.animationFrameId = requestAnimationFrame(this.animationLoop);
        }
      }
    } catch (error) {
      console.error("Error in animation loop:", error);
      // Try to recover by requesting another frame
      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(this.animationLoop);
      }
    }
  }

  // Interpolate thread and resource positions for smooth animation - optimized version
  interpolatePositions(simulation: SimulationState, deltaTime: number): SimulationState {
    if (!simulation) {
      console.warn("Attempted to interpolate null simulation");
      return simulation;
    }
    
    try {
      // Use structuredClone for deep copy if available, otherwise fall back to JSON
      // Performance optimization: only create a shallow copy first
      const updatedSimulation = { ...simulation };
      
      // Ensure we have valid arrays to work with
      if (!Array.isArray(simulation.threads) || !Array.isArray(simulation.resources)) {
        console.warn("Invalid simulation structure", {
          hasThreads: Array.isArray(simulation.threads),
          hasResources: Array.isArray(simulation.resources)
        });
        return simulation;
      }
      
      // Create shallow copies of arrays to avoid modifying original
      updatedSimulation.threads = [...simulation.threads];
      updatedSimulation.resources = [...simulation.resources];
      
      // Adaptive smooth factor based on speed and frame rate
      // Lower values = smoother but slower transitions
      // Higher values = faster updates but potentially more jerky
      const baseSmooth = Math.min(0.0125 * (deltaTime / 16), 0.05);
      const smoothFactor = Math.min(baseSmooth * this.speedFactor, 0.05);
      
      // Optimized - process threads and update in-place
      for (let i = 0; i < updatedSimulation.threads.length; i++) {
        const thread = { ...updatedSimulation.threads[i] }; // Shallow copy
        
        // Skip if thread has no position
        if (!thread.position) {
          thread.position = {
            x: Math.random() * 500 + 100,
            y: Math.random() * 300 + 100
          };
          updatedSimulation.threads[i] = thread;
          continue;
        }
        
        // Skip if no target position is defined
        if (!thread.targetPosition) {
          thread.targetPosition = { ...thread.position };
          updatedSimulation.threads[i] = thread;
          continue;
        }
        
        // Enhanced easing algorithm for smoother motion
        const currentSmooth = thread.state === 'RUNNING' ? smoothFactor * 1.2 : smoothFactor * 0.8;
        
        // Calculate new position with enhanced smoothing
        thread.position = {
          x: thread.position.x + (thread.targetPosition.x - thread.position.x) * currentSmooth,
          y: thread.position.y + (thread.targetPosition.y - thread.position.y) * currentSmooth
        };
        
        // Snap to target if very close to avoid tiny movements
        if (Math.abs(thread.position.x - thread.targetPosition.x) < 0.5 &&
            Math.abs(thread.position.y - thread.targetPosition.y) < 0.5) {
          thread.position.x = thread.targetPosition.x;
          thread.position.y = thread.targetPosition.y;
        }
        
        updatedSimulation.threads[i] = thread;
      }
      
      // Optimized - process resources and update in-place
      for (let i = 0; i < updatedSimulation.resources.length; i++) {
        const resource = { ...updatedSimulation.resources[i] }; // Shallow copy
        
        // Skip if resource has no position
        if (!resource.position) {
          resource.position = {
            x: Math.random() * 500 + 100,
            y: Math.random() * 300 + 100
          };
          updatedSimulation.resources[i] = resource;
          continue;
        }
        
        // Skip if no target position is defined
        if (!resource.targetPosition) {
          resource.targetPosition = { ...resource.position };
          updatedSimulation.resources[i] = resource;
          continue;
        }
        
        // Calculate new position with smoothing
        resource.position = {
          x: resource.position.x + (resource.targetPosition.x - resource.position.x) * smoothFactor,
          y: resource.position.y + (resource.targetPosition.y - resource.position.y) * smoothFactor
        };
        
        // Snap to target if very close
        if (Math.abs(resource.position.x - resource.targetPosition.x) < 0.5 &&
            Math.abs(resource.position.y - resource.targetPosition.y) < 0.5) {
          resource.position.x = resource.targetPosition.x;
          resource.position.y = resource.targetPosition.y;
        }
        
        updatedSimulation.resources[i] = resource;
      }
      
      // Apply force-based repositioning to prevent node overlaps
      this.preventNodeOverlap(updatedSimulation);
      
      // Apply additional boundary forces to keep nodes on screen
      this.applyBoundaryForces(updatedSimulation);
      
      // Apply relationship-based attraction forces to improve visualization
      this.applyRelationshipForces(updatedSimulation);
      
      return updatedSimulation;
    } catch (error) {
      console.error("Error in interpolatePositions:", error);
      return simulation; // Return original on error
    }
  }
  
  // Prevent overlapping of nodes using force-directed algorithm
  private preventNodeOverlap(simulation: SimulationState): void {
    try {
      const allNodes = [
        ...simulation.threads.filter(t => t && t.position).map(t => ({ id: t.id, position: t.position, isThread: true })),
        ...simulation.resources.filter(r => r && r.position).map(r => ({ id: r.id, position: r.position, isThread: false }))
      ];
      
      // Apply repulsion forces between nodes
      for (let i = 0; i < allNodes.length; i++) {
        for (let j = i + 1; j < allNodes.length; j++) {
          const nodeA = allNodes[i];
          const nodeB = allNodes[j];
          
          if (!nodeA.position || !nodeB.position) continue;
          
          // Calculate distance between nodes
          const dx = nodeB.position.x - nodeA.position.x;
          const dy = nodeB.position.y - nodeA.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If nodes are too close, apply repulsion force
          if (distance < MIN_DISTANCE) {
            // Calculate force direction
            const force = (MIN_DISTANCE - distance) / distance * REPULSION_STRENGTH;
            const forceX = dx * force;
            const forceY = dy * force;
            
            // Apply force to both nodes in opposite directions
            if (nodeA.isThread) {
              const thread = simulation.threads.find(t => t.id === nodeA.id);
              if (thread && thread.position) {
                thread.position.x -= forceX / 2;
                thread.position.y -= forceY / 2;
              }
            } else {
              const resource = simulation.resources.find(r => r.id === nodeA.id);
              if (resource && resource.position) {
                resource.position.x -= forceX / 2;
                resource.position.y -= forceY / 2;
              }
            }
            
            if (nodeB.isThread) {
              const thread = simulation.threads.find(t => t.id === nodeB.id);
              if (thread && thread.position) {
                thread.position.x += forceX / 2;
                thread.position.y += forceY / 2;
              }
            } else {
              const resource = simulation.resources.find(r => r.id === nodeB.id);
              if (resource && resource.position) {
                resource.position.x += forceX / 2;
                resource.position.y += forceY / 2;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in preventNodeOverlap:", error);
      // Just log the error but don't rethrow - non-critical function
    }
  }
  
  // Apply forces to keep nodes within boundaries
  private applyBoundaryForces(simulation: SimulationState): void {
    try {
      // Define canvas boundaries - these should match your canvas size in SimulationPage
      const width = 800; // Increased canvas width
      const height = 600; // Increased canvas height
      const padding = 100; // Padding from edges
      
      // Define boundary areas
      const minX = padding;
      const maxX = width - padding;
      const minY = padding;
      const maxY = height - padding;
      
      // Center point of canvas
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Process threads
      simulation.threads.forEach(thread => {
        if (!thread.position) return;
        
        // Apply boundary forces - stronger the closer to the edge
        let dx = 0;
        let dy = 0;
        
        // X-axis boundary force
        if (thread.position.x < minX) {
          dx = (minX - thread.position.x) * BOUNDARY_STRENGTH;
        } else if (thread.position.x > maxX) {
          dx = (maxX - thread.position.x) * BOUNDARY_STRENGTH;
        }
        
        // Y-axis boundary force
        if (thread.position.y < minY) {
          dy = (minY - thread.position.y) * BOUNDARY_STRENGTH;
        } else if (thread.position.y > maxY) {
          dy = (maxY - thread.position.y) * BOUNDARY_STRENGTH;
        }
        
        // Apply a very gentle force toward center to prevent drifting
        dx += (centerX - thread.position.x) * 0.001;
        dy += (centerY - thread.position.y) * 0.001;
        
        // Apply forces
        thread.position.x += dx;
        thread.position.y += dy;
        
        // Update target position as well
        if (thread.targetPosition) {
          thread.targetPosition.x = Math.max(minX, Math.min(maxX, thread.targetPosition.x));
          thread.targetPosition.y = Math.max(minY, Math.min(maxY, thread.targetPosition.y));
        }
      });
      
      // Process resources (similar to threads)
      simulation.resources.forEach(resource => {
        if (!resource.position) return;
        
        // Apply boundary forces
        let dx = 0;
        let dy = 0;
        
        // X-axis boundary force
        if (resource.position.x < minX) {
          dx = (minX - resource.position.x) * BOUNDARY_STRENGTH;
        } else if (resource.position.x > maxX) {
          dx = (maxX - resource.position.x) * BOUNDARY_STRENGTH;
        }
        
        // Y-axis boundary force
        if (resource.position.y < minY) {
          dy = (minY - resource.position.y) * BOUNDARY_STRENGTH;
        } else if (resource.position.y > maxY) {
          dy = (maxY - resource.position.y) * BOUNDARY_STRENGTH;
        }
        
        // Apply a very gentle force toward center to prevent drifting
        dx += (centerX - resource.position.x) * 0.001;
        dy += (centerY - resource.position.y) * 0.001;
        
        // Apply forces
        resource.position.x += dx;
        resource.position.y += dy;
        
        // Update target position as well
        if (resource.targetPosition) {
          resource.targetPosition.x = Math.max(minX, Math.min(maxX, resource.targetPosition.x));
          resource.targetPosition.y = Math.max(minY, Math.min(maxY, resource.targetPosition.y));
        }
      });
    } catch (error) {
      console.error("Error in applyBoundaryForces:", error);
      // Non-critical function, just log errors
    }
  }
  
  // Apply forces to cluster related nodes together
  private applyRelationshipForces(simulation: SimulationState): void {
    try {
      // Skip if we don't have both threads and resources
      if (!simulation.threads || !simulation.resources) return;
      
      // Create a map of resource IDs to threads that use them
      const resourceToThreadMap = new Map<string, string[]>();
      
      // Populate the relationship map
      simulation.threads.forEach(thread => {
        if (thread.resources && Array.isArray(thread.resources)) {
          thread.resources.forEach(resourceId => {
            if (!resourceToThreadMap.has(resourceId)) {
              resourceToThreadMap.set(resourceId, []);
            }
            resourceToThreadMap.get(resourceId)?.push(thread.id);
          });
        }
      });
      
      // Apply attraction forces between related nodes
      resourceToThreadMap.forEach((threadIds, resourceId) => {
        // Find the resource
        const resource = simulation.resources.find(r => r.id === resourceId);
        if (!resource || !resource.position) return;
        
        // Calculate the average position of all threads using this resource
        let avgX = 0;
        let avgY = 0;
        let count = 0;
        
        threadIds.forEach(threadId => {
          const thread = simulation.threads.find(t => t.id === threadId);
          if (thread && thread.position) {
            avgX += thread.position.x;
            avgY += thread.position.y;
            count++;
          }
        });
        
        if (count > 0) {
          avgX /= count;
          avgY /= count;
          
          // Apply a gentle force to pull the resource toward the average thread position
          resource.position.x += (avgX - resource.position.x) * RELATIONSHIP_ATTRACTION;
          resource.position.y += (avgY - resource.position.y) * RELATIONSHIP_ATTRACTION;
          
          // Apply a gentle force to pull threads toward resources they're using
          threadIds.forEach(threadId => {
            const thread = simulation.threads.find(t => t.id === threadId);
            if (thread && thread.position && resource.position) {
              // Pull threads a bit toward their resources
              thread.position.x += (resource.position.x - thread.position.x) * RELATIONSHIP_ATTRACTION * 0.75;
              thread.position.y += (resource.position.y - thread.position.y) * RELATIONSHIP_ATTRACTION * 0.75;
            }
          });
        }
      });
      
      // Add additional logic for simulation types with special relationships
      if (simulation.type === 'PRODUCER_CONSUMER') {
        this.handleProducerConsumerForces(simulation);
      } else if (simulation.type === 'DINING_PHILOSOPHERS') {
        this.handleDiningPhilosophersForces(simulation);
      }
    } catch (error) {
      console.error("Error in applyRelationshipForces:", error);
      // Non-critical function, just log errors
    }
  }

  // Handle producer-consumer specific layout
  private handleProducerConsumerForces(simulation: SimulationState): void {
    // Find the buffer resource
    const buffer = simulation.resources.find(r => r.type === 'BUFFER');
    if (!buffer || !buffer.position) return;
    
    // Get producers and consumers based on thread name
    const producers: Thread[] = [];
    const consumers: Thread[] = [];
    
    simulation.threads.forEach(thread => {
      // Only use name-based identification to avoid type issues
      if (thread.name && thread.name.toLowerCase().includes('producer')) {
        producers.push(thread);
      } else if (thread.name && thread.name.toLowerCase().includes('consumer')) {
        consumers.push(thread);
      }
    });
    
    // Position producers on the left, consumers on the right of the buffer
    const bufferX = buffer.position.x;
    const bufferY = buffer.position.y;
    
    // Arrange producers and consumers if we have data
    if (producers.length > 0 || consumers.length > 0) {
      // Pull buffer toward center
      const centerX = 800 / 2; // Use the same width as defined in canvas dimensions
      buffer.position.x += (centerX - buffer.position.x) * 0.02;
      
      // Arrange producers to the left of buffer
      producers.forEach((producer, index) => {
        if (producer.position) {
          const targetX = bufferX - 150;
          const targetY = bufferY - 100 + (index * 60);
          producer.position.x += (targetX - producer.position.x) * 0.02;
          producer.position.y += (targetY - producer.position.y) * 0.02;
        }
      });
      
      // Arrange consumers to the right of buffer
      consumers.forEach((consumer, index) => {
        if (consumer.position) {
          const targetX = bufferX + 150;
          const targetY = bufferY - 100 + (index * 60);
          consumer.position.x += (targetX - consumer.position.x) * 0.02;
          consumer.position.y += (targetY - consumer.position.y) * 0.02;
        }
      });
    }
  }

  // Handle dining philosophers specific layout
  private handleDiningPhilosophersForces(simulation: SimulationState): void {
    // Find the forks (usually resources named Fork)
    const forks = simulation.resources.filter(r => 
      r.name && r.name.toLowerCase().includes('fork')
    );
    
    // Find the philosophers (usually threads named Philosopher)
    const philosophers = simulation.threads.filter(t => 
      t.name && t.name.toLowerCase().includes('philosopher')
    );
    
    if (philosophers.length > 0 && forks.length > 0) {
      // Arrange in a circle
      const centerX = 800 / 2;  // Center X (use same as canvas width)
      const centerY = 600 / 2;  // Center Y (use same as canvas height)
      const radius = 180;       // Circle radius
      
      // Position philosophers in a circle
      philosophers.forEach((philosopher, index) => {
        if (philosopher.position) {
          const angle = (index / philosophers.length) * Math.PI * 2;
          const targetX = centerX + Math.cos(angle) * radius;
          const targetY = centerY + Math.sin(angle) * radius;
          
          philosopher.position.x += (targetX - philosopher.position.x) * 0.02;
          philosopher.position.y += (targetY - philosopher.position.y) * 0.02;
        }
      });
      
      // Position forks between philosophers
      forks.forEach((fork, index) => {
        if (fork.position) {
          // Position fork between adjacent philosophers
          const angle = ((index + 0.5) / philosophers.length) * Math.PI * 2;
          const targetX = centerX + Math.cos(angle) * (radius * 0.8);
          const targetY = centerY + Math.sin(angle) * (radius * 0.8);
          
          fork.position.x += (targetX - fork.position.x) * 0.02;
          fork.position.y += (targetY - fork.position.y) * 0.02;
        }
      });
    }
  }

  // Debug log helper
  private log(message: string): void {
    if (DEBUG_ENABLED) {
      console.log(`[VisualizationService] ${message}`);
    }
  }
}

// Create a singleton instance
export const visualizationService = new VisualizationService(); 