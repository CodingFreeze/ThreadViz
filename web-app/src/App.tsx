import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import SimulationPage from './pages/SimulationPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: #2196F3;
  color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  margin-right: 30px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 20px;
  padding-bottom: 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 20;
`;

const Footer = styled.footer`
  background-color: #f5f5f5;
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: auto;
  position: relative;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const FooterContent = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const GitHubLink = styled.a`
  color: #333;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  
  &:hover {
    color: #2196F3;
  }
`;

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

function App() {
  return (
    <Router>
      <AppContainer>
        <Header>
          <Nav>
            <Logo>ThreadViz</Logo>
            <NavLinks>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/simulation">Simulation</NavLink>
              <NavLink to="/about">About</NavLink>
            </NavLinks>
          </Nav>
        </Header>
        
        <Content>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Content>
        
        <Footer>
          <FooterContent>
            Copyright &copy; {new Date().getFullYear()} CodingFreeze 
            <GitHubLink href="https://github.com/CodingFreeze" target="_blank" rel="noopener noreferrer">
              <GitHubIcon />
            </GitHubLink>
          </FooterContent>
        </Footer>
      </AppContainer>
    </Router>
  );
}

export default App;
