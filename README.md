# ThreadViz

A Java-based concurrency visualization tool for understanding multithreading behavior and operating system principles.

## Overview

ThreadViz is an interactive simulator and visualizer that bridges the conceptual gap between code and visualization for concurrency patterns. Built with Java and JavaFX, it offers real-time visualization of thread states, interactions, and synchronization in common concurrency scenarios. This project serves as both an educational tool and a personal exploration of the foundational concepts needed for operating system development.

## Features

- **Interactive Simulations**: Run and visualize classic concurrency patterns like Producer-Consumer, Dining Philosophers, and Reader-Writer locks
- **Real-time Visualization**: See threads in action with color-coded states and dynamic positioning
- **Event Logging**: Track thread state changes with a detailed event log 
- **Configurable Parameters**: Adjust simulation parameters like thread count, execution delays, and buffer sizes
- **Playback Controls**: Pause, resume, and restart simulations to explore specific scenarios

## Implemented Simulations

1. **Producer-Consumer**: Demonstrates multiple producers adding items to a bounded buffer while consumers remove them
2. **Dining Philosophers**: Shows the classic deadlock-prone scenario of philosophers sharing limited resources
3. **Reader-Writer**: Visualizes concurrent read access with exclusive write access to a shared resource

**Note**: Additional key simulations such as Barriers, Sleeping Barber, and Memory Management visualizations are currently under development and will be added in future updates.

## Building and Running

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

### Building the Application

```bash
mvn clean package
```

### Running the Application

```bash
mvn javafx:run
```

Or run the packaged JAR:

```bash
java -jar target/threadviz-1.0-SNAPSHOT.jar
```

## Project Structure

- `core/`: Core components including event bus and simulation abstractions
- `models/`: Data models for thread events and visualizations
- `simulations/`: Implementations of various concurrency simulations
- `ui/`: JavaFX-based user interface components

## Technical Implementation

ThreadViz leverages Java's concurrency APIs to implement realistic threading scenarios:

- `Thread`, `Runnable`, and `ExecutorService` for thread management
- Synchronized blocks, `Semaphore`, and `Lock` for concurrency control
- `BlockingQueue` for thread-safe data structures
- JavaFX for the reactive UI and animations

The project is structured with a clean separation between the simulation logic (which runs on background threads) and the visualization (which runs on the JavaFX UI thread), using an event-based architecture to communicate between them.

## Purpose and Future Plans

This project serves as a stepping stone in my journey to build an operating system from the ground up. By visualizing and implementing core concurrency primitives, I'm developing a deeper understanding of:

- Thread scheduling and management
- Resource allocation and synchronization
- Deadlock detection and prevention
- Memory management techniques

Details about my upcoming OS development project will be announced soon, including its architecture, planned features, and educational goals.

## Future Enhancements

- Additional concurrency patterns (e.g., Barrier, CountDownLatch)
- Deadlock detection and visualization
- Memory allocation and paging visualizations
- Recording and playback of simulation runs
- Web-based visualization frontend

## License

MIT License

## Acknowledgments

This project is designed as an educational tool for understanding concurrent programming concepts and operating system fundamentals. 