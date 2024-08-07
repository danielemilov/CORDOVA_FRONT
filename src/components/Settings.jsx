import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Avatar,
  Center,
} from '@chakra-ui/react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function Settings({ user, setUser }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${user._id}`, 
        { fullName, email },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast({
        title: "Profile Updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setIsUploading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/upload-photo`, 
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setUser(prevUser => ({ ...prevUser, photo: response.data.photoUrl }));
      localStorage.setItem('user', JSON.stringify({ ...user, photo: response.data.photoUrl }));
      toast({
        title: "Photo Updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update photo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <VStack spacing={6}>
        <Heading>Settings</Heading>
        <Center>
          <Avatar size="2xl" name={user.fullName} src={user.photo} />
        </Center>
        <FormControl>
          <FormLabel htmlFor="photo">Change Profile Photo</FormLabel>
          <Input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={isUploading}
          />
        </FormControl>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel htmlFor="fullName">Full Name</FormLabel>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full">
              Save Changes
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}

export default Settings;