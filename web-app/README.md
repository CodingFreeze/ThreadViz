# ThreadViz Web Application

This is the web-based version of ThreadViz, an interactive concurrency visualization tool for understanding multithreading behavior and operating system principles.

## Overview

ThreadViz Web provides an accessible, browser-based platform for visualizing and exploring thread synchronization concepts. This tool is designed to make complex concurrency patterns more intuitive through interactive visualizations that demonstrate how threads interact, compete for resources, and coordinate their execution.

## Features

- **Interactive Simulations**: Run and visualize classic concurrency patterns like Producer-Consumer, Dining Philosophers, and Reader-Writer locks
- **Real-time Visualization**: See threads in action with color-coded states and dynamic positioning
- **Event Logging**: Track thread state changes with a detailed event log 
- **Configurable Parameters**: Adjust simulation parameters like thread count, execution delays, and buffer sizes
- **Playback Controls**: Pause, resume, and restart simulations to explore specific scenarios

## Development Status

This project is under active development by a college student passionate about operating systems and concurrent programming. While the core functionality is implemented, we acknowledge there are several known issues:

- Visualization may occasionally show unpredictable behavior with node positioning
- The timeline and step counting need further refinement
- Some UI elements may not render consistently across all browsers
- Performance can degrade with very large thread counts

We're continuously working to improve these aspects and add new features. Your patience and feedback are appreciated as we enhance the application.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Build for production:

```bash
npm run build
```

## Technology Stack

- **React**: Frontend user interface
- **TypeScript**: Type-safe JavaScript
- **D3.js**: Advanced visualization capabilities
- **Styled Components**: Component-based styling

## Project Structure

- `src/components/`: React UI components
- `src/models/`: TypeScript interfaces and types
- `src/services/`: Services for simulation logic
- `src/hooks/`: Custom React hooks
- `src/pages/`: Page-level components

## Main Components

- **SimulationCanvas**: Visualizes threads, resources, and their interactions
- **ThreadNode**: Represents a thread with its state and relationships
- **ResourceNode**: Represents shared resources like locks and buffers
- **ConnectionLine**: Shows relationships between threads and resources
- **EventLog**: Displays a chronological log of simulation events
- **SimulationControls**: Provides playback control and configuration options

## Purpose and Educational Goals

This project is part of a larger educational journey toward building an operating system from the ground up. By creating visualizations of core concurrency concepts, I'm building a foundation of knowledge in:

- Thread scheduling algorithms
- Resource allocation strategies
- Synchronization primitives
- Deadlock detection and prevention

The insights gained from developing and refining these visualizations will directly inform the design and implementation of my upcoming OS development project, details of which will be announced soon.

## Future Enhancements

- Additional concurrency patterns and algorithms
- More detailed step-by-step execution mode
- Memory allocation and virtual memory visualizations
- Performance statistics and analytics
- Improved UI/UX and responsive design

## License

MIT License
