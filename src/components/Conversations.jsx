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

const Conversations = ({ onSelectConversation, filter }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadConversations, setUnreadConversations] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState({});
  const socket = useSocket();
  const toast = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/messages/conversations');
      console.log('Fetched conversations:', response.data); // Debug log
      setConversations(response.data);
      let unreadCount = 0;
      const unreadMap = {};
      response.data.forEach((conv) => {
        unreadCount += conv.unreadCount;
        unreadMap[conv.user._id] = conv.unreadCount;
      });
      setUnreadConversations(unreadCount);
      setUnreadMessages(unreadMap);
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
      socket.on('message read', handleMessageRead);
      return () => {
        socket.off('private message', handleNewMessage);
        socket.off('message read', handleMessageRead);
      };
    }
  }, [socket]);

  const handleNewMessage = useCallback((message) => {
    setConversations((prevConversations) => {
      const existingConvIndex = prevConversations.findIndex(
        conv => conv.user._id === message.sender._id || conv.user._id === message.recipient._id
      );

      if (existingConvIndex !== -1) {
        // Update existing conversation
        const updatedConversations = [...prevConversations];
        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          lastMessage: message,
          unreadCount: updatedConversations[existingConvIndex].user._id === message.sender._id 
            ? updatedConversations[existingConvIndex].unreadCount + 1 
            : updatedConversations[existingConvIndex].unreadCount,
        };
        return updatedConversations;
      } else {
        // Add new conversation
        const newConversation = {
          user: message.sender,
          lastMessage: message,
          unreadCount: 1,
        };
        return [newConversation, ...prevConversations];
      }
    });

    setUnreadConversations((prevUnread) => prevUnread + 1);
    setUnreadMessages((prevUnread) => ({
      ...prevUnread,
      [message.sender._id]: (prevUnread[message.sender._id] || 0) + 1,
    }));
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
    setUnreadConversations((prevUnread) => Math.max(0, prevUnread - messageIds.length));
    setUnreadMessages((prevUnread) => {
      const newUnread = { ...prevUnread };
      messageIds.forEach((id) => {
        if (newUnread[id.sender]) {
          newUnread[id.sender] = Math.max(0, newUnread[id.sender] - 1);
        }
      });
      return newUnread;
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
      await api.post(`/api/messages/mark-read/${conversation.user._id}`);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user._id === conversation.user._id
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      setUnreadConversations((prevUnread) => prevUnread - conversation.unreadCount);
      setUnreadMessages((prevUnread) => ({
        ...prevUnread,
        [conversation.user._id]: 0,
      }));
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
