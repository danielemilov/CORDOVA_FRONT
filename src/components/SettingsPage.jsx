import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import api from '../api';

const SettingsPage = ({ user, setUser, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    description: '',
    age: '',
    gender: '',
  });
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
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
      toast({
        title: 'Profile updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: error.response?.data?.message || 'Unable to update profile.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input name="fullName" value={formData.fullName} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input name="title" value={formData.title} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input name="description" value={formData.description} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Age</FormLabel>
                <Input name="age" type="number" value={formData.age} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Input name="gender" value={formData.gender} onChange={handleChange} />
              </FormControl>
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            AAAAAAAAAAAAA
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsPage;