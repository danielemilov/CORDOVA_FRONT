import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Box, VStack, HStack, Text, Avatar, Spinner, useToast, Button } from '@chakra-ui/react';
import api from '../api';
import { useSocket } from '../contexts/SocketContext';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ConversationItem = styled(Box)`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const UnreadBadge = styled.div`
  background-color: #FF4136;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-left: 10px;
`;

const LastMessage = styled(Text)`
  color: ${props => props.$unread ? '#000' : '#666'};
  font-weight: ${props => props.$unread ? 'bold' : 'normal'};
`;

const TimeStamp = styled(Text)`
  font-size: 12px;
  color: #999;
`;

const Conversations = ({ onSelectConversation, filter, unreadMessages }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/messages/conversations');
      if (Array.isArray(response.data)) {
        setConversations(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Received unexpected data format from server');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch conversations';
      setError(errorMessage);
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, navigate]);
  
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  useEffect(() => {
    if (socket) {
      const handleUpdateConversation = (updatedConversation) => {
        setConversations(prevConversations => {
          const existingIndex = prevConversations.findIndex(conv => conv._id === updatedConversation._id);
          if (existingIndex !== -1) {
            // Update existing conversation
            const updatedConversations = [...prevConversations];
            updatedConversations[existingIndex] = updatedConversation;
            return updatedConversations.sort((a, b) => 
              new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
            );
          } else {
            // Add new conversation
            return [updatedConversation, ...prevConversations];
          }
        });
      };

      const handleMessageRead = ({ conversationId }) => {
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      };

      socket.on('update conversation', handleUpdateConversation);
      socket.on('message read', handleMessageRead);
  
      return () => {
        socket.off('update conversation', handleUpdateConversation);
        socket.off('message read', handleMessageRead);
      };
    }
  }, [socket]);

  const formatLastMessageTime = useCallback((timestamp) => {
    const date = parseISO(timestamp);
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
      (conv.lastMessage && conv.lastMessage.content && conv.lastMessage.content.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [conversations, filter]);

  const handleConversationClick = useCallback(async (conversation) => {
    if (socket && socket.connected) {
      socket.emit('mark as read', { conversationId: conversation._id }, (error) => {
        if (error) {
          console.error('Error marking messages as read:', error);
          toast({
            title: "Error",
            description: "Failed to mark messages as read",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else {
          setConversations(prevConversations =>
            prevConversations.map(conv =>
              conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
            )
          );
        }
      });
    } else {
      console.warn('Socket is not connected. Unable to mark messages as read.');
      toast({
        title: "Warning",
        description: "Not connected to the chat server. Some features may be unavailable.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
    onSelectConversation(conversation.user);
  }, [socket, onSelectConversation, toast]);

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
          key={conversation._id}
          onClick={() => handleConversationClick(conversation)}
        >
          <HStack spacing={4} align="flex-start">
            <Avatar
              src={conversation.user.photo}
              name={conversation.user.username}
              size="md"
            />
            <Box flex={1}>
              <HStack justify="space-between" align="center">
                <Text fontWeight="bold">{conversation.user.username}</Text>
                <HStack>
                  {conversation.unreadCount > 0 && (
                    <UnreadBadge>{conversation.unreadCount}</UnreadBadge>
                  )}
                  <TimeStamp>
                    {conversation.lastMessage && formatLastMessageTime(conversation.lastMessage.timestamp)}
                  </TimeStamp>
                </HStack>
              </HStack>
              <LastMessage 
                $unread={conversation.unreadCount > 0} 
                noOfLines={1}
              >
                {conversation.lastMessage ? conversation.lastMessage.content : "No messages yet"}
              </LastMessage>
            </Box>
          </HStack>
        </ConversationItem>
      ))}
    </VStack>
  );
};

export default React.memo(Conversations);