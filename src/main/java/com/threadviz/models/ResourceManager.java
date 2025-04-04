package com.threadviz.models;

import java.awt.Point;
import java.util.HashMap;
import java.util.Map;

/**
 * Manages resources and their positions in the simulation.
 */
public class ResourceManager {
    private final Map<String, Point> resourcePositions = new HashMap<>();
    
    /**
     * Add a resource with a position
     * @param resourceId The resource identifier
     * @param x X coordinate
     * @param y Y coordinate
     */
    public void addResource(String resourceId, int x, int y) {
        resourcePositions.put(resourceId, new Point(x, y));
    }
    
    /**
     * Get the position of a resource
     * @param resourceId The resource identifier
     * @return The position as a Point, or null if not found
     */
    public Point getResourcePosition(String resourceId) {
        return resourcePositions.get(resourceId);
    }
    
    /**
     * Get all resource positions
     * @return Map of resource ids to positions
     */
    public Map<String, Point> getResourcePositions() {
        return resourcePositions;
    }
    
    /**
     * Clear all resources
     */
    public void clear() {
        resourcePositions.clear();
    }
} 