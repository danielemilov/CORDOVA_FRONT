import styled, { createGlobalStyle } from 'styled-components';
import { extendTheme } from "@chakra-ui/react";
// Define global styles for your application
export const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Inter', sans-serif;
    background-color: #f5f5f5;
    color: #333;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  *, *::before, *::after {
    box-sizing: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
    padding: 0;
  }
`;

// Define a card component with styled-components
export const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

// Define an avatar component
export const Avatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
`;

// Define a username component
export const Username = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

// Define a description component
export const Description = styled.p`
  font-size: 14px;
  color: #666;
  margin: 5px 0;
`;

// Define a status dot component to show online status
export const StatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
  background-color: ${props => props.online ? '#4CAF50' : '#9E9E9E'};
`;

// Define a distance component
export const Distance = styled.span`
  font-size: 12px;
  color: #888;
`;

// Define a button component
export const Button = styled.button`
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #555;
  }
`;

const theme = extendTheme({
  colors: {
    brand: {
      500: "#333", // You can customize this
    },
  },
  // Add any other theme customizations here
});

export default theme;