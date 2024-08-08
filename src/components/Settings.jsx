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
  IconButton,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import api from '../api';

function Settings({ user, setUser, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    description: '',
    age: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
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
      const response = await api.put(`/api/users/profile`, formData);
      setUser(response.data);
      toast({
        title: "Profile Updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center">
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onClose}
              variant="ghost"
              mr={2}
              aria-label="Go back"
            />
            <Heading size="lg">Settings</Heading>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Flex direction="column" align="center">
              <Avatar size="2xl" name={user.username} src={user.photo} mb={4} />
              <FormControl>
                <FormLabel htmlFor="photo" cursor="pointer" mb={2}>
                  <Button as="span" colorScheme="blue" size="sm">
                    Change Profile Photo
                  </Button>
                </FormLabel>
                <Input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                  display="none"
                />
              </FormControl>
            </Flex>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
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
                <Button type="submit" colorScheme="blue" width="full">
                  Save Changes
                </Button>
              </VStack>
            </form>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default Settings;