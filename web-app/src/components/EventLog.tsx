import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SimulationEvent, SimulationState } from '../models/Simulation';

interface EventLogProps {
  events: SimulationEvent[];
  simulationState?: SimulationState;
}

const LogContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fafafa;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  height: 44px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const LogContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px;
  position: absolute;
  top: 44px; /* Height of the header */
  left: 0;
  right: 0;
  bottom: 0;
  scrollbar-width: thin;
  
  /* Webkit scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
`;

const EventItem = styled.div<{ eventType: string }>`
  margin-bottom: 12px;
  padding: 10px 10px 10px 14px;
  border-radius: 6px;
  width: calc(100% - 10px);
  box-sizing: border-box;
  background-color: ${props => {
    switch(props.eventType) {
      case 'THREAD_STARTED':
      case 'THREAD_RESUMED':
        return '#e8f5e9'; // Light green
      case 'THREAD_WAITING':
        return '#fff8e1'; // Light yellow
      case 'THREAD_BLOCKED':
        return '#ffebee'; // Light red
      case 'THREAD_TERMINATED':
        return '#f5f5f5'; // Light gray
      case 'RESOURCE_ACQUIRED':
        return '#e0f7fa'; // Light cyan
      case 'RESOURCE_RELEASED':
        return '#e3f2fd'; // Light blue
      case 'BUFFER_ITEM_ADDED':
        return '#e8eaf6'; // Light indigo
      case 'BUFFER_ITEM_REMOVED':
        return '#f3e5f5'; // Light purple
      default:
        return 'white';
    }
  }};
  border-left: 4px solid ${props => {
    switch(props.eventType) {
      case 'THREAD_STARTED':
      case 'THREAD_RESUMED':
        return '#4CAF50'; // Green
      case 'THREAD_WAITING':
        return '#FFC107'; // Yellow
      case 'THREAD_BLOCKED':
        return '#F44336'; // Red
      case 'THREAD_TERMINATED':
        return '#9E9E9E'; // Gray
      case 'RESOURCE_ACQUIRED':
        return '#00BCD4'; // Cyan
      case 'RESOURCE_RELEASED':
        return '#2196F3'; // Blue
      case 'BUFFER_ITEM_ADDED':
        return '#3F51B5'; // Indigo
      case 'BUFFER_ITEM_REMOVED':
        return '#9C27B0'; // Purple
      default:
        return '#ddd';
    }
  }};
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  transition: transform 0.1s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 70px; /* Add minimum height to ensure room for all elements */
  
  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    z-index: 5;
  }
  
  &:last-child {
    margin-bottom: 10px;
  }
`;

const EventTime = styled.div`
  font-size: 12px;
  color: #777;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StepIndicator = styled.span`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  color: #555;
  font-weight: 500;
`;

const EventDescription = styled.div`
  word-break: break-word;
  padding-right: 120px; /* Increased from 80px to allow more space for badge */
  margin-top: 4px;
  position: relative;
  z-index: 1;
`;

const EventType = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 5px;
  border-radius: 10px;
  color: #555;
  max-width: 110px; /* Increased from 100px */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 2;
  text-align: right;
`;

const ClearButton = styled.button`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#e0e0e0' : '#f5f5f5'};
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const EmptyLog = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-style: italic;
`;

const EventAutoscrollContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AutoscrollToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #666;
  cursor: pointer;
`;

const AutoscrollCheckbox = styled.input`
  cursor: pointer;
`;

// Add new component for expanded event details
const ExpandedEventDetails = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
  border-left: 3px solid #ccc;
  position: relative;
  z-index: 3;
`;

