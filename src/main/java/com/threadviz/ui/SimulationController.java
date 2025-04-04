package com.threadviz.ui;

import com.threadviz.core.EventBus;
import com.threadviz.core.Simulation;
import com.threadviz.models.ThreadEvent;
import com.threadviz.simulations.DiningPhilosophersSimulation;
import com.threadviz.simulations.ProducerConsumerSimulation;
import com.threadviz.simulations.ReaderWriterSimulation;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.event.ListSelectionEvent;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

/**
 * Controller for the main UI of the ThreadViz application.
 */
public class SimulationController {
    
    // UI Components
    private JPanel mainPanel;
    private JComboBox<String> simulationSelector;
    private JButton startButton;
    private JButton pauseButton;
    private JButton stopButton;
    private JButton resetButton;
    private JSlider speedSlider;
    private JPanel controlsPanel;
    private JList<ThreadEvent> eventLogList;
    
    private SimulationCanvas canvas;
    private Simulation currentSimulation;
    private final List<Simulation> simulations;
    
    private boolean running = false;
    private boolean paused = false;
    
    public SimulationController() {
        // Create simulations
        simulations = new ArrayList<>();
        simulations.add(new ProducerConsumerSimulation());
        simulations.add(new DiningPhilosophersSimulation());
        simulations.add(new ReaderWriterSimulation());
    }
    
    public JPanel createMainPanel() {
        mainPanel = new JPanel(new BorderLayout());
        
        // Create top panel with controls
        JPanel topPanel = createTopPanel();
        mainPanel.add(topPanel, BorderLayout.NORTH);
        
        // Create center panel with simulation canvas, controls, and event log
        JSplitPane centerPanel = createCenterPanel();
        mainPanel.add(centerPanel, BorderLayout.CENTER);
        
        // Initialize UI state
        updateSimulationControls();
        updateButtonStates();
        
        return mainPanel;
    }
    
