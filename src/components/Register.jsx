import React, { useState } from 'react';
import {
  VStack,
  Input,
  Button,
  Heading,
  Box,
  Text,
  useToast,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import FaceVerification from './FaceVerification';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!uploadedImage || !capturedImage) {
      setError('Please complete face verification first');
      return;
    }
    setLoading(true);
    setError('');
  
    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('fullName', formData.fullName);
  
    // Handle file upload
    if (capturedImage) {
      const file = dataURItoFile(capturedImage, 'capturedImage.jpg');
      formDataToSend.append('photo', file);
      console.log('Form data being sent:', Object.fromEntries(formDataToSend));
    }
  
    try {
      const response = await axios.post('http://localhost:4000/api/auth/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
  
      console.log('Registration response:', response.data);
  
      toast({
        title: 'Registration Successful',
        description: 'You have been successfully registered.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error.response ? error.response.data : error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleVerificationComplete = (uploaded, captured) => {
    setUploadedImage(uploaded);
    setCapturedImage(captured);
    onClose();
  };

  const dataURItoFile = (dataURI, filename) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mimeString });
  };

  return (
    <VStack spacing={8} align="stretch" w="100%" maxW="md" mx="auto" mt={8}>
      <Heading textAlign="center">Register</Heading>
      <Box as="form" onSubmit={handleRegister}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </FormControl>

          <Divider />

          <Button onClick={onOpen} colorScheme="blue">
            {uploadedImage && capturedImage ? 'Retake Face Verification' : 'Start Face Verification'}
          </Button>

          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}

          <Button type="submit" colorScheme="teal" isLoading={loading} loadingText="Registering">
            Register
          </Button>
        </VStack>
      </Box>

      {isOpen && (
        <FaceVerification
          onVerificationComplete={handleVerificationComplete}
          onClose={onClose}
        />
      )}
    </VStack>
  );
}

export default Register;