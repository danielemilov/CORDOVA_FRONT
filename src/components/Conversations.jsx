import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Box, VStack, HStack, Text, Avatar, Spinner, useToast, Button } from '@chakra-ui/react';
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

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/messages/conversations');
      console.log('Fetched conversations:', response.data);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  
  useEffect(() => {
    if (socket) {
      socket.on('private message', (message) => {
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
          return updatedConversations.sort((a, b) => 
            new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
          );
        });
      });
  
      return () => {
        socket.off('private message');
      };
    }
  }, [socket]);
  const handleNewMessage = useCallback((message) => {
    setConversations((prevConversations) => {
      const updatedConversations = prevConversations.map(conv => {
        if (conv.user._id === message.sender._id || conv.user._id === message.recipient._id) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount: conv.user._id === message.sender._id ? conv.unreadCount + 1 : conv.unreadCount
          };
        }
        return conv;
      });
      return updatedConversations.sort((a, b) => 
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
      );
    });
  }, []);

  const handleMessageRead = useCallback((messageIds) => {
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        const readCount = messageIds.filter(id => id.sender === conv.user._id).length;
        return {
          ...conv,
          unreadCount: Math.max(0, conv.unreadCount - readCount),
        };
      });
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
      (conv.lastMessage && conv.lastMessage.content && conv.lastMessage.content.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [conversations, filter]);

  const handleConversationClick = useCallback(async (conversation) => {
    try {
      if (!conversation.user._id) {
        console.error('Invalid conversation user ID');
        return;
      }
      await api.post(`/api/messages/mark-read/${conversation.user._id}`);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user._id === conversation.user._id ? { ...conv, unreadCount: 0 } : conv
        )
      );
      onSelectConversation(conversation.user);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark messages as read. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [onSelectConversation, toast]);

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
                  {unreadMessages[conversation.user._id] > 0 && (
                    <UnreadBadge>{unreadMessages[conversation.user._id]}</UnreadBadge>
                  )}
                  <TimeStamp>
                    {conversation.lastMessage && formatLastMessageTime(conversation.lastMessage.timestamp)}
                  </TimeStamp>
                </HStack>
              </HStack>
              <LastMessage 
                $unread={unreadMessages[conversation.user._id] > 0} 
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