    private JPanel createTopPanel() {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(new EmptyBorder(10, 10, 10, 10));
        panel.setBackground(new Color(45, 45, 45)); // Dark background
        
        // Add title
        JLabel titleLabel = new JLabel("ThreadViz - Java Concurrency Visualizer");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 20));
        titleLabel.setForeground(new Color(232, 232, 232)); // Light text
        panel.add(titleLabel);
        panel.add(Box.createVerticalStrut(10));
        
        // Add controls
        JPanel controlsRow = new JPanel(new FlowLayout(FlowLayout.LEFT));
        controlsRow.setBackground(new Color(51, 51, 51)); // Slightly lighter than main background
        
        // Simulation selector
        JLabel simLabel = new JLabel("Simulation:");
        simLabel.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        simLabel.setForeground(new Color(232, 232, 232)); // Light text
        controlsRow.add(simLabel);
        
        simulationSelector = new JComboBox<>();
        for (Simulation sim : simulations) {
            simulationSelector.addItem(sim.getName());
        }
        simulationSelector.setPreferredSize(new Dimension(200, 30));
        simulationSelector.addActionListener(this::onSimulationSelected);
        simulationSelector.setBackground(new Color(60, 63, 65)); // Dark control background
        simulationSelector.setForeground(new Color(232, 232, 232)); // Light text
        ((JComponent) simulationSelector.getRenderer()).setOpaque(true);
        controlsRow.add(simulationSelector);
        
        // Add separator
        controlsRow.add(createVerticalSeparator());
        
        // Buttons
        startButton = createButton("Start", new Color(45, 94, 45)); // Green
        startButton.addActionListener(this::startSimulation);
        controlsRow.add(startButton);
        
        pauseButton = createButton("Pause", new Color(143, 109, 63)); // Amber
        pauseButton.addActionListener(this::pauseSimulation);
        controlsRow.add(pauseButton);
        
        stopButton = createButton("Stop", new Color(141, 65, 65)); // Red
        stopButton.addActionListener(this::stopSimulation);
        controlsRow.add(stopButton);
        
        resetButton = createButton("Reset", new Color(141, 65, 65)); // Red
        resetButton.addActionListener(this::resetSimulation);
        controlsRow.add(resetButton);
        
        // Add separator
        controlsRow.add(createVerticalSeparator());
        
        // Speed slider
        JLabel speedLabel = new JLabel("Speed:");
        speedLabel.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        speedLabel.setForeground(new Color(232, 232, 232)); // Light text
        controlsRow.add(speedLabel);
        
        // Create a panel for the speed slider and its value display
        JPanel speedPanel = new JPanel(new BorderLayout(5, 0));
        speedPanel.setBackground(new Color(51, 51, 51));
        
        // Speed slider with new range: 0.5 to 10.0, default at 0.5x (half speed)
        speedSlider = new JSlider(JSlider.HORIZONTAL, 5, 100, 5);
        speedSlider.setPreferredSize(new Dimension(140, 20));
        speedSlider.setPaintTicks(false);
        speedSlider.setPaintLabels(false);
        speedSlider.setSnapToTicks(false);
        speedSlider.setBackground(new Color(51, 51, 51));
        speedSlider.setForeground(new Color(232, 232, 232));
        speedSlider.putClientProperty("Slider.paintThumbArrowShape", Boolean.FALSE);
        
        // Add value display label
        JLabel speedValueLabel = new JLabel("0.5x");
        speedValueLabel.setFont(new Font("Segoe UI", Font.BOLD, 14));
        speedValueLabel.setForeground(new Color(120, 190, 255));
        speedValueLabel.setPreferredSize(new Dimension(45, 20));
        
        // Update value label when slider changes
        speedSlider.addChangeListener(e -> {
            double speedValue = speedSlider.getValue() / 10.0;
            speedValueLabel.setText(String.format("%.1fx", speedValue));
        });
        
        speedPanel.add(speedSlider, BorderLayout.CENTER);
        speedPanel.add(speedValueLabel, BorderLayout.EAST);
        
        controlsRow.add(speedPanel);
        
        panel.add(controlsRow);
        panel.add(createHorizontalSeparator());
        
        return panel;
    }
    
    private JSplitPane createCenterPanel() {
        // Create a three-way split pane: controls (left), canvas (middle), and event log (right)
        JSplitPane mainSplitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT);
        mainSplitPane.setDividerLocation(0.2);
        mainSplitPane.setResizeWeight(0.2);
        mainSplitPane.setBackground(new Color(43, 43, 43));
        mainSplitPane.setBorder(null);
        mainSplitPane.setDividerSize(5);
        
        // Create left panel (simulation controls)
        controlsPanel = new JPanel();
        controlsPanel.setLayout(new BoxLayout(controlsPanel, BoxLayout.Y_AXIS));
        controlsPanel.setBorder(BorderFactory.createTitledBorder(
            BorderFactory.createLineBorder(new Color(68, 68, 68)),
            "Simulation Controls", 
            0, 
            0,
            new Font("Segoe UI", Font.BOLD, 14),
            new Color(232, 232, 232))
        );
        controlsPanel.setBackground(new Color(51, 51, 51));
        controlsPanel.setPreferredSize(new Dimension(200, 0));
        
        // Canvas and event log split pane
        JSplitPane rightSplitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT);
        rightSplitPane.setDividerLocation(0.8);
        rightSplitPane.setResizeWeight(0.8);
        rightSplitPane.setBackground(new Color(43, 43, 43));
        rightSplitPane.setBorder(null);
        rightSplitPane.setDividerSize(5);
        
        // Create canvas panel (middle component)
        canvas = new SimulationCanvas(600, 400);
        canvas.setBackground(new Color(43, 43, 43));
        
        // Canvas panel with visualization area
        JPanel canvasPanel = new JPanel(new BorderLayout());
        canvasPanel.setBackground(new Color(43, 43, 43));
        canvasPanel.add(canvas, BorderLayout.CENTER);
        
        // Create right panel (event log)
        JPanel logPanel = new JPanel(new BorderLayout());
        logPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        logPanel.setBackground(new Color(51, 51, 51));
        logPanel.setPreferredSize(new Dimension(150, 0));
        
        JLabel logLabel = new JLabel("Event Log");
        logLabel.setFont(new Font("Segoe UI", Font.BOLD, 14));
        logLabel.setForeground(new Color(232, 232, 232));
        logPanel.add(logLabel, BorderLayout.NORTH);
        
        eventLogList = new JList<>(new DefaultListModel<>());
        eventLogList.setCellRenderer(new ThreadEventRenderer());
        eventLogList.setBackground(new Color(51, 51, 51));
        eventLogList.setForeground(new Color(232, 232, 232));
        eventLogList.setSelectionBackground(new Color(75, 110, 175));
        
        JScrollPane scrollPane = new JScrollPane(eventLogList);
        scrollPane.setBorder(BorderFactory.createLineBorder(new Color(68, 68, 68)));
        scrollPane.getViewport().setBackground(new Color(51, 51, 51));
        logPanel.add(scrollPane, BorderLayout.CENTER);
        
        // Listen for events to update log
        EventBus.getInstance().addEventListener(event -> {
            SwingUtilities.invokeLater(() -> {
                DefaultListModel<ThreadEvent> model = (DefaultListModel<ThreadEvent>) eventLogList.getModel();
                model.add(0, event);
                if (model.getSize() > 100) {
                    model.remove(100);
                }
            });
        });
        
        // Add components to split panes
        rightSplitPane.setLeftComponent(canvasPanel);
        rightSplitPane.setRightComponent(logPanel);
        
        mainSplitPane.setLeftComponent(controlsPanel);
        mainSplitPane.setRightComponent(rightSplitPane);
        
        return mainSplitPane;
    }
    
    private void onSimulationSelected(ActionEvent e) {
        if (running) {
            stopSimulation(null);
        }
        updateSimulationControls();
    }
    
    private void startSimulation(ActionEvent e) {
        if (currentSimulation != null && currentSimulation.isRunning()) {
            return;
        }
        
        // Get selected simulation
        int selectedIndex = simulationSelector.getSelectedIndex();
        if (selectedIndex >= 0 && selectedIndex < simulations.size()) {
            currentSimulation = simulations.get(selectedIndex);
            
            // Clear previous state
            canvas.reset();
            DefaultListModel<ThreadEvent> model = (DefaultListModel<ThreadEvent>) eventLogList.getModel();
            model.clear();
            
            // Start simulation
            currentSimulation.start();
            running = true;
            paused = false;
            updateButtonStates();
        }
    }
    
    private void pauseSimulation(ActionEvent e) {
        if (currentSimulation != null && currentSimulation.isRunning()) {
            if (currentSimulation.isPaused()) {
                currentSimulation.resume();
                paused = false;
            } else {
                currentSimulation.pause();
                paused = true;
            }
            updateButtonStates();
        }
    }
    
    private void stopSimulation(ActionEvent e) {
        if (currentSimulation != null && currentSimulation.isRunning()) {
            currentSimulation.stop();
            running = false;
            paused = false;
            updateButtonStates();
        }
    }
    
    private void resetSimulation(ActionEvent e) {
        // First stop the simulation if it's running
        if (currentSimulation != null && currentSimulation.isRunning()) {
            currentSimulation.stop();
            running = false;
            paused = false;
        }
        
        // Clear the visualization
        canvas.reset();
        
        // Clear the event log
        DefaultListModel<ThreadEvent> model = (DefaultListModel<ThreadEvent>) eventLogList.getModel();
        model.clear();
        
        // Reset simulation controls to default values
        updateSimulationControls();
        
        // Update button states
        updateButtonStates();
    }
    
    private void updateButtonStates() {
        startButton.setEnabled(!running);
        pauseButton.setEnabled(running);
        pauseButton.setText(paused ? "Resume" : "Pause");
        stopButton.setEnabled(running);
        resetButton.setEnabled(true); // Reset button always enabled
    }
    
    private void updateSimulationControls() {
        // Clear existing controls
        controlsPanel.removeAll();
        controlsPanel.setLayout(new BoxLayout(controlsPanel, BoxLayout.Y_AXIS));
        controlsPanel.setBorder(BorderFactory.createTitledBorder(
            BorderFactory.createLineBorder(new Color(68, 68, 68)),
            "Simulation Controls", 
            0, 
            0,
            new Font("Segoe UI", Font.BOLD, 14),
            new Color(232, 232, 232))
        );
        controlsPanel.setBackground(new Color(51, 51, 51));
        
        // Add simulation title
        int selectedIndex = simulationSelector.getSelectedIndex();
        if (selectedIndex >= 0 && selectedIndex < simulations.size()) {
            currentSimulation = simulations.get(selectedIndex);
            
            // Add simulation-specific controls
            if (currentSimulation instanceof ProducerConsumerSimulation) {
                addProducerConsumerControls((ProducerConsumerSimulation) currentSimulation);
            } else if (currentSimulation instanceof DiningPhilosophersSimulation) {
                addDiningPhilosophersControls((DiningPhilosophersSimulation) currentSimulation);
            } else if (currentSimulation instanceof ReaderWriterSimulation) {
                addReaderWriterControls((ReaderWriterSimulation) currentSimulation);
            }
        }
        
        controlsPanel.revalidate();
        controlsPanel.repaint();
    }
    
    private void addProducerConsumerControls(ProducerConsumerSimulation sim) {
        // Number of producers slider
        JSlider producerSlider = createSlider("Producers:", 1, 10, sim.getNumProducers());
        producerSlider.addChangeListener(e -> {
            if (!producerSlider.getValueIsAdjusting()) {
                sim.setNumProducers(producerSlider.getValue());
            }
        });
        
        // Number of consumers slider
        JSlider consumerSlider = createSlider("Consumers:", 1, 10, sim.getNumConsumers());
        consumerSlider.addChangeListener(e -> {
            if (!consumerSlider.getValueIsAdjusting()) {
                sim.setNumConsumers(consumerSlider.getValue());
            }
        });
        
        // Buffer size slider
        JSlider bufferSlider = createSlider("Buffer Size:", 1, 20, sim.getBufferSize());
        bufferSlider.addChangeListener(e -> {
            if (!bufferSlider.getValueIsAdjusting()) {
                sim.setBufferSize(bufferSlider.getValue());
            }
        });
        
        // Production rate slider
        JSlider prodRateSlider = createSlider("Production Rate (ms):", 200, 3000, sim.getProductionRate());
        prodRateSlider.addChangeListener(e -> {
            if (!prodRateSlider.getValueIsAdjusting()) {
                sim.setProductionRate(prodRateSlider.getValue());
            }
        });
        
        // Consumption rate slider
        JSlider consRateSlider = createSlider("Consumption Rate (ms):", 200, 3000, sim.getConsumptionRate());
        consRateSlider.addChangeListener(e -> {
            if (!consRateSlider.getValueIsAdjusting()) {
                sim.setConsumptionRate(consRateSlider.getValue());
            }
        });
    }
    
    private void addDiningPhilosophersControls(DiningPhilosophersSimulation sim) {
        // Number of philosophers slider
        JSlider philosopherSlider = createSlider("Philosophers:", 3, 10, sim.getNumPhilosophers());
        philosopherSlider.addChangeListener(e -> {
            if (!philosopherSlider.getValueIsAdjusting()) {
                sim.setNumPhilosophers(philosopherSlider.getValue());
            }
        });
        
        // Thinking time slider
        JSlider thinkingSlider = createSlider("Thinking Time (ms):", 500, 5000, sim.getThinkingTime());
        thinkingSlider.addChangeListener(e -> {
            if (!thinkingSlider.getValueIsAdjusting()) {
                sim.setThinkingTime(thinkingSlider.getValue());
            }
        });
        
        // Eating time slider
        JSlider eatingSlider = createSlider("Eating Time (ms):", 500, 5000, sim.getEatingTime());
        eatingSlider.addChangeListener(e -> {
            if (!eatingSlider.getValueIsAdjusting()) {
                sim.setEatingTime(eatingSlider.getValue());
            }
        });
        
        // Deadlock avoidance checkbox
        JCheckBox deadlockBox = new JCheckBox("Deadlock Avoidance");
        deadlockBox.setSelected(sim.isDeadlockAvoidance());
        deadlockBox.addActionListener(e -> sim.setDeadlockAvoidance(deadlockBox.isSelected()));
        deadlockBox.setAlignmentX(Component.LEFT_ALIGNMENT);
        controlsPanel.add(deadlockBox);
    }
    
    private void addReaderWriterControls(ReaderWriterSimulation sim) {
        // Number of readers slider
        JSlider readerSlider = createSlider("Readers:", 1, 10, sim.getNumReaders());
        readerSlider.addChangeListener(e -> {
            if (!readerSlider.getValueIsAdjusting()) {
                sim.setNumReaders(readerSlider.getValue());
            }
        });
        
        // Number of writers slider
        JSlider writerSlider = createSlider("Writers:", 1, 5, sim.getNumWriters());
        writerSlider.addChangeListener(e -> {
            if (!writerSlider.getValueIsAdjusting()) {
                sim.setNumWriters(writerSlider.getValue());
            }
        });
        
        // Read time slider
        JSlider readTimeSlider = createSlider("Read Time (ms):", 200, 3000, sim.getReadTime());
        readTimeSlider.addChangeListener(e -> {
            if (!readTimeSlider.getValueIsAdjusting()) {
                sim.setReadTime(readTimeSlider.getValue());
            }
        });
        
        // Write time slider
        JSlider writeTimeSlider = createSlider("Write Time (ms):", 200, 3000, sim.getWriteTime());
        writeTimeSlider.addChangeListener(e -> {
            if (!writeTimeSlider.getValueIsAdjusting()) {
                sim.setWriteTime(writeTimeSlider.getValue());
            }
        });
        
        // Writer priority checkbox
        JCheckBox priorityBox = new JCheckBox("Writer Priority");
        priorityBox.setSelected(sim.isWriterPriority());
        priorityBox.addActionListener(e -> sim.setWriterPriority(priorityBox.isSelected()));
        priorityBox.setAlignmentX(Component.LEFT_ALIGNMENT);
        controlsPanel.add(priorityBox);
    }
    
    private JSlider createSlider(String label, int min, int max, int value) {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setAlignmentX(Component.LEFT_ALIGNMENT);
        panel.setBackground(new Color(51, 51, 51));
        
        // Create a panel for the label and current value
        JPanel labelPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        labelPanel.setBackground(new Color(51, 51, 51));
        
        JLabel titleLabel = new JLabel(label);
        titleLabel.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        titleLabel.setForeground(new Color(232, 232, 232));
        labelPanel.add(titleLabel);
        
        // Value label to show current setting
        JLabel valueLabel = new JLabel(Integer.toString(value));
        valueLabel.setFont(new Font("Segoe UI", Font.BOLD, 14));
        valueLabel.setForeground(new Color(120, 190, 255));
        labelPanel.add(valueLabel);
        
        panel.add(labelPanel);
        
        // Create a panel for the slider and min/max values
        JPanel sliderWithRangePanel = new JPanel(new BorderLayout());
        sliderWithRangePanel.setBackground(new Color(51, 51, 51));
        sliderWithRangePanel.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        // Create slider with clean style
        JSlider slider = new JSlider(JSlider.HORIZONTAL, min, max, value);
        slider.setPaintTicks(false);
        slider.setPaintLabels(false);
        slider.setSnapToTicks(false);
        slider.setBackground(new Color(51, 51, 51));
        slider.setForeground(new Color(232, 232, 232));
        slider.putClientProperty("Slider.paintThumbArrowShape", Boolean.FALSE);
        
        // Add min/max labels below the slider
        JPanel rangePanel = new JPanel(new BorderLayout());
        rangePanel.setBackground(new Color(51, 51, 51));
        
        JLabel minLabel = new JLabel(Integer.toString(min));
        minLabel.setForeground(new Color(170, 170, 170));
        minLabel.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        
        JLabel maxLabel = new JLabel(Integer.toString(max));
        maxLabel.setForeground(new Color(170, 170, 170));
        maxLabel.setFont(new Font("Segoe UI", Font.PLAIN, 11));
        maxLabel.setHorizontalAlignment(SwingConstants.RIGHT);
        
        rangePanel.add(minLabel, BorderLayout.WEST);
        rangePanel.add(maxLabel, BorderLayout.EAST);
        
        sliderWithRangePanel.add(slider, BorderLayout.CENTER);
        sliderWithRangePanel.add(rangePanel, BorderLayout.SOUTH);
        
        // Update value label when slider changes
        slider.addChangeListener(e -> {
            valueLabel.setText(Integer.toString(slider.getValue()));
        });
        
        panel.add(sliderWithRangePanel);
        
        controlsPanel.add(panel);
        controlsPanel.add(Box.createVerticalStrut(15));
        
        return slider;
    }
    
    /**
     * Custom cell renderer for displaying thread events in the log
     */
    private static class ThreadEventRenderer extends DefaultListCellRenderer {
        @Override
        public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
            super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
            
            if (value instanceof ThreadEvent) {
                ThreadEvent event = (ThreadEvent) value;
                setText(String.format("%s: %s - %s", 
                        event.getThreadName(), 
                        event.getType().toString(), 
                        event.getMessage()));
                
                if (!isSelected) {
                    // Set colors based on event type
                    switch (event.getType()) {
                        case THREAD_CREATED:
                        case THREAD_STARTED:
                            setForeground(new Color(106, 135, 89)); // Green
                            break;
                        case THREAD_TERMINATED:
                            setForeground(new Color(204, 120, 50)); // Orange
                            break;
                        case LOCK_ACQUIRED:
                            setForeground(new Color(104, 151, 187)); // Blue
                            break;
                        case LOCK_RELEASED:
                            setForeground(new Color(152, 118, 170)); // Purple
                            break;
                        case LOCK_WAITING:
                            setForeground(new Color(187, 181, 41)); // Yellow
                            break;
                        case DEADLOCK_DETECTED:
                            setForeground(new Color(204, 120, 50)); // Orange
                            break;
                        default:
                            setForeground(new Color(232, 232, 232)); // Default light text
                    }
                    setBackground(new Color(51, 51, 51));
                }
            }
            
            setFont(new Font("Segoe UI", Font.PLAIN, 12));
            setBorder(BorderFactory.createEmptyBorder(4, 8, 4, 8));
            return this;
        }
    }
    
    // Helper methods for creating styled components
    private JButton createButton(String text, Color bgColor) {
        JButton button = new JButton(text);
        button.setBackground(bgColor);
        button.setForeground(new Color(232, 232, 232));
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        button.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        button.setPreferredSize(new Dimension(80, 30));
        return button;
    }
    
    private JSeparator createVerticalSeparator() {
        JSeparator separator = new JSeparator(JSeparator.VERTICAL);
        separator.setPreferredSize(new Dimension(1, 30));
        separator.setForeground(new Color(68, 68, 68));
        return separator;
    }
    
    private JSeparator createHorizontalSeparator() {
        JSeparator separator = new JSeparator(JSeparator.HORIZONTAL);
        separator.setForeground(new Color(68, 68, 68));
        return separator;
    }
} 