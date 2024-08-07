import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, ChatIcon } from '@chakra-ui/icons';

const UserProfile = ({ user, isOpen, onClose, onChatClick }) => {
  if (!isOpen) return null;

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="white" zIndex={1000}>
      <VStack align="stretch" h="100%">
        <Box p={4} bg="black" color="white">
          <HStack>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onClose}
              variant="ghost"
              color="white"
              aria-label="Go back"
            />
            <Text fontWeight="bold">{user.username}'s Profile</Text>
          </HStack>
        </Box>
        <VStack spacing={4} p={4} overflowY="auto">
          <Image
            src={user.photo || 'https://via.placeholder.com/200'}
            alt={user.username}
            borderRadius="full"
            boxSize="200px"
            objectFit="cover"
          />
          <Text fontWeight="bold" fontSize="2xl">{user.fullName || user.username}</Text>
          <Badge colorScheme={user.isOnline ? "green" : "red"} fontSize="md" px={2} py={1}>
            {user.isOnline ? "Online" : "Offline"}
          </Badge>
          <VStack spacing={2} align="center" w="100%">
            {user.title && (
              <Text fontSize="lg" fontWeight="medium" color="gray.700">
                {user.title}
              </Text>
            )}
            {user.location && (
              <Text fontSize="md" color="gray.600">
                📍 {user.location}
              </Text>
            )}
            {user.age && (
              <Text fontSize="md" color="gray.600">
                🎂 {user.age} years old
              </Text>
            )}
          </VStack>
          {user.description && (
            <Box w="100%" bg="gray.50" p={4} borderRadius="md">
              <Text fontSize="md" color="gray.700" textAlign="center">
                {user.description}
              </Text>
            </Box>
          )}
          <Button
            colorScheme="green"
            w="100%"
            size="lg"
            onClick={() => onChatClick(user)}
            leftIcon={<ChatIcon />}
          >
            Chat with {user.username}
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default UserProfile;