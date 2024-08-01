import React, { useState } from 'react';
import { VStack, Input, Button, Heading, Box, Text, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const API_URL = 'http://localhost:4000'; // Update this if your server is running on a different port

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
  
    setLoading(true);
    setError('');
  
    console.log('Attempting login with:', { email, password }); // Log the credentials being sent
  
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, 
        { email, password },
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
  

      if (response.data && response.data.user && response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate('/chat');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed', error.response?.data || error);
      setError(error.response?.data?.message || 'An error occurred during login');
      toast({
        title: "Login failed",
        description: error.response?.data?.message || 'An error occurred during login',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch" w="100%" maxW="md" mx="auto" mt={8}>
      <Heading>Login</Heading>
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
          />
          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}
          <Button type="submit" colorScheme="teal" isLoading={loading} loadingText="Logging in">
            Login
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}

export default Login;