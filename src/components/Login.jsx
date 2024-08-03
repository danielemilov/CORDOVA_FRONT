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
      const response = await axios.post('http://localhost:4000/api/auth/login', { email, password });
      
      if (response.data && response.data.user && response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        
        toast({
          title: 'Login Successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        navigate('/chat');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: 'Login Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }}

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderRadius="2xl" boxShadow="2xl" bg="white">
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Heading color="brand.600">Login</Heading>
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