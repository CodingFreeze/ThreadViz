package com.threadviz.ui;

import com.threadviz.core.EventBus;
import com.threadviz.models.ThreadEvent;
import com.threadviz.models.ThreadVisual;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.awt.geom.Area;
import java.awt.geom.Ellipse2D;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Canvas for visualizing thread simulations in real-time.
 */
public class SimulationCanvas extends Canvas implements EventBus.EventListener {
    
    private final Map<String, ThreadVisual> threadVisuals;
    private final Map<String, List<ThreadVisual>> resourceMapping;
    private final List<ThreadEvent> recentEvents;
    private final int maxRecentEvents = 10;
    
    private int width;
    private int height;
    
    public SimulationCanvas(int width, int height) {
        this.width = width;
        this.height = height;
        this.threadVisuals = new ConcurrentHashMap<>();
        this.resourceMapping = new HashMap<>();
        this.recentEvents = new ArrayList<>();
        
        // Set the canvas size
        setSize(width, height);
        
        // Register as event listener
        EventBus.getInstance().addEventListener(this);
        
        // Set up resize handling
        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                SimulationCanvas.this.width = getWidth();
                SimulationCanvas.this.height = getHeight();
                repaint();
            }
        });
    }
    
    @Override
    public void paint(Graphics g) {
        super.paint(g);
        draw((Graphics2D) g);
    }
    
    /**
     * Called when new thread events occur
     */
    @Override
    public void onEvent(ThreadEvent event) {
        // Add to recent events
        synchronized (recentEvents) {
            recentEvents.add(0, event);
            if (recentEvents.size() > maxRecentEvents) {
                recentEvents.remove(recentEvents.size() - 1);
            }
        }
        
        // Get or create thread visual
        String threadId = event.getThreadName();
        ThreadVisual visual = threadVisuals.get(threadId);
        
        if (visual == null && event.getType() == ThreadEvent.EventType.THREAD_CREATED) {
            // Calculate center point
            double centerX = getWidth() / 2.0;
            double centerY = getHeight() / 2.0;
            
            // Create a thread in a circular area around the center
            double radius = Math.min(getWidth(), getHeight()) * 0.3; // 30% of the smaller dimension
            double angle = Math.random() * 2 * Math.PI; // Random angle
            double distance = Math.sqrt(Math.random()) * radius; // Square root for better radial distribution
            
            // Position new thread
            double x = centerX + Math.cos(angle) * distance;
            double y = centerY + Math.sin(angle) * distance;
            
            // Create visual
            visual = new ThreadVisual(threadId, x, y);
            threadVisuals.put(threadId, visual);
        }
        
        if (visual != null) {
            // Update thread visual based on event
            updateThreadVisual(visual, event);
        }
        
        // Redraw canvas
        SwingUtilities.invokeLater(this::repaint);
    }
    
    /**
     * Update thread visual position and state based on event
     */
    private void updateThreadVisual(ThreadVisual visual, ThreadEvent event) {
        // Update visual state
        visual.updateFromEvent(event);
        
        // Update resource mappings
        String resourceId = visual.getResourceId();
        if (resourceId != null) {
            resourceMapping.computeIfAbsent(resourceId, k -> new ArrayList<>())
                    .add(visual);
        }
        
        // Calculate center point of canvas
        double centerX = width / 2.0;
        double centerY = height / 2.0;
        
        // Calculate gravitational factor based on distance from center
        // Further away = stronger pull toward center
        double dx = centerX - visual.getX();
        double dy = centerY - visual.getY();
        double distance = Math.sqrt(dx * dx + dy * dy);
        
        // Base attraction to center - the further away, the stronger the pull
        double centerAttractionFactor = 0.005 * (distance / 100.0);
        
        // Position update based on multiple factors
        double newX = visual.getX();
        double newY = visual.getY();
        
        // First apply center attraction
        newX += dx * centerAttractionFactor;
        newY += dy * centerAttractionFactor;
        
        // Then apply resource affinity if applicable
        if (resourceId != null) {
            List<ThreadVisual> resourceUsers = resourceMapping.get(resourceId);
            if (resourceUsers != null && resourceUsers.size() > 1) {
                // Position threads using the same resource close to each other
                double avgX = 0, avgY = 0;
                int count = 0;
                for (ThreadVisual other : resourceUsers) {
                    if (other != visual && !other.getState().equals("TERMINATED")) {
                        avgX += other.getX();
                        avgY += other.getY();
                        count++;
                    }
                }
                
                if (count > 0) {
                    avgX /= count;
                    avgY /= count;
                    
                    // Resource affinity is stronger than center attraction
                    double resourceAttractionFactor = 0.1;
                    newX = newX * (1 - resourceAttractionFactor) + avgX * resourceAttractionFactor;
                    newY = newY * (1 - resourceAttractionFactor) + avgY * resourceAttractionFactor;
                }
            }
        }
        
        // Add a tiny bit of random movement to prevent static clusters
        double randomMovement = 0.5;
        newX += (Math.random() - 0.5) * randomMovement;
        newY += (Math.random() - 0.5) * randomMovement;
        
        // Ensure threads stay within canvas bounds with padding
        double padding = 50;
        newX = Math.max(padding, Math.min(width - padding, newX));
        newY = Math.max(padding, Math.min(height - padding, newY));
        
        // Update position
        visual.setX(newX);
        visual.setY(newY);
    }
    
    /**
     * Draw the current thread state
     */
    private void draw(Graphics2D g) {
        // Enable anti-aliasing for smoother graphics
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        
        // Clear background with dark color
        g.setColor(new Color(43, 43, 43));
        g.fillRect(0, 0, getWidth(), getHeight());
        
        // Draw grid lines for better visual orientation
        drawGrid(g);
        
        // Draw center attraction point
        drawCenterPoint(g);
        
        // Draw resources as circles
        drawResources(g);
        
        // Draw connection lines between threads that share resources
        drawConnections(g);
        
        // Draw threads
        drawThreads(g);
        
        // Note: We no longer draw the event log directly on the canvas
        // as it will be rendered in a separate panel below the canvas
    }
    
    private void drawGrid(Graphics2D g) {
        int gridSize = 50;
        g.setColor(new Color(55, 55, 55));
        
        // Draw horizontal grid lines
        for (int y = 0; y < getHeight(); y += gridSize) {
            g.drawLine(0, y, getWidth(), y);
        }
        
        // Draw vertical grid lines
        for (int x = 0; x < getWidth(); x += gridSize) {
            g.drawLine(x, 0, x, getHeight());
        }
    }
    
    /**
     * Draw a subtle marker at the center of the canvas
     */
    private void drawCenterPoint(Graphics2D g) {
        int centerX = getWidth() / 2;
        int centerY = getHeight() / 2;
        
        // Draw a subtle circular gradient at the center
        RadialGradientPaint centerGlow = new RadialGradientPaint(
            centerX, centerY, 60f,
            new float[]{0.0f, 0.5f, 1.0f},
            new Color[]{
                new Color(95, 125, 155, 25),  // Light blue-gray, very subtle
                new Color(75, 105, 135, 10),  // Fading
                new Color(65, 95, 125, 0)     // Transparent at edges
            }
        );
        g.setPaint(centerGlow);
        g.fillOval(centerX - 60, centerY - 60, 120, 120);
        
        // Draw concentric circles
        g.setColor(new Color(95, 125, 155, 15));
        g.setStroke(new BasicStroke(0.8f));
        g.drawOval(centerX - 40, centerY - 40, 80, 80);
        
        g.setColor(new Color(95, 125, 155, 10));
        g.setStroke(new BasicStroke(0.5f));
        g.drawOval(centerX - 20, centerY - 20, 40, 40);
        
        g.setColor(new Color(95, 125, 155, 20));
        g.setStroke(new BasicStroke(1.0f));
        g.drawOval(centerX - 5, centerY - 5, 10, 10);
    }
    
    private void drawConnections(Graphics2D g) {
        // Draw lines between threads that share resources
        for (Map.Entry<String, List<ThreadVisual>> entry : resourceMapping.entrySet()) {
            List<ThreadVisual> users = entry.getValue();
            
            if (users.size() < 2) continue;
            
            // Use dashed stroke for connections
            float[] dashPattern = {8.0f, 4.0f};
            g.setStroke(new BasicStroke(1.8f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND, 
                    0, dashPattern, 0));
            
            for (int i = 0; i < users.size(); i++) {
                ThreadVisual v1 = users.get(i);
                if (v1.getState().equals("TERMINATED")) continue;
                
                for (int j = i + 1; j < users.size(); j++) {
                    ThreadVisual v2 = users.get(j);
                    if (v2.getState().equals("TERMINATED")) continue;
                    
                    // Different colors based on lock state
                    if (v1.isLocked() || v2.isLocked()) {
                        // Create gradient for connection line
                        GradientPaint gradient = new GradientPaint(
                            (float)v1.getX(), (float)v1.getY(), new Color(255, 193, 7, 180), // Amber
                            (float)v2.getX(), (float)v2.getY(), new Color(255, 152, 0, 180)  // Darker amber
                        );
                        g.setPaint(gradient);
                    } else {
                        // Create gradient for connection line
                        GradientPaint gradient = new GradientPaint(
                            (float)v1.getX(), (float)v1.getY(), new Color(33, 150, 243, 180), // Blue
                            (float)v2.getX(), (float)v2.getY(), new Color(13, 71, 161, 180)   // Darker blue
                        );
                        g.setPaint(gradient);
                    }
                    
                    g.drawLine((int)v1.getX(), (int)v1.getY(), (int)v2.getX(), (int)v2.getY());
                }
            }
        }
    }
    
    private void drawResources(Graphics2D g) {
        Map<String, Double[]> resourcePositions = new HashMap<>();
        
        // Calculate resource positions based on threads using them
        for (Map.Entry<String, List<ThreadVisual>> entry : resourceMapping.entrySet()) {
            String resourceId = entry.getKey();
            List<ThreadVisual> users = entry.getValue();
            
            if (users.isEmpty()) continue;
            
            // Calculate center position
            double avgX = 0, avgY = 0;
            int activeCount = 0;
            
            for (ThreadVisual visual : users) {
                if (!visual.getState().equals("TERMINATED")) {
                    avgX += visual.getX();
                    avgY += visual.getY();
                    activeCount++;
                }
            }
            
            if (activeCount > 0) {
                avgX /= activeCount;
                avgY /= activeCount;
                resourcePositions.put(resourceId, new Double[]{avgX, avgY});
            }
        }
        
        // Draw resources
        for (Map.Entry<String, Double[]> entry : resourcePositions.entrySet()) {
            String resourceId = entry.getKey();
            Double[] pos = entry.getValue();
            
            // Draw outer glow effect
            RadialGradientPaint outerGlow = new RadialGradientPaint(
                pos[0].floatValue(), 
                pos[1].floatValue(), 
                50f,
                new float[]{0.7f, 1.0f},
                new Color[]{
                    new Color(33, 150, 243, 40),  // Light blue, low opacity
                    new Color(33, 150, 243, 0)    // Fully transparent at edges
                }
            );
            g.setPaint(outerGlow);
            g.fillOval(pos[0].intValue() - 50, pos[1].intValue() - 50, 100, 100);
            
            // Draw inner glow
            RadialGradientPaint innerGlow = new RadialGradientPaint(
                pos[0].floatValue(), 
                pos[1].floatValue(), 
                35f,
                new float[]{0.0f, 0.8f},
                new Color[]{
                    new Color(33, 150, 243, 70),  // Material blue, higher opacity at center
                    new Color(33, 150, 243, 20)   // Lower opacity at edge
                }
            );
            g.setPaint(innerGlow);
            g.fillOval(pos[0].intValue() - 35, pos[1].intValue() - 35, 70, 70);
            
            // Draw resource circle border
            g.setStroke(new BasicStroke(2.2f));
            g.setColor(new Color(3, 169, 244)); // Material light blue
            g.drawOval(pos[0].intValue() - 26, pos[1].intValue() - 26, 52, 52);
            
            // Draw resource ID with better font and shadow effect
            g.setFont(new Font("Segoe UI", Font.BOLD, 14));
            
            // Draw text shadow
            g.setColor(new Color(0, 0, 0, 120));
            FontMetrics fm = g.getFontMetrics();
            int textWidth = fm.stringWidth(resourceId);
            int textHeight = fm.getHeight();
            g.drawString(resourceId, 
                    pos[0].intValue() - textWidth / 2 + 1, 
                    pos[1].intValue() + textHeight / 4 + 1);
            
            // Draw actual text
            g.setColor(new Color(255, 255, 255)); // White text
            g.drawString(resourceId, 
                    pos[0].intValue() - textWidth / 2, 
                    pos[1].intValue() + textHeight / 4);
        }
    }
    
    private void drawThreads(Graphics2D g) {
        // Draw thread visuals
        for (ThreadVisual visual : threadVisuals.values()) {
            if (visual.getState().equals("TERMINATED")) {
                continue; // Skip terminated threads
            }
            
            int x = (int) visual.getX();
            int y = (int) visual.getY();
            int size = 44; // Thread node size
            
            // Draw shadow/glow effect
            Color glowColor = getThreadGlowColor(visual);
            RadialGradientPaint glow = new RadialGradientPaint(
                x, y, size + 14,
                new float[]{0.0f, 0.7f, 1.0f},
                new Color[]{
                    new Color(glowColor.getRed(), glowColor.getGreen(), glowColor.getBlue(), 90),
                    new Color(glowColor.getRed(), glowColor.getGreen(), glowColor.getBlue(), 40),
                    new Color(glowColor.getRed(), glowColor.getGreen(), glowColor.getBlue(), 0)
                }
            );
            g.setPaint(glow);
            g.fillOval(x - (size + 14) / 2, y - (size + 14) / 2, size + 14, size + 14);
            
            // Draw the thread circle with fancy fill
            Color threadColor = getThreadColor(visual);
            
            // Fill with a gradient
            GradientPaint gradient = new GradientPaint(
                x - size/2, y - size/2, lighter(threadColor, 1.2f),
                x + size/2, y + size/2, threadColor
            );
            g.setPaint(gradient);
            
            // Use a smoother circle
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.fillOval(x - size / 2, y - size / 2, size, size);
            
            // Draw a glossy highlight (top left quadrant slightly lighter)
            Area circle = new Area(new Ellipse2D.Float(x - size / 2, y - size / 2, size, size));
            Area highlight = new Area(new Ellipse2D.Float(x - size / 2, y - size / 2, size, size/2));
            highlight.intersect(new Area(new Ellipse2D.Float(x - size / 2, y - size / 2, size/2, size)));
            
            g.setColor(new Color(255, 255, 255, 60)); // Semi-transparent white
            g.fill(highlight);
            
            // Draw a border
            g.setStroke(new BasicStroke(2.0f));
            g.setColor(darker(threadColor, 0.8f));
            g.drawOval(x - size / 2, y - size / 2, size, size);
            
            // Draw thread ID
            g.setFont(new Font("Segoe UI", Font.BOLD, 13));
            
            // Center text
            FontMetrics fm = g.getFontMetrics();
            String threadId = visual.getId();
            if (threadId.length() > 10) {
                threadId = threadId.substring(0, 9) + "…"; // Truncate long names
            }
            int textWidth = fm.stringWidth(threadId);
            
            // Draw text shadow
            g.setColor(new Color(0, 0, 0, 120));
            g.drawString(threadId, x - textWidth / 2 + 1, y + 5 + 1);
            
            // Draw actual text
            g.setColor(new Color(255, 255, 255)); // White text
            g.drawString(threadId, x - textWidth / 2, y + 5);
            
            // Draw thread state below the circle with nicer styling
            String stateText = visual.getState();
            // Shorten common state names
            stateText = stateText.replace("RUNNABLE", "RUNNING")
                               .replace("WAITING", "WAIT")
                               .replace("TIMED_WAITING", "T_WAIT")
                               .replace("BLOCKED", "BLOCKED");
            
            g.setFont(new Font("Segoe UI", Font.PLAIN, 11));
            textWidth = fm.stringWidth(stateText);
            
            // Draw state tag with rounded rectangle background
            int stateWidth = textWidth + 10;
            int stateHeight = 18;
            int stateX = x - stateWidth / 2;
            int stateY = y + size / 2 + 6;
            
            // State background
            g.setColor(darker(threadColor, 0.8f));
            g.fillRoundRect(stateX, stateY, stateWidth, stateHeight, 8, 8);
            
            // State text
            g.setColor(new Color(255, 255, 255));
            g.drawString(stateText, x - textWidth / 2, stateY + 13);
            
            // If thread is accessing a resource, draw an indicator
            if (visual.getResourceId() != null) {
                if (visual.isLocked()) {
                    // Draw a lock icon
                    int lockSize = 20;
                    int lockX = x - lockSize / 2;
                    int lockY = y - size / 2 - lockSize - 3;
                    
                    // Lock body
                    g.setColor(new Color(255, 193, 7)); // Amber
                    g.fillRoundRect(lockX, lockY + lockSize/2, lockSize, lockSize/2, 4, 4);
                    
                    // Lock shackle
                    g.setStroke(new BasicStroke(3.0f));
                    g.drawArc(lockX + 4, lockY, lockSize - 8, lockSize/2, 0, 180);
                } else {
                    // Draw an arrow
                    int arrowSize = 12;
                    int[] xPoints = {x, x + arrowSize/2, x - arrowSize/2};
                    int[] yPoints = {y - size / 2 - 10, y - size / 2 - 2, y - size / 2 - 2};
                    
                    g.setColor(new Color(255, 193, 7)); // Amber
                    g.fillPolygon(xPoints, yPoints, 3);
                }
            }
        }
    }
    
    private Color getThreadColor(ThreadVisual visual) {
        // Return different colors based on thread state
        switch (visual.getState()) {
            case "RUNNABLE":
                return new Color(76, 175, 80); // Material Green
            case "BLOCKED":
                return new Color(244, 67, 54);  // Material Red
            case "WAITING":
            case "TIMED_WAITING":
                return new Color(255, 193, 7); // Material Amber
            default:
                return new Color(33, 150, 243); // Material Blue
        }
    }
    
    private Color getThreadGlowColor(ThreadVisual visual) {
        // Return different glow colors based on activity
        if (visual.isLocked()) {
            return new Color(255, 193, 7, 180); // Semi-transparent amber for locked threads
        } else if (visual.getState().equals("BLOCKED")) {
            return new Color(244, 67, 54, 180);  // Semi-transparent red for blocked threads
        } else if (visual.getState().equals("RUNNABLE")) {
            return new Color(76, 175, 80, 180); // Semi-transparent green for running threads
        } else {
            return new Color(33, 150, 243, 180); // Semi-transparent blue for other states
        }
    }
    
    private Color darker(Color c, float factor) {
        return new Color(
            Math.max((int)(c.getRed() * factor), 0),
            Math.max((int)(c.getGreen() * factor), 0),
            Math.max((int)(c.getBlue() * factor), 0),
            c.getAlpha()
        );
    }
    
    private Color lighter(Color c, float factor) {
        return new Color(
            Math.min((int)(c.getRed() * factor), 255),
            Math.min((int)(c.getGreen() * factor), 255),
            Math.min((int)(c.getBlue() * factor), 255),
            c.getAlpha()
        );
    }
    
    private void drawEventLog(Graphics2D g) {
        // This method is now only used when rendering to an external component
        // It's kept for compatibility but not called from draw()
        // Draw recent events in the corner of the canvas
        g.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        
        // Background for event log
        g.setColor(new Color(43, 43, 43, 200)); // Semi-transparent black
        g.fillRect(10, 10, 350, Math.min(recentEvents.size(), 5) * 20 + 10);
        g.setColor(new Color(68, 68, 68));
        g.drawRect(10, 10, 350, Math.min(recentEvents.size(), 5) * 20 + 10);
        
        // Draw recent events
        synchronized (recentEvents) {
            int y = 25;
            int count = 0;
            for (ThreadEvent event : recentEvents) {
                if (count++ >= 5) break; // Show only 5 most recent events
                
                // Choose color based on event type
                switch (event.getType()) {
                    case THREAD_CREATED:
                    case THREAD_STARTED:
                        g.setColor(new Color(106, 135, 89)); // Green
                        break;
                    case THREAD_TERMINATED:
                        g.setColor(new Color(204, 120, 50)); // Orange
                        break;
                    case LOCK_ACQUIRED:
                        g.setColor(new Color(104, 151, 187)); // Blue
                        break;
                    case LOCK_RELEASED:
                        g.setColor(new Color(152, 118, 170)); // Purple
                        break;
                    case LOCK_WAITING:
                        g.setColor(new Color(187, 181, 41)); // Yellow
                        break;
                    default:
                        g.setColor(new Color(232, 232, 232)); // Default light text
                }
                
                g.drawString(formatEvent(event), 15, y);
                y += 20;
            }
        }
    }
    
    private String formatEvent(ThreadEvent event) {
        return String.format("%s: %s - %s", 
                event.getThreadName(), 
                event.getType().toString(), 
                event.getMessage());
    }
    
    /**
     * Reset the visualization
     */
    public void reset() {
        threadVisuals.clear();
        resourceMapping.clear();
        synchronized (recentEvents) {
            recentEvents.clear();
        }
        repaint();
    }
} 