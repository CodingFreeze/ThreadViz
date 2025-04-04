package com.threadviz.simulations;

import com.threadviz.core.Simulation;
import com.threadviz.models.ThreadEvent;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Implementation of the classic Dining Philosophers problem.
 * Multiple philosophers (threads) share forks (resources) and
 * must coordinate to eat (critical section) without deadlocking.
 */
public class DiningPhilosophersSimulation extends Simulation {
    private int numPhilosophers;
    private int thinkingTime; // milliseconds
    private int eatingTime; // milliseconds
    private boolean deadlockAvoidance;
    
    private Lock[] forks;
    
    public DiningPhilosophersSimulation() {
        super("Dining Philosophers");
        this.numPhilosophers = 5;
        this.thinkingTime = 2000;
        this.eatingTime = 1000;
        this.deadlockAvoidance = true;
        this.forks = new Lock[numPhilosophers];
        
        for (int i = 0; i < numPhilosophers; i++) {
            forks[i] = new ReentrantLock();
        }
    }
    
    @Override
    protected void startSimulation() {
        // Reset forks if needed
        for (int i = 0; i < numPhilosophers; i++) {
            if (forks[i] == null) {
                forks[i] = new ReentrantLock();
            }
        }
        
        // Start philosopher threads
        for (int i = 0; i < numPhilosophers; i++) {
            final int philosopherId = i;
            executor.submit(() -> runPhilosopher(philosopherId));
        }
    }
    
    private void runPhilosopher(int id) {
        Thread.currentThread().setName("Philosopher-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_CREATED, "Philosopher created", "philosopher-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_STARTED, "Philosopher started", "philosopher-" + id);
        
        try {
            while (running.get()) {
                checkPaused();
                
                // Think
                publishEvent(ThreadEvent.EventType.EXECUTION, "Philosopher thinking", "philosopher-" + id);
                simulateWork(thinkingTime);
                
                // Get hungry and try to eat
                if (tryToEat(id)) {
                    // Eat
                    publishEvent(ThreadEvent.EventType.EXECUTION, "Philosopher eating", "philosopher-" + id);
                    simulateWork(eatingTime);
                    
                    // Put down forks
                    putDownForks(id);
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            publishEvent(ThreadEvent.EventType.THREAD_TERMINATED, "Philosopher terminated", "philosopher-" + id);
        }
    }
    
    private boolean tryToEat(int id) throws InterruptedException {
        int leftFork = id;
        int rightFork = (id + 1) % numPhilosophers;
        
        // Deadlock avoidance: odd philosophers pick up right fork first
        if (deadlockAvoidance && id % 2 == 1) {
            int temp = leftFork;
            leftFork = rightFork;
            rightFork = temp;
        }
        
        // Try to pick up first fork
        publishEvent(ThreadEvent.EventType.LOCK_WAITING, 
                "Waiting for fork " + leftFork, 
                "fork-" + leftFork);
        
        if (forks[leftFork].tryLock() || forks[leftFork].tryLock()) {
            publishEvent(ThreadEvent.EventType.LOCK_ACQUIRED, 
                    "Acquired fork " + leftFork, 
                    "fork-" + leftFork);
            
            try {
                // Try to pick up second fork
                publishEvent(ThreadEvent.EventType.LOCK_WAITING, 
                        "Waiting for fork " + rightFork, 
                        "fork-" + rightFork);
                
                if (forks[rightFork].tryLock() || forks[rightFork].tryLock()) {
                    publishEvent(ThreadEvent.EventType.LOCK_ACQUIRED, 
                            "Acquired fork " + rightFork, 
                            "fork-" + rightFork);
                    return true;
                } else {
                    // Could not get second fork, release first and try again later
                    publishEvent(ThreadEvent.EventType.LOCK_RELEASED, 
                            "Could not get fork " + rightFork + ", releasing fork " + leftFork, 
                            "fork-" + leftFork);
                    forks[leftFork].unlock();
                    
                    // Adding a small delay to reduce contention
                    Thread.sleep(100);
                    return false;
                }
            } catch (Exception e) {
                // Something went wrong, release first fork
                forks[leftFork].unlock();
                throw e;
            }
        } else {
            // Could not get first fork, try again later
            publishEvent(ThreadEvent.EventType.EXECUTION, 
                    "Could not get fork " + leftFork + ", will try again", 
                    "philosopher-" + id);
            
            // Adding a small delay to reduce contention
            Thread.sleep(100);
            return false;
        }
    }
    
    private void putDownForks(int id) {
        int leftFork = id;
        int rightFork = (id + 1) % numPhilosophers;
        
        // Deadlock avoidance: odd philosophers pick up right fork first, so release in reverse
        if (deadlockAvoidance && id % 2 == 1) {
            int temp = leftFork;
            leftFork = rightFork;
            rightFork = temp;
        }
        
        // Release forks in reverse order of acquisition
        publishEvent(ThreadEvent.EventType.LOCK_RELEASED, 
                "Releasing fork " + rightFork, 
                "fork-" + rightFork);
        forks[rightFork].unlock();
        
        publishEvent(ThreadEvent.EventType.LOCK_RELEASED, 
                "Releasing fork " + leftFork, 
                "fork-" + leftFork);
        forks[leftFork].unlock();
    }
    
    // Getters and setters for simulation parameters
    
    public int getNumPhilosophers() {
        return numPhilosophers;
    }
    
    public void setNumPhilosophers(int numPhilosophers) {
        if (this.numPhilosophers != numPhilosophers) {
            this.numPhilosophers = numPhilosophers;
            
            // Recreate forks array
            Lock[] newForks = new Lock[numPhilosophers];
            for (int i = 0; i < numPhilosophers; i++) {
                if (i < forks.length) {
                    newForks[i] = forks[i];
                } else {
                    newForks[i] = new ReentrantLock();
                }
            }
            this.forks = newForks;
        }
    }
    
    public int getThinkingTime() {
        return thinkingTime;
    }
    
    public void setThinkingTime(int thinkingTime) {
        this.thinkingTime = thinkingTime;
    }
    
    public int getEatingTime() {
        return eatingTime;
    }
    
    public void setEatingTime(int eatingTime) {
        this.eatingTime = eatingTime;
    }
    
    public boolean isDeadlockAvoidance() {
        return deadlockAvoidance;
    }
    
    public void setDeadlockAvoidance(boolean deadlockAvoidance) {
        this.deadlockAvoidance = deadlockAvoidance;
    }
} 