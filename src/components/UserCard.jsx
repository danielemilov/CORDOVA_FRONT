import React, { memo } from 'react';
import { Box, Image, Text, Badge, IconButton, HStack, VStack, Tooltip } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';

const UserCard = memo(({ user, onUserClick, onChatClick }) => (
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
        <Text fontSize="xs" color="gray.500" noOfLines={1}>
          {user.location || 'No location'}
        </Text>
        {user.distance !== null && (
          <Text fontSize="xs" color="gray.500">
            {user.distance.toFixed(1)} km away
          </Text>
        )}
      </VStack>
      <Tooltip label={user.isOnline ? 'Online' : 'Offline'} placement="top">
        <Badge 
          colorScheme={user.isOnline ? 'green' : 'red'} 
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
));

UserCard.displayName = 'UserCard';

export default UserCard;