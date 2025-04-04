package com.threadviz.core;

import com.threadviz.models.ThreadEvent;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Base class for all thread simulations. Handles common functionality like
 * starting, stopping, and publishing events.
 */
public abstract class Simulation {
    protected final String name;
    protected final EventBus eventBus;
    protected ExecutorService executor;
    protected final AtomicBoolean running;
    protected final AtomicBoolean paused;
    
    public Simulation(String name) {
        this.name = name;
        this.eventBus = EventBus.getInstance();
        this.running = new AtomicBoolean(false);
        this.paused = new AtomicBoolean(false);
    }
    
    /**
     * Start the simulation with the default number of threads
     */
    public void start() {
        if (running.compareAndSet(false, true)) {
            eventBus.clearHistory();
            executor = createExecutorService();
            startSimulation();
        }
    }
    
    /**
     * Pause the simulation
     */
    public void pause() {
        paused.set(true);
        publishEvent(ThreadEvent.EventType.EXECUTION, "Simulation paused", "");
    }
    
    /**
     * Resume a paused simulation
     */
    public void resume() {
        paused.set(false);
        publishEvent(ThreadEvent.EventType.EXECUTION, "Simulation resumed", "");
    }
    
    /**
     * Stop the simulation and clean up resources
     */
    public void stop() {
        if (running.compareAndSet(true, false)) {
            try {
                executor.shutdownNow();
                executor.awaitTermination(2, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                publishEvent(ThreadEvent.EventType.EXECUTION, "Simulation stopped", "");
            }
        }
    }
    
    /**
     * Publish a thread event to the event bus
     */
    protected void publishEvent(ThreadEvent.EventType type, String message, String resourceId) {
        String threadName = Thread.currentThread().getName();
        ThreadEvent event = new ThreadEvent(threadName, type, resourceId, message);
        eventBus.publishEvent(event);
    }
    
    /**
     * Returns the current speed factor to adjust simulation speed.
     * A factor of 2.0 would mean the simulation runs at half speed (twice the delay).
     * Default implementation returns 2.0 to slow simulations by 50%.
     */
    protected double getSpeedFactor() {
        return 2.0; // Slow down by 50% (2x slower)
    }
    
    /**
     * Helper method to simulate thread execution delay
     */
    protected void simulateWork(long milliseconds) {
        try {
            // Apply the speed factor to the milliseconds
            long adjustedTime = (long)(milliseconds * getSpeedFactor());
            Thread.sleep(adjustedTime);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    /**
     * Check if the simulation is currently paused
     */
    protected void checkPaused() {
        while (paused.get() && running.get()) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
    
    /**
     * Create the executor service for the simulation
     */
    protected ExecutorService createExecutorService() {
        return Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r);
            t.setDaemon(true);
            return t;
        });
    }
    
    /**
     * Implementation-specific simulation logic
     */
    protected abstract void startSimulation();
    
    /**
     * Get the name of the simulation
     */
    public String getName() {
        return name;
    }
    
    /**
     * Is the simulation currently running
     */
    public boolean isRunning() {
        return running.get();
    }
    
    /**
     * Is the simulation currently paused
     */
    public boolean isPaused() {
        return paused.get();
    }
} 