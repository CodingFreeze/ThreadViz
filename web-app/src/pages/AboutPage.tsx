import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const AboutContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const AboutTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #2196F3;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 40px;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
`;

const SectionContent = styled.div`
  color: #555;
  line-height: 1.8;
  font-size: 1.1rem;
  
  p {
    margin-bottom: 15px;
  }

  ul {
    margin-left: 20px;
    margin-bottom: 15px;
  }

  li {
    margin-bottom: 8px;
  }
`;

const Button = styled(Link)`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  align-self: center;
  margin-top: 20px;
  
  &:hover {
    background-color: #388E3C;
    transform: translateY(-2px);
  }
`;

const AuthorSection = styled.div`
  background-color: #f5f5f5;
  border-left: 4px solid #2196F3;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 0 8px 8px 0;
`;

const AboutPage: React.FC = () => {
  return (
    <AboutContainer>
      <AboutTitle>About ThreadViz</AboutTitle>
      
      <AuthorSection>
        <p>
          ThreadViz is a side project developed by a passionate computer science college student
          with a deep interest in operating systems and concurrent programming. This project
          represents a step in my journey to build an operating system from the ground up,
          helping me visualize and understand critical concurrency concepts that form the
          foundation of modern OS design.
        </p>
      </AuthorSection>
      
      <Section>
        <SectionTitle>Project Overview</SectionTitle>
        <SectionContent>
          <p>
            ThreadViz is an interactive educational tool designed to help developers, students, and educators
            understand complex concurrency concepts through visual simulation. By providing real-time
            visualizations of classic concurrency problems, ThreadViz makes abstract multithreading concepts
            more tangible and easier to comprehend.
          </p>
          <p>
            Whether you're a student learning about operating systems, a developer trying to understand
            thread synchronization, or an educator teaching concurrent programming, ThreadViz offers an
            intuitive interface to explore the dynamics of parallel execution.
          </p>
        </SectionContent>
      </Section>
      
      <Section>
        <SectionTitle>Learning Objectives</SectionTitle>
        <SectionContent>
          <p>ThreadViz helps users understand:</p>
          <ul>
            <li>Thread states and lifecycles in concurrent applications</li>
            <li>Resource allocation and sharing between threads</li>
            <li>Deadlock causes, detection, and prevention strategies</li>
            <li>Synchronization mechanisms (mutexes, semaphores, barriers, etc.)</li>
            <li>Patterns for efficient concurrent programming</li>
            <li>Race conditions and how to avoid them</li>
          </ul>
        </SectionContent>
      </Section>
      
      <Section>
        <SectionTitle>Technology Stack</SectionTitle>
        <SectionContent>
          <p>ThreadViz is built using modern web technologies:</p>
          <ul>
            <li>React for the user interface</li>
            <li>TypeScript for type-safe JavaScript code</li>
            <li>Styled Components for component styling</li>
            <li>Canvas API for thread visualization</li>
          </ul>
        </SectionContent>
      </Section>
      
      <Section>
        <SectionTitle>How to Use</SectionTitle>
        <SectionContent>
          <p>Using ThreadViz is simple:</p>
          <ol>
            <li>Select a simulation type from the available options</li>
            <li>Configure parameters like thread count, resource count, and speed</li>
            <li>Start the simulation and observe thread behavior</li>
            <li>Use controls to pause, resume, or reset as needed</li>
            <li>Read the event log to track detailed thread state changes</li>
          </ol>
          <p>
            Experiment with different configurations to see how they affect thread behavior and
            potential race conditions or deadlocks.
          </p>
        </SectionContent>
      </Section>
      
      <Section>
        <SectionTitle>The Bigger Picture: OS Development</SectionTitle>
        <SectionContent>
          <p>
            This visualization tool is part of my broader educational journey toward building an 
            operating system from scratch as a summer project. By implementing and visualizing 
            these concurrency patterns, I'm developing a deeper understanding of:
          </p>
          <ul>
            <li>Thread scheduling and management</li>
            <li>Resource allocation strategies</li>
            <li>Inter-process communication techniques</li>
            <li>Memory management and protection</li>
            <li>Synchronization primitives implementation</li>
          </ul>
          <p>
            Stay tuned for more details about my upcoming OS development project. I'll be sharing 
            the architecture, design decisions, implementation challenges, and educational resources 
            that emerge from this journey.
          </p>
        </SectionContent>
      </Section>
      
      <Button to="/simulation">Try It Now</Button>
    </AboutContainer>
  );
};

export default AboutPage; 