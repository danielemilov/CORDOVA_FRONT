// Settings.jsx
import React, { useState, useEffect } from 'react';
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
import api from '../api';

function Settings({ user, setUser }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    title: '',
    description: '',
    age: '',
    gender: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        title: user.title || '',
        description: user.description || '',
        age: user.age || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/users/${user._id}`, formData);
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
// Settings.jsx (continued)

const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('photo', file);

  setIsUploading(true);
  try {
    const response = await api.post('/api/users/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="age">Age</FormLabel>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="gender">Gender</FormLabel>
            <Input
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
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