import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { SimulationType } from '../models/Simulation';
import { Thread, ThreadState } from '../models/Thread';
import { Resource, ResourceState } from '../models/Resource';

interface SimulationCanvasProps {
  simulationId: string;
  simulationType: SimulationType;
  threads: Thread[];
  resources: Resource[];
  isRunning: boolean;
  isPaused: boolean;
  stepCount: number;
}

// Styled components
const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 600px;
  background-color: #f8f9fa;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const CanvasHeader = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const StatusBadge = styled.span<{ status: 'running' | 'paused' | 'stopped' | 'completed' }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'running': return '#e8f5e9';
      case 'paused': return '#fff3e0';
      case 'stopped': return '#ffebee';
      case 'completed': return '#e3f2fd';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'running': return '#2e7d32';
      case 'paused': return '#e65100';
      case 'stopped': return '#c62828';
      case 'completed': return '#1565c0';
      default: return '#616161';
    }
  }};
`;

const SVGContainer = styled.div`
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f5f9ff;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: center center;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 24px;
  border-top: 1px solid #eaeaea;
  background-color: white;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #616161;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.color};
`;

// Main component
const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  simulationId,
  simulationType,
  threads,
  resources,
  isRunning,
  isPaused,
  stepCount
}) => {
  const [initialized, setInitialized] = useState(false);
  const [prevSimType, setPrevSimType] = useState<SimulationType | null>(null);
  const [prevSimId, setPrevSimId] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulation = useRef<d3.Simulation<any, any> | null>(null);
  
  // Define drag functions outside the useEffect block
  const dragstarted = (event: any, d: any) => {
    if (!event.active) simulation.current?.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };
  
  const dragged = (event: any, d: any) => {
    d.fx = event.x;
    d.fy = event.y;
  };
  
  const dragended = (event: any, d: any) => {
    if (!event.active) simulation.current?.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  };
  
  const getSimulationDisplayName = (type: SimulationType) => {
    switch (type) {
      case 'PRODUCER_CONSUMER': return 'Producer-Consumer';
      case 'DINING_PHILOSOPHERS': return 'Dining Philosophers';
      case 'READER_WRITER': return 'Reader-Writer';
      case 'BARRIER': return 'Barrier';
      case 'SLEEPING_BARBER': return 'Sleeping Barber';
      case 'CIGARETTE_SMOKERS': return 'Cigarette Smokers';
      default: return 'Thread Simulation';
    }
  };

  const getSimulationStatus = () => {
    if (isRunning && !isPaused) return 'running';
    if (isPaused) return 'paused';
    // Check if all threads are terminated
    const allTerminated = threads.every(t => t.state === 'TERMINATED');
    if (allTerminated && stepCount > 0) return 'completed';
    return 'stopped';
  };

  // Initialize the canvas dimensions and setup resize listener
  useEffect(() => {
    const resizeCanvas = () => {
      if (!containerRef.current || !svgRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);
        
      if (simulation.current) {
        simulation.current.force('center', d3.forceCenter(width / 2, height / 2));
        simulation.current.alpha(0.3).restart();
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Create force simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    // Check if we need to reinitialize (new simulation or changed type)
    const needsReset = 
      !initialized || 
      simulationId !== prevSimId || 
      simulationType !== prevSimType;
      
    if (needsReset) {
      // Store current values for future comparison
      setPrevSimId(simulationId);
      setPrevSimType(simulationType);
      
      // Clear previous simulation if it exists
      if (simulation.current) {
        simulation.current.stop();
        d3.select(svgRef.current).selectAll('*').remove();
      }
      
      // Exit early if we don't have valid data
      if (!threads.length && !resources.length) {
        console.warn('No threads or resources to visualize');
        return;
      }
      
      // Get dimensions
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      // Initialize SVG
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);
        
      // Create nodes and links
      const nodes: any[] = [];
      const links: any[] = [];
      
      // Add resource nodes
      resources.forEach(resource => {
        nodes.push({
          id: resource.id,
          name: resource.name || `Resource ${resource.id}`,
          type: 'resource',
          state: resource.state,
          x: Math.random() * width,
          y: Math.random() * height,
          resource
        });
      });
      
      // Add thread nodes
      threads.forEach(thread => {
        nodes.push({
          id: thread.id,
          name: thread.name || `Thread ${thread.id}`,
          type: 'thread',
          state: thread.state,
          x: Math.random() * width,
          y: Math.random() * height,
          thread
        });
        
        // Create links between threads and their resources
        if (thread.resources && thread.resources.length > 0) {
          thread.resources.forEach((resourceId: string) => {
            links.push({
              source: thread.id,
              target: resourceId,
              value: 1
            });
          });
        }
      });
      
      // Create the simulation
      simulation.current = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide().radius(50))
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05));
        
      // Create links
      const link = svg.append('g')
        .attr('stroke', '#4a90e2')
        .attr('stroke-opacity', 0.8)
        .attr('stroke-dasharray', '5,5')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', (d) => Math.sqrt(d.value) * 2);
        
      // Create node groups
      const node = svg.append('g')
        .selectAll('.node')
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .call((selection: any) => {
          // Use a function wrapper to work around TypeScript compatibility issue
          d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)(selection);
        });
        
      // Add circles for nodes
      node.append('circle')
        .attr('r', d => d.type === 'thread' ? 20 : 15)
        .attr('fill', d => getNodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
      
      // Add text labels
      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .attr('fill', '#fff')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text(d => {
          if (d.type === 'thread') {
            // For threads, show "T" + thread number or name if available
            const threadName = d.name || '';
            const match = threadName.match(/Thread\s*(\d+)/i);
            if (match && match[1]) {
              return `T${match[1]}`;
            } else {
              return 'T' + d.id.slice(-2);
            }
          } else {
            // For resources, show resource type prefix + number or short name
            const resourceType = d.resource.type || 'R';
            const prefix = resourceType.charAt(0);
            if (d.name && d.name.includes(' ')) {
              return prefix + d.name.split(' ')[1];
            } else if (d.resource.name) {
              return prefix + d.resource.name.slice(0, 3);
            } else {
              return prefix + d.id.slice(-2);
            }
          }
        });
      
      // Add tooltips
      node.append('title')
        .text(d => `${d.name}\nState: ${d.state}`);
      
      // Update function for simulation ticks
      simulation.current.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
          
        node
          .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });
      
      setInitialized(true);
    }
  }, [simulationId, simulationType, initialized, prevSimId, prevSimType]);
  
  // Update nodes when thread/resource states change
  useEffect(() => {
    if (!svgRef.current || !simulation.current || !initialized) return;
    
    const svg = d3.select(svgRef.current);
    
    // Update thread nodes
    threads.forEach(thread => {
      svg.selectAll('.node')
        .filter((d: any) => d.id === thread.id)
        .select('circle')
        .attr('fill', (d: any) => {
          d.state = thread.state;
          return getNodeColor(d);
        })
        .select('title')
        .text(`${thread.name || `Thread ${thread.id}`}\nState: ${thread.state}`);
    });
    
    // Update resource nodes
    resources.forEach(resource => {
      svg.selectAll('.node')
        .filter((d: any) => d.id === resource.id)
        .select('circle')
        .attr('fill', (d: any) => {
          d.state = resource.state;
          return getNodeColor(d);
        })
        .select('title')
        .text(`${resource.name || `Resource ${resource.id}`}\nState: ${resource.state}`);
    });
    
    // Update links
    const links: any[] = [];
    threads.forEach(thread => {
      if (thread.resources && thread.resources.length > 0) {
        thread.resources.forEach((resourceId: string) => {
          links.push({
            source: thread.id,
            target: resourceId,
            value: 1
          });
        });
      }
    });
    
    // Remove all existing links and recreate them
    svg.selectAll('line').remove();
    
    svg.append('g')
      .attr('stroke', '#4a90e2')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-dasharray', '5,5')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value) * 2)
      .attr('x1', (d: any) => {
        const source = simulation.current?.nodes().find(n => n.id === d.source);
        return source ? source.x : 0;
      })
      .attr('y1', (d: any) => {
        const source = simulation.current?.nodes().find(n => n.id === d.source);
        return source ? source.y : 0;
      })
      .attr('x2', (d: any) => {
        const target = simulation.current?.nodes().find(n => n.id === d.target);
        return target ? target.x : 0;
      })
      .attr('y2', (d: any) => {
        const target = simulation.current?.nodes().find(n => n.id === d.target);
        return target ? target.y : 0;
      });
      
    // Restart simulation with a small alpha value to adjust positions
    simulation.current.alpha(0.1).restart();
  }, [threads, resources, initialized]);
  
  // Helper function to determine node color based on state
  const getNodeColor = (node: any) => {
    if (node.type === 'thread') {
      switch (node.state as ThreadState) {
        case 'READY': return '#4CAF50';
        case 'RUNNING': return '#2196F3';
        case 'BLOCKED': return '#FFC107';
        case 'WAITING': return '#FF9800';
        case 'TERMINATED': return '#9E9E9E';
        default: return '#9C27B0';
      }
    } else {
      switch (node.state as ResourceState) {
        case 'FREE': return '#66BB6A';
        case 'BUSY': return '#EF5350';
        case 'LOCKED': return '#E53935';
        default: return '#7E57C2';
      }
    }
  };
  
  useEffect(() => {
    // Ensure nodes stay within boundaries when their positions change
    if (containerRef.current) {
      const canvas = containerRef.current;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const marginX = 50; // Safety margin from edges
      const marginY = 50;
      
      // Apply constraints to thread positions
      if (threads) {
        threads.forEach(thread => {
          if (thread.position) {
            // Keep threads within boundaries
            thread.position.x = Math.max(marginX, Math.min(width - marginX, thread.position.x));
            thread.position.y = Math.max(marginY, Math.min(height - marginY, thread.position.y));
            
            // Make sure target positions are also constrained
            if (thread.targetPosition) {
              thread.targetPosition.x = Math.max(marginX, Math.min(width - marginX, thread.targetPosition.x));
              thread.targetPosition.y = Math.max(marginY, Math.min(height - marginY, thread.targetPosition.y));
            }
          }
        });
      }
      
      // Apply constraints to resource positions
      if (resources) {
        resources.forEach(resource => {
          if (resource.position) {
            // Keep resources within boundaries
            resource.position.x = Math.max(marginX, Math.min(width - marginX, resource.position.x));
            resource.position.y = Math.max(marginY, Math.min(height - marginY, resource.position.y));
            
            // Make sure target positions are also constrained
            if (resource.targetPosition) {
              resource.targetPosition.x = Math.max(marginX, Math.min(width - marginX, resource.targetPosition.x));
              resource.targetPosition.y = Math.max(marginY, Math.min(height - marginY, resource.targetPosition.y));
            }
          }
        });
      }
    }
  }, [threads, resources]);
  
  return (
    <CanvasContainer>
      <CanvasHeader>
        <Title>{getSimulationDisplayName(simulationType)}</Title>
        <StatusBadge status={getSimulationStatus()}>
          {getSimulationStatus() === 'running' && 'Running'}
          {getSimulationStatus() === 'paused' && 'Paused'}
          {getSimulationStatus() === 'stopped' && 'Stopped'}
          {getSimulationStatus() === 'completed' && 'Completed'}
        </StatusBadge>
      </CanvasHeader>
      
      <SVGContainer ref={containerRef}>
        <svg ref={svgRef}></svg>
      </SVGContainer>
      
      <Legend>
        <LegendItem>
          <LegendColor color="#4CAF50" />
          <span>Ready</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#2196F3" />
          <span>Running</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#FFC107" />
          <span>Blocked</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#FF9800" />
          <span>Waiting</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#9E9E9E" />
          <span>Terminated</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#66BB6A" />
          <span>Resource Free</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#EF5350" />
          <span>Resource Busy</span>
        </LegendItem>
      </Legend>
    </CanvasContainer>
  );
};

export default SimulationCanvas; 