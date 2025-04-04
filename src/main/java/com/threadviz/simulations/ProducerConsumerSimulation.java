package com.threadviz.simulations;

import com.threadviz.core.Simulation;
import com.threadviz.models.ThreadEvent;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Implementation of the classic Producer-Consumer problem.
 * Multiple producer threads add items to a bounded buffer,
 * while multiple consumer threads remove items from the buffer.
 */
public class ProducerConsumerSimulation extends Simulation {
    private int numProducers;
    private int numConsumers;
    private int bufferSize;
    private int productionRate; // milliseconds
    private int consumptionRate; // milliseconds
    
    private final BlockingQueue<Integer> buffer;
    private final AtomicInteger itemsProduced = new AtomicInteger(0);
    private final AtomicInteger itemsConsumed = new AtomicInteger(0);
    
    public ProducerConsumerSimulation() {
        super("Producer-Consumer");
        this.numProducers = 2;
        this.numConsumers = 2;
        this.bufferSize = 5;
        this.productionRate = 1000;
        this.consumptionRate = 1500;
        this.buffer = new LinkedBlockingQueue<>(bufferSize);
    }
    
    @Override
    protected void startSimulation() {
        // Start producer threads
        for (int i = 0; i < numProducers; i++) {
            final int producerId = i;
            executor.submit(() -> runProducer(producerId));
        }
        
        // Start consumer threads
        for (int i = 0; i < numConsumers; i++) {
            final int consumerId = i;
            executor.submit(() -> runConsumer(consumerId));
        }
    }
    
    private void runProducer(int id) {
        Thread.currentThread().setName("Producer-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_CREATED, "Producer created", "producer-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_STARTED, "Producer started", "producer-" + id);
        
        try {
            while (running.get()) {
                checkPaused();
                
                // Simulate work to produce an item
                publishEvent(ThreadEvent.EventType.EXECUTION, "Producing item", "producer-" + id);
                simulateWork(productionRate);
                
                int item = itemsProduced.incrementAndGet();
                
                // Try to put the item in the buffer
                publishEvent(ThreadEvent.EventType.LOCK_WAITING, 
                        "Waiting to add item " + item + " to buffer (buffer size: " + buffer.size() + "/" + bufferSize + ")", 
                        "buffer");
                
                buffer.put(item); // This will block if the buffer is full
                
                publishEvent(ThreadEvent.EventType.LOCK_ACQUIRED, 
                        "Added item " + item + " to buffer (buffer size: " + buffer.size() + "/" + bufferSize + ")", 
                        "buffer");
                
                publishEvent(ThreadEvent.EventType.LOCK_RELEASED, 
                        "Released buffer after adding item", 
                        "buffer");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            publishEvent(ThreadEvent.EventType.THREAD_TERMINATED, "Producer terminated", "producer-" + id);
        }
    }
    
    private void runConsumer(int id) {
        Thread.currentThread().setName("Consumer-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_CREATED, "Consumer created", "consumer-" + id);
        publishEvent(ThreadEvent.EventType.THREAD_STARTED, "Consumer started", "consumer-" + id);
        
        try {
            while (running.get()) {
                checkPaused();
                
                // Try to take an item from the buffer
                publishEvent(ThreadEvent.EventType.LOCK_WAITING, 
                        "Waiting to take item from buffer (buffer size: " + buffer.size() + "/" + bufferSize + ")", 
                        "buffer");
                
                int item = buffer.take(); // This will block if the buffer is empty
                itemsConsumed.incrementAndGet();
                
                publishEvent(ThreadEvent.EventType.LOCK_ACQUIRED, 
                        "Took item " + item + " from buffer (buffer size: " + buffer.size() + "/" + bufferSize + ")", 
                        "buffer");
                
                publishEvent(ThreadEvent.EventType.LOCK_RELEASED, 
                        "Released buffer after consuming item", 
                        "buffer");
                
                // Simulate work to consume the item
                publishEvent(ThreadEvent.EventType.EXECUTION, "Consuming item " + item, "consumer-" + id);
                simulateWork(consumptionRate);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            publishEvent(ThreadEvent.EventType.THREAD_TERMINATED, "Consumer terminated", "consumer-" + id);
        }
    }
    
    // Getters and setters for simulation parameters
    
    public int getNumProducers() {
        return numProducers;
    }
    
    public void setNumProducers(int numProducers) {
        this.numProducers = numProducers;
    }
    
    public int getNumConsumers() {
        return numConsumers;
    }
    
    public void setNumConsumers(int numConsumers) {
        this.numConsumers = numConsumers;
    }
    
    public int getBufferSize() {
        return bufferSize;
    }
    
    public void setBufferSize(int bufferSize) {
        this.bufferSize = bufferSize;
    }
    
    public int getProductionRate() {
        return productionRate;
    }
    
    public void setProductionRate(int productionRate) {
        this.productionRate = productionRate;
    }
    
    public int getConsumptionRate() {
        return consumptionRate;
    }
    
    public void setConsumptionRate(int consumptionRate) {
        this.consumptionRate = consumptionRate;
    }
    
    public int getItemsProduced() {
        return itemsProduced.get();
    }
    
    public int getItemsConsumed() {
        return itemsConsumed.get();
    }
    
    public int getCurrentBufferSize() {
        return buffer.size();
    }
} 