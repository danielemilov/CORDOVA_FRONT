// Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  useToast,
  Box,
} from '@chakra-ui/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={90} p={6} borderRadius="2xl" boxShadow="2xl" bg="white">
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Heading color="brand.600">MEET ME</Heading>
        <Heading color="lightblue">Login</Heading>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </FormControl>
        <Button
          type="submit"
          colorScheme="brand"
          width="full"
          size="lg"
          isLoading={isLoading}
          loadingText="Logging in"
          boxShadow="md"
          _hover={{ boxShadow: 'lg' }}
        >
          Login
        </Button>
        <Text>
          Don't have an account?{' '}
          <Button variant="link" colorScheme="brand" onClick={() => navigate('/register')}>
            Register
          </Button>
        </Text>
      </VStack>
    </Box>
  );
}

export default Login;