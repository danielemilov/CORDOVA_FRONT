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
  Text,
  Flex,
} from '@chakra-ui/react';
import styled from 'styled-components';
import api from '../api';

const SettingsWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f7f7f7;
  overflow-y: auto;
  padding: 20px;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const SettingsForm = styled.form`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StyledInput = styled(Input)`
  background-color: #f0f0f0;
  border: none;
  border-radius: 25px;
  padding: 10px 15px;
`;

const StyledButton = styled(Button)`
  background-color: #333;
  color: #27b600;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #555;
  }
`;

function Settings({ user, setUser, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    description: '',
    age: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        description: user.description || '',
        age: user.age || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/api/users/profile', formData);
      setUser(response.data.user);
      onClose(response.data.user);
    } catch (error) {
      console.error('Error updating profile:', error);
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
      const response = await api.post('/api/users/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(prevUser => ({ ...prevUser, photo: response.data.user.photo }));
      toast({
        title: "Photo Updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
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

  if (!isOpen) return null;

  return (
    <SettingsWrapper>
      <CloseButton onClick={onClose}>&times;</CloseButton>
      <SettingsForm onSubmit={handleSubmit}>
        <VStack spacing={6}>
          <Heading as="h2" size="xl" textAlign="center">Edit Profile</Heading>
          
          <Flex direction="column" align="center">
            <Avatar size="2xl" name={user.username} src={user.photo} mb={4} />
            <FormControl>
              <FormLabel htmlFor="photo" cursor="pointer">
                <StyledButton as="span">
                  {isUploading ? 'Uploading...' : 'Change Profile Photo'}
                </StyledButton>
              </FormLabel>
              <Input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoUpload}
                hidden
              />
            </FormControl>
          </Flex>

          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <StyledInput
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="description">Description</FormLabel>
            <StyledInput
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="age">Age</FormLabel>
            <StyledInput
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
            />
          </FormControl>

          <StyledButton type="submit" width="full">
            Save Changes
          </StyledButton>
        </VStack>
      </SettingsForm>
    </SettingsWrapper>
  );
}

export default Settings;