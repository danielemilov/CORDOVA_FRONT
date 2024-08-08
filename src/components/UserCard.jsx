import React from 'react';
import { Box, Image, Text, Badge, IconButton, HStack, VStack, Tooltip } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'Unknown distance';
  if (distance < 1) return 'Less than 1 km away';
  if (distance < 10) return `${distance.toFixed(1)} km away`;
  return `${Math.round(distance)} km away`;
};

const UserCard = ({ user, onUserClick, onChatClick }) => (
  <Box 
    borderWidth="1px" 
    borderRadius="lg" 
    overflow="hidden" 
    position="relative" 
    onClick={() => onUserClick(user)} 
    cursor="pointer" 
    transition="all 0.2s" 
    _hover={{ transform: 'scale(1.02)', boxShadow: 'md' }} 
    bg="white" 
    w="100%"
  >
    <HStack spacing={4} p={4}>
      <Image 
        src={user.photo || 'https://via.placeholder.com/100'} 
        alt={user.username} 
        objectFit="cover" 
        boxSize="60px" 
        borderRadius="full" 
        fallbackSrc="https://via.placeholder.com/100"
      />
      <VStack align="start" flex={1} spacing={1}>
        <Text fontWeight="bold" fontSize="md">
          {user.username}
        </Text>
        <Text fontSize="sm" color="gray.600" noOfLines={1}>
          {user.title || 'No title'}
        </Text>
        <Text fontSize="xs" color="gray.500">
          📍 {formatDistance(user.distance)}
        </Text>
      </VStack>
      <Tooltip label={user.isOnline ? 'Online' : 'Offline'} placement="top">
        <Badge 
          colorScheme={user.isOnline ? "green" : "red"} 
          position="absolute" 
          top="2" 
          right="2"
        >
          {user.isOnline ? 'Online' : 'Offline'}
        </Badge>
      </Tooltip>
      <IconButton
        aria-label="Chat"
        icon={<ChatIcon />}
        onClick={(e) => {
          e.stopPropagation();
          onChatClick(user);
        }}
        size="sm"
        colorScheme="teal"
      />
    </HStack>
  </Box>
);

export default UserCard;