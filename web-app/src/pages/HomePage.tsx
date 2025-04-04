import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
`;

const HomeTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  color: #2196F3;
  text-align: center;
`;

const HomeSubtitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 40px;
  color: #666;
  text-align: center;
  max-width: 800px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin: 40px 0 20px;
  color: #2196F3;
  text-align: center;
  width: 100%;
`;

const SectionDescription = styled.p`
  color: #666;
  line-height: 1.8;
  text-align: center;
  max-width: 800px;
  margin-bottom: 30px;
  font-size: 1.1rem;
`;

const FeaturesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #2196F3;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const Button = styled(Link)`
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StartButton = styled(Button)`
  background-color: #4CAF50;
  color: white;
  
  &:hover {
    background-color: #388E3C;
  }
`;

const AboutButton = styled(Button)`
  background-color: #2196F3;
  color: white;
  
  &:hover {
    background-color: #1976D2;
  }
`;

const Divider = styled.hr`
  width: 80%;
  margin: 40px 0;
  border: none;
  height: 1px;
  background-color: #e0e0e0;
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <HomeTitle>ThreadViz</HomeTitle>
      <HomeSubtitle>
        An interactive concurrency visualization tool for understanding multithreading behavior and patterns
      </HomeSubtitle>
      
      <SectionDescription>
        ThreadViz helps you learn and understand complex concurrency concepts through interactive visualizations.
        Watch threads interact in real-time, observe resource allocation, and gain insights into synchronization
        mechanisms used in modern software systems.
      </SectionDescription>
      
      <ButtonContainer>
        <StartButton to="/simulation">Start Visualizing</StartButton>
        <AboutButton to="/about">Learn More</AboutButton>
      </ButtonContainer>
      
      <Divider />
      
      <SectionTitle>Available Simulations</SectionTitle>
      <SectionDescription>
        Explore these classic concurrency problems and patterns through our interactive visualizations.
        Each simulation demonstrates different aspects of multithreaded programming.
      </SectionDescription>
      
      <FeaturesContainer>
        <FeatureCard>
          <FeatureTitle>Producer-Consumer</FeatureTitle>
          <FeatureDescription>
            Visualize multiple producers adding items to a bounded buffer while consumers remove them. Understand synchronization mechanisms for thread coordination.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Dining Philosophers</FeatureTitle>
          <FeatureDescription>
            Explore the classic concurrency problem where philosophers share limited resources, demonstrating deadlock scenarios and resource allocation strategies.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Reader-Writer</FeatureTitle>
          <FeatureDescription>
            See how concurrent read access with exclusive write access to a shared resource works. Understand the pattern for efficient concurrent data access.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Barrier Synchronization</FeatureTitle>
          <FeatureDescription>
            Observe how threads can coordinate to reach a synchronization point before collectively proceeding. Understand thread coordination in parallel algorithms.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Sleeping Barber</FeatureTitle>
          <FeatureDescription>
            Explore this classic concurrency problem modeling a barber shop with limited waiting capacity. Visualize producer-consumer concepts with service dynamics.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Cigarette Smokers</FeatureTitle>
          <FeatureDescription>
            Discover this interesting synchronization challenge where smokers with different resources must coordinate to create cigarettes. Analyze resource allocation problems.
          </FeatureDescription>
        </FeatureCard>
      </FeaturesContainer>
      
      <Divider />
      
      <SectionTitle>Key Features</SectionTitle>
      <SectionDescription>
        ThreadViz offers powerful tools to help you understand concurrency concepts.
      </SectionDescription>
      
      <FeaturesContainer>
        <FeatureCard>
          <FeatureTitle>Real-time Visualization</FeatureTitle>
          <FeatureDescription>
            Watch threads in action with color-coded states and dynamic positioning. See relationships between threads and shared resources visually.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Event Logging</FeatureTitle>
          <FeatureDescription>
            Track thread state changes with a detailed event log. Understand the sequence of operations and transitions in concurrent systems.
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>Configurable Parameters</FeatureTitle>
          <FeatureDescription>
            Adjust simulation parameters like thread count, execution delays, and buffer sizes to experiment with different scenarios.
          </FeatureDescription>
        </FeatureCard>
      </FeaturesContainer>
      
      <StartButton to="/simulation">Start Visualizing</StartButton>
    </HomeContainer>
  );
};

export default HomePage; 