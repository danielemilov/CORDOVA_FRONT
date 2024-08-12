import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Box, VStack, HStack, Text, Avatar, Badge, Spinner, useToast, Button } from '@chakra-ui/react';
import api from '../api';
import { useSocket } from '../contexts/SocketContext';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

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

const LastMessage = styled(Text)`
  font-weight: ${props => props.unread ? 'bold' : 'normal'};
`;

const Conversations = ({ onSelectConversation, filter }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();
  const toast = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching conversations...');
      const response = await api.get('/api/messages/conversations');
      console.log('Conversations response:', response.data);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to fetch conversations');
      toast({
        title: "Error",
        description: "Failed to fetch conversations. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (socket) {
      socket.on('private message', handleNewMessage);
      return () => {
        socket.off('private message', handleNewMessage);
      };
    }
  }, [socket]);

  useEffect(() => {
    console.log('Current conversations state:', conversations);
  }, [conversations]);

  useEffect(() => {
    console.log('Current conversations state:', conversations);
    if (conversations.length === 0) {
      console.log('No conversations found. This could be due to:');
      console.log('1. The user has no messages');
      console.log('2. There\'s an issue with the aggregation pipeline');
      console.log('3. The conversations are not being properly returned from the server');
    }
  }, [conversations]);

  const handleNewMessage = useCallback((message) => {
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
  }, []);

  const formatLastMessageTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMM d');
    }
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
      conv.user.username.toLowerCase().includes(filter.toLowerCase()) ||
      (conv.lastMessage.content && conv.lastMessage.content.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [conversations, filter]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Text color="red.500">{error}</Text>
        <Button mt={2} onClick={fetchConversations}>Retry</Button>
      </Box>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Text>No conversations found</Text>
        <Button mt={2} onClick={fetchConversations}>Refresh</Button>
      </Box>
    );
  }

  return (
    <VStack spacing={0} align="stretch">
      {filteredConversations.map((conversation) => (
        <ConversationItem
          key={conversation.user._id}
          onClick={() => {
            console.log('Conversation selected:', conversation);
            onSelectConversation(conversation.user);
          }}
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
              <LastMessage fontSize="sm" color="gray.500" noOfLines={1} unread={conversation.unreadCount > 0}>
                {conversation.lastMessage.content}
              </LastMessage>
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

export default React.memo(Conversations);