import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Image, Text, Badge, IconButton, useToast } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import axios from 'axios';

const UserCard = ({ user, onChatClick }) => (
  <Box 
    borderWidth="1px" 
    borderRadius="lg" 
    overflow="hidden" 
    position="relative"
    boxShadow="md" 
    transition="all 0.3s" 
    _hover={{ boxShadow: "xl" }}
  >
    <Image 
      src={user.photo || 'https://via.placeholder.com/150'} 
      alt={user.username} 
      objectFit="cover" 
      height="200px" 
      width="100%" 
    />
    <Box p="4">
      <Text fontWeight="bold" fontSize="lg">{user.username}</Text>
      <Text fontSize="sm" color="gray.600">{user.title || 'No title'}</Text>
      <Text fontSize="sm" color="gray.600">{user.location || 'No location'}</Text>
      <Text fontSize="sm" color="gray.600">Age: {user.age || 'N/A'}</Text>
    </Box>
    <Badge
      colorScheme={user.isOnline ? "green" : "red"}
      position="absolute"
      top="2"
      right="2"
      fontSize="0.8em"
      px="2"
      borderRadius="full"
    >
      {user.isOnline ? "Online" : "Offline"}
    </Badge>
    <IconButton
      aria-label="Chat"
      icon={<ChatIcon />}
      position="absolute"
      bottom="2"
      right="2"
      onClick={() => onChatClick(user)}
      colorScheme="blue"
    />
  </Box>
);

const UserGrid = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: error.response?.data?.message || "An error occurred while fetching users.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChatClick = useCallback((user) => {
    // Implement chat opening logic here
    console.log('Open chat with:', user.username);
    // You might want to use a router to navigate to a chat page, or open a chat modal
    // For example: history.push(`/chat/${user._id}`);
  }, []);

  if (isLoading) {
    return <Box textAlign="center">Loading users...</Box>;
  }

  const filteredUsers = users.filter(user => user._id !== currentUser._id);

  if (filteredUsers.length === 0) {
    return <Box textAlign="center">No other users found.</Box>;
  }

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6} p={4}>
      {filteredUsers.map(user => (
        <UserCard key={user._id} user={user} onChatClick={handleChatClick} />
      ))}
    </Grid>
  );
};

export default UserGrid;