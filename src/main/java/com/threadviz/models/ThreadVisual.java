package com.threadviz.models;

import java.awt.Color;

/**
 * Represents the visual state of a thread in the visualization canvas.
 */
public class ThreadVisual {
    private String threadId;
    private double x;
    private double y;
    private Color color;
    private String state;
    private String resourceId;
    private String label;
    
    public ThreadVisual(String threadId, double x, double y) {
        this.threadId = threadId;
        this.x = x;
        this.y = y;
        this.color = Color.GRAY;
        this.state = "CREATED";
        this.resourceId = null;
        this.label = threadId;
    }
    
    public String getThreadId() {
        return threadId;
    }
    
    public double getX() {
        return x;
    }
    
    public void setX(double x) {
        this.x = x;
    }
    
    public double getY() {
        return y;
    }
    
    public void setY(double y) {
        this.y = y;
    }
    
    public Color getColor() {
        return color;
    }
    
    public void setColor(Color color) {
        this.color = color;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
        updateColorForState();
    }
    
    public String getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }
    
    public String getLabel() {
        return label;
    }
    
    public void setLabel(String label) {
        this.label = label;
    }
    
    /**
     * @return the thread's ID
     */
    public String getId() {
        return threadId;
    }
    
    /**
     * Determines if the thread is holding a lock
     * @return true if the thread is holding a lock (has a resource)
     */
    public boolean isLocked() {
        return resourceId != null && state.equals("RUNNING");
    }
    
    /**
     * Update the thread's visual color based on its current state
     */
    private void updateColorForState() {
        switch (state) {
            case "CREATED":
                this.color = Color.GRAY;
                break;
            case "RUNNING":
                this.color = Color.GREEN;
                break;
            case "WAITING":
                this.color = Color.ORANGE;
                break;
            case "BLOCKED":
                this.color = Color.RED;
                break;
            case "TERMINATED":
                this.color = Color.BLACK;
                break;
            default:
                this.color = Color.BLUE;
                break;
        }
    }
    
    /**
     * Update the thread's visual state based on an event
     */
    public void updateFromEvent(ThreadEvent event) {
        switch (event.getType()) {
            case THREAD_CREATED:
                setState("CREATED");
                break;
            case THREAD_STARTED:
                setState("RUNNING");
                break;
            case THREAD_TERMINATED:
                setState("TERMINATED");
                break;
            case LOCK_WAITING:
                setState("BLOCKED");
                setResourceId(event.getResourceId());
                break;
            case LOCK_ACQUIRED:
                setState("RUNNING");
                setResourceId(event.getResourceId());
                break;
            case LOCK_RELEASED:
                setState("RUNNING");
                setResourceId(null);
                break;
            case CONDITION_WAITING:
                setState("WAITING");
                setResourceId(event.getResourceId());
                break;
            case CONDITION_SIGNALED:
                setState("RUNNING");
                break;
            case EXECUTION:
                setState("RUNNING");
                break;
            case DEADLOCK_DETECTED:
                setState("BLOCKED");
                this.color = new Color(139, 0, 0); // Dark Red
                break;
        }
    }
} 