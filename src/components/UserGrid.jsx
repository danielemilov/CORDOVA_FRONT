// UserGrid.jsx
import React, { useState, useEffect } from 'react';
import { Box, Grid, Image, Text, Badge, IconButton } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import axios from 'axios';

const UserCard = ({ user, onChatClick }) => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" position="relative">
    <Image src={user.photo} alt={user.username} />
    <Box p="2">
      <Text fontWeight="bold">{user.username}</Text>
      <Text fontSize="sm">{user.title}</Text>
      <Text fontSize="sm">{user.location}</Text>
      <Text fontSize="sm">Age: {user.age}</Text>
    </Box>
    <Badge 
      colorScheme={user.isOnline ? "green" : "red"} 
      position="absolute" 
      top="2" 
      right="2"
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
    />
  </Box>
);

const UserGrid = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleChatClick = (user) => {
    // Implement chat opening logic here
    console.log('Open chat with:', user.username);
  };

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
      {users.map(user => (
        <UserCard key={user._id} user={user} onChatClick={handleChatClick} />
      ))}
    </Grid>
  );
};

export default UserGrid;