package com.threadviz.core;

import com.threadviz.models.ThreadEvent;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * Event bus for distributing thread events from simulations to visualizers.
 * Uses a single dispatcher thread to ensure ordered event delivery.
 */
public class EventBus {
    private static EventBus instance;
    
    // Thread-safe event queue
    private final BlockingQueue<ThreadEvent> eventQueue;
    
    // Thread-safe list of event listeners
    private final List<EventListener> listeners;
    
    // For recording event history
    private final List<ThreadEvent> eventHistory;
    
    private Thread dispatchThread;
    private volatile boolean running;
    
    private EventBus() {
        this.eventQueue = new LinkedBlockingQueue<>();
        this.listeners = new CopyOnWriteArrayList<>();
        this.eventHistory = new ArrayList<>();
        startDispatcher();
    }
    
    public static synchronized EventBus getInstance() {
        if (instance == null) {
            instance = new EventBus();
        }
        return instance;
    }
    
    public void publishEvent(ThreadEvent event) {
        try {
            eventQueue.put(event);
            synchronized (eventHistory) {
                eventHistory.add(event);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public void addEventListener(EventListener listener) {
        listeners.add(listener);
    }
    
    public void removeEventListener(EventListener listener) {
        listeners.remove(listener);
    }
    
    public List<ThreadEvent> getEventHistory() {
        synchronized (eventHistory) {
            return new ArrayList<>(eventHistory);
        }
    }
    
    public void clearHistory() {
        synchronized (eventHistory) {
            eventHistory.clear();
        }
    }
    
    private void startDispatcher() {
        running = true;
        dispatchThread = new Thread(() -> {
            while (running) {
                try {
                    ThreadEvent event = eventQueue.take();
                    dispatchEvent(event);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    running = false;
                }
            }
        });
        dispatchThread.setDaemon(true);
        dispatchThread.setName("EventBus-Dispatcher");
        dispatchThread.start();
    }
    
    private void dispatchEvent(ThreadEvent event) {
        for (EventListener listener : listeners) {
            try {
                listener.onEvent(event);
            } catch (Exception e) {
                System.err.println("Error dispatching event to listener: " + e.getMessage());
            }
        }
    }
    
    public void shutdown() {
        running = false;
        dispatchThread.interrupt();
    }
    
    /**
     * Interface for event listeners
     */
    public interface EventListener {
        void onEvent(ThreadEvent event);
    }
} 