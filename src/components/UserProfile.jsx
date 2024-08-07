import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  Button,
  IconButton,
  Input,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, ChatIcon, EditIcon } from '@chakra-ui/icons';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const UserProfile = ({ user, isOpen, onClose, onChatClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setEditedUser({ ...user });
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${user._id}`, editedUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update profile.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setIsUploading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/upload-photo`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEditedUser(prev => ({ ...prev, photo: response.data.photoUrl }));
      toast({
        title: 'Photo Uploaded',
        description: 'Your profile photo has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload photo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onClose}
              variant="ghost"
              aria-label="Go back"
            />
            <Text>{editedUser.username}'s Profile</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box position="relative">
              <Image
                src={editedUser.photo || 'https://via.placeholder.com/200'}
                alt={editedUser.username}
                borderRadius="full"
                boxSize="200px"
                objectFit="cover"
                mx="auto"
              />
              <input
                type="file"
                id="photo-upload"
                hidden
                onChange={handlePhotoUpload}
                accept="image/*"
              />
              <Button
                as="label"
                htmlFor="photo-upload"
                position="absolute"
                bottom="0"
                right="50%"
                transform="translateX(50%)"
                size="sm"
                colorScheme="blue"
                isLoading={isUploading}
              >
                Change Photo
              </Button>
            </Box>
            <Badge colorScheme={editedUser.isOnline ? "green" : "red"} alignSelf="center">
              {editedUser.isOnline ? "Online" : "Offline"}
            </Badge>
            {isEditing ? (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="fullName"
                    value={editedUser.fullName}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Age</FormLabel>
                  <Input
                    name="age"
                    type="number"
                    value={editedUser.age}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    name="gender"
                    value={editedUser.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    name="title"
                    value={editedUser.title}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input
                    name="description"
                    value={editedUser.description}
                    onChange={handleChange}
                  />
                </FormControl>
              </VStack>
            ) : (
              <VStack spacing={2} align="center">
                <Text fontSize="xl" fontWeight="bold">{editedUser.fullName}</Text>
                <Text>Age: {editedUser.age}</Text>
                <Text>Gender: {editedUser.gender}</Text>
                <Text>{editedUser.title}</Text>
                <Text>{editedUser.description}</Text>
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          {isEditing ? (
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
            </Button>
          ) : (
            <Button leftIcon={<EditIcon />} onClick={handleEdit} mr={3}>
              Edit Profile
            </Button>
          )}
          <Button
            colorScheme="green"
            onClick={() => onChatClick(editedUser)}
            leftIcon={<ChatIcon />}
          >
            Chat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserProfile;