package com.threadviz;

import com.threadviz.ui.SimulationController;

import javax.swing.*;
import java.awt.*;

/**
 * Main application class for ThreadViz.
 */
public class Main {
    
    /**
     * Main entry point for the application.
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                // Set system look and feel
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception e) {
                e.printStackTrace();
            }
            
            // Create and configure the main frame
            JFrame frame = new JFrame("ThreadViz - Java Concurrency Visualizer");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setSize(1000, 700);
            
            // Create the main controller
            SimulationController controller = new SimulationController();
            
            // Add the main panel to the frame
            frame.getContentPane().add(controller.createMainPanel(), BorderLayout.CENTER);
            
            // Center the frame on screen
            frame.setLocationRelativeTo(null);
            
            // Display the frame
            frame.setVisible(true);
        });
    }
} 