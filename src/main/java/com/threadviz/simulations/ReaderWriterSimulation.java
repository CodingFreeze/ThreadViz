package com.threadviz.simulations;

import com.threadviz.core.Simulation;
import com.threadviz.models.ThreadEvent;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Implementation of the Reader-Writer concurrency pattern.
 * Multiple reader threads can access a shared resource simultaneously,
 * but writers need exclusive access.
 */
public class ReaderWriterSimulation extends Simulation {
    private int numReaders;
    private int numWriters;
    private int readTime; // milliseconds
    private int writeTime; // milliseconds
    private boolean writerPriority;
    
    private final ReadWriteLock rwLock;
    private final AtomicInteger activeReaders;
    private final AtomicInteger activeWriters;
    private final AtomicInteger totalReads;
    private final AtomicInteger totalWrites;
    
    public ReaderWriterSimulation() {
        super("Reader-Writer");
        this.numReaders = 3;
        this.numWriters = 2;
        this.readTime = 1000;
        this.writeTime = 2000;
        this.writerPriority = false;
        
        this.rwLock = new ReentrantReadWriteLock(writerPriority);
        this.activeReaders = new AtomicInteger(0);
        this.activeWriters = new AtomicInteger(0);
        this.totalReads = new AtomicInteger(0);
        this.totalWrites = new AtomicInteger(0);
    }
    
    @Override
    protected void startSimulation() {
        // Start reader threads
        for (int i = 0; i < numReaders; i++) {
            final int readerId = i;
            executor.submit(() -> runReader(readerId));
        }
        
        // Start writer threads
        for (int i = 0; i < numWriters; i++) {
            final int writerId = i;
            executor.submit(() -> runWriter(writerId));
        }
    }
    
    private void runReader(int id) {
        Thread.currentThread().setName("Reader-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_CREATED, "Reader created", "reader-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_STARTED, "Reader started", "reader-" + id);
        
        try {
            while (running.get()) {
                checkPaused();
                
                // Try to acquire read lock
                publishEvent(ThreadEvent.EventType.LOCK_WAITING, 
                        "Waiting for read access", 
                        "resource");
                
                rwLock.readLock().lock();
                try {
                    // Critical section - reading
                    int readerCount = activeReaders.incrementAndGet();
                    publishEvent(ThreadEvent.EventType.LOCK_ACQUIRED, 
                            "Acquired read lock (active readers: " + readerCount + ")", 
                            "resource");
                    
                    // Read the resource
                    publishEvent(ThreadEvent.EventType.EXECUTION, 
                            "Reading resource", 
                            "reader-" + id);
                    simulateWork(readTime);
                    
                    totalReads.incrementAndGet();
                } finally {
                    int readerCount = activeReaders.decrementAndGet();
                    publishEvent(ThreadEvent.EventType.LOCK_RELEASED, 
                            "Released read lock (active readers: " + readerCount + ")", 
                            "resource");
                    rwLock.readLock().unlock();
                }
                
                // Wait a bit before reading again
                simulateWork(500);
            }
        } finally {
            publishEvent(ThreadEvent.EventType.THREAD_TERMINATED, "Reader terminated", "reader-" + id);
        }
    }
    
    private void runWriter(int id) {
        Thread.currentThread().setName("Writer-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_CREATED, "Writer created", "writer-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_STARTED, "Writer started", "writer-" + id);
        
        try {
            while (running.get()) {
                checkPaused();
                
                // Try to acquire write lock
                publishEvent(ThreadEvent.EventType.LOCK_WAITING, 
                        "Waiting for write access", 
                        "resource");
                
                rwLock.writeLock().lock();
                try {
                    // Critical section - writing
                    int writerCount = activeWriters.incrementAndGet();
                    publishEvent(ThreadEvent.EventType.LOCK_ACQUIRED, 
                            "Acquired write lock (exclusive access)", 
                            "resource");
                    
                    // Write to the resource
                    publishEvent(ThreadEvent.EventType.EXECUTION, 
                            "Writing to resource", 
                            "writer-" + id);
                    simulateWork(writeTime);
                    
                    totalWrites.incrementAndGet();
                } finally {
                    activeWriters.decrementAndGet();
                    publishEvent(ThreadEvent.EventType.LOCK_RELEASED, 
                            "Released write lock", 
                            "resource");
                    rwLock.writeLock().unlock();
                }
                
                // Wait a bit before writing again
                simulateWork(1000);
            }
        } finally {
            publishEvent(ThreadEvent.EventType.THREAD_TERMINATED, "Writer terminated", "writer-" + id);
        }
    }
    
    // Getters and setters for simulation parameters
    
    public int getNumReaders() {
        return numReaders;
    }
    
    public void setNumReaders(int numReaders) {
        this.numReaders = numReaders;
    }
    
    public int getNumWriters() {
        return numWriters;
    }
    
    public void setNumWriters(int numWriters) {
        this.numWriters = numWriters;
    }
    
    public int getReadTime() {
        return readTime;
    }
    
    public void setReadTime(int readTime) {
        this.readTime = readTime;
    }
    
    public int getWriteTime() {
        return writeTime;
    }
    
    public void setWriteTime(int writeTime) {
        this.writeTime = writeTime;
    }
    
    public boolean isWriterPriority() {
        return writerPriority;
    }
    
    public void setWriterPriority(boolean writerPriority) {
        this.writerPriority = writerPriority;
    }
    
    public int getActiveReaders() {
        return activeReaders.get();
    }
    
    public int getActiveWriters() {
        return activeWriters.get();
    }
    
    public int getTotalReads() {
        return totalReads.get();
    }
    
    public int getTotalWrites() {
        return totalWrites.get();
    }
} 