import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Box, VStack, HStack, Text, Avatar, Badge, Spinner, useToast } from '@chakra-ui/react';
import api from '../api';
import { useSocket } from '../contexts/SocketContext';
import { format } from 'date-fns';

const ConversationItem = styled(Box)`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const UnreadBadge = styled(Badge)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  border-radius: 50%;
  padding: 0.25rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Conversations = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();
  const toast = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('private message', handleNewMessage);
      return () => {
        socket.off('private message', handleNewMessage);
      };
    }
  }, [socket]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch conversations",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setConversations((prevConversations) => {
      const updatedConversations = prevConversations.map((conv) => {
        if (conv.user._id === message.sender._id || conv.user._id === message.recipient._id) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount: conv.user._id === message.sender._id ? conv.unreadCount + 1 : conv.unreadCount,
          };
        }
        return conv;
      });
      return updatedConversations;
    });
  };

  const formatLastMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
      </Box>
    );
  }

  return (
    <VStack spacing={0} align="stretch">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.user._id}
          onClick={() => onSelectConversation(conversation.user)}
          position="relative"
        >
          <HStack spacing={4}>
            <Avatar
              src={conversation.user.photo}
              name={conversation.user.username}
            />
            <Box flex={1}>
              <HStack justify="space-between">
                <Text fontWeight="bold">{conversation.user.username}</Text>
                <Text fontSize="xs" color="gray.500">
                  {formatLastMessageTime(conversation.lastMessage.timestamp)}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                {conversation.lastMessage.content}
              </Text>
            </Box>
            {conversation.unreadCount > 0 && (
              <UnreadBadge colorScheme="red">
                {conversation.unreadCount}
              </UnreadBadge>
            )}
          </HStack>
        </ConversationItem>
      ))}
    </VStack>
  );
};

export default Conversations;