const EventLog: React.FC<EventLogProps> = ({ events, simulationState }) => {
  const [filters, setFilters] = useState<Record<string, boolean>>({
    'THREAD': true,
    'RESOURCE': true,
    'BUFFER': true
  });
  
  const [filteredEvents, setFilteredEvents] = useState<SimulationEvent[]>(events);
  const [localEvents, setLocalEvents] = useState<SimulationEvent[]>(events);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContentRef = useRef<HTMLDivElement>(null);
  
  // Add state for expanded events
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Update local events when parent events change
    setLocalEvents(events);
    
    // Apply filters
    const filtered = events.filter(event => {
      if (event.type.includes('THREAD') && filters['THREAD']) return true;
      if (event.type.includes('RESOURCE') && filters['RESOURCE']) return true;
      if (event.type.includes('BUFFER') && filters['BUFFER']) return true;
      return false;
    });
    
    setFilteredEvents(filtered);
    
    // Auto-scroll to bottom when new events arrive if autoScroll is enabled
    if (autoScroll && logContentRef.current) {
      logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
    }
  }, [events, filters, autoScroll]);
  
  const toggleFilter = (filterType: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };
  
  const toggleAutoScroll = () => {
    setAutoScroll(prev => !prev);
  };
  
  const clearLog = () => {
    setLocalEvents([]);
    setFilteredEvents([]);
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };
  
  const getEventTypeLabel = (eventType: string) => {
    return eventType.replace(/_/g, ' ');
  };
  
  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };
  
  // Generate detailed explanation for an event
  const getDetailedExplanation = (event: SimulationEvent): string => {
    if (!simulationState) return '';
    
    const thread = event.threadId ? 
      simulationState.threads.find(t => t.id === event.threadId) : null;
      
    const resource = event.resourceId ?
      simulationState.resources.find(r => r.id === event.resourceId) : null;
    
    let detailedExplanation = '';
    
    switch (event.type) {
      case "THREAD_STARTED":
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) has been initialized and started execution. It will now begin processing its assigned tasks.`;
        break;
      case "THREAD_TERMINATED":
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) has completed all its tasks and terminated. No further operations will be performed by this thread.`;
        break;
      case "THREAD_BLOCKED":
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) is blocked because it's waiting to acquire a resource that is currently held by another thread. It cannot proceed until the resource becomes available.`;
        break;
      case "THREAD_WAITING":
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) has voluntarily entered a waiting state. It may be sleeping or waiting for a specific condition to be satisfied.`;
        break;
      case "THREAD_RESUMED":
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) has awakened from waiting/blocked state and resumed execution. It can now continue processing tasks.`;
        break;
      case "RESOURCE_ACQUIRED":
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) has successfully acquired resource "${resource?.name}" (ID: ${resource?.id}). It now has exclusive access to this resource.`;
        
        // Check resource type in a more generic way
        const resourceTypeName = resource?.type?.toString() || '';
        if (resourceTypeName.includes('LOCK') || resourceTypeName.includes('MUTEX')) {
          detailedExplanation += ' This provides mutual exclusion, ensuring no other thread can access shared data simultaneously.';
        } else if (resourceTypeName.includes('SEMAPHORE')) {
          detailedExplanation += ` The semaphore count has been decremented to ${resource?.currentValue || 0}.`;
        }
        break;
      case "RESOURCE_RELEASED":
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) has released resource "${resource?.name}" (ID: ${resource?.id}). Other threads waiting for this resource can now potentially acquire it.`;
        
        // Check resource type in a more generic way
        const resourceTypeStr = resource?.type?.toString() || '';
        if (resourceTypeStr.includes('SEMAPHORE')) {
          detailedExplanation += ` The semaphore count has been incremented to ${resource?.currentValue || 0}.`;
        }
        break;
      case "BUFFER_ITEM_ADDED":
        const bufferAddItem = simulationState.resources.find(r => r.type === 'BUFFER');
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) has added an item to the buffer.`;
        
        if (bufferAddItem) {
          detailedExplanation += ` The buffer now contains ${bufferAddItem.currentValue || 0} out of ${bufferAddItem.capacity || 0} items (${Math.round((bufferAddItem.currentValue || 0) / (bufferAddItem.capacity || 1) * 100)}% full).`;
        }
        break;
      case "BUFFER_ITEM_REMOVED":
        const bufferRemoveItem = simulationState.resources.find(r => r.type === 'BUFFER');
        detailedExplanation = `Thread "${thread?.name}" (ID: ${thread?.id}) has removed an item from the buffer.`;
        
        if (bufferRemoveItem) {
          detailedExplanation += ` The buffer now contains ${bufferRemoveItem.currentValue || 0} out of ${bufferRemoveItem.capacity || 0} items (${Math.round((bufferRemoveItem.currentValue || 0) / (bufferRemoveItem.capacity || 1) * 100)}% full).`;
        }
        break;
      default:
        detailedExplanation = event.description || "Event details not available.";
    }
    
    // Add contextual information based on simulation type
    if (simulationState.type === 'PRODUCER_CONSUMER') {
      if (thread?.name?.includes('Producer') && event.type === 'THREAD_BLOCKED') {
        detailedExplanation += ' This producer is blocked because the buffer is full.';
      } else if (thread?.name?.includes('Consumer') && event.type === 'THREAD_BLOCKED') {
        detailedExplanation += ' This consumer is blocked because the buffer is empty.';
      }
    } else if (simulationState.type === 'DINING_PHILOSOPHERS') {
      if (event.type === 'RESOURCE_ACQUIRED' && resource?.name?.includes('Fork')) {
        detailedExplanation += ' The philosopher needs to acquire two forks to eat.';
      } else if (event.type === 'THREAD_BLOCKED' && thread?.name?.includes('Philosopher')) {
        detailedExplanation += ' This philosopher is waiting to acquire a fork that is currently being used by another philosopher.';
      }
    }
    
    return detailedExplanation;
  };
  
  return (
    <LogContainer>
      <LogHeader>
        <FilterContainer>
          <FilterButton 
            active={filters['THREAD']}
            onClick={() => toggleFilter('THREAD')}
          >
            Threads
          </FilterButton>
          <FilterButton 
            active={filters['RESOURCE']}
            onClick={() => toggleFilter('RESOURCE')}
          >
            Resources
          </FilterButton>
          <FilterButton 
            active={filters['BUFFER']}
            onClick={() => toggleFilter('BUFFER')}
          >
            Buffer
          </FilterButton>
        </FilterContainer>
        
        <EventAutoscrollContainer>
          <AutoscrollToggle>
            <AutoscrollCheckbox 
              type="checkbox" 
              checked={autoScroll}
              onChange={toggleAutoScroll}
            />
            Auto-scroll
          </AutoscrollToggle>
          <ClearButton onClick={clearLog}>Clear Log</ClearButton>
        </EventAutoscrollContainer>
      </LogHeader>
      
      <LogContent ref={logContentRef}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <EventItem 
              key={event.id} 
              eventType={event.type}
              onClick={() => toggleEventExpansion(event.id)}
              style={{ cursor: 'pointer' }}
            >
              <EventTime>
                <span>{formatTime(event.time)}</span>
                <StepIndicator>Event {index + 1}</StepIndicator>
              </EventTime>
              <EventDescription>{event.description}</EventDescription>
              {expandedEvents[event.id] && simulationState && (
                <ExpandedEventDetails>
                  {getDetailedExplanation(event)}
                </ExpandedEventDetails>
              )}
              <EventType>{getEventTypeLabel(event.type)}</EventType>
            </EventItem>
          ))
        ) : (
          <EmptyLog>No events to display</EmptyLog>
        )}
      </LogContent>
    </LogContainer>
  );
};

export default EventLog; 