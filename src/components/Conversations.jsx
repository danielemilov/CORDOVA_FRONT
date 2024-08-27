import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Box, VStack, HStack, Text, Avatar, Spinner, useToast, Button } from '@chakra-ui/react';
import api from '../api';
import { useSocket } from '../contexts/SocketContext';
import { format, isToday, isYesterday, isThisWeek, parseISO, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ConversationItem = styled(Box)`
  background-color:#f0f0f0;
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
  font-size: 14px;
  line-height: 1.4;
`;

const TimeStamp = styled(Text)`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
`;

const NoConversationsMessage = styled(Text)`
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-top: 20px;
`;

const RefreshButton = styled(Button)`
  margin-top: 10px;
`;

const Conversations = ({ onSelectConversation, filter, unreadMessages, currentUser }) => {
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
        console.log("PLACE1")
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
        console.log("PLACE2")
        setConversations(prevConversations => {
          const existingIndex = prevConversations.findIndex(conv => conv._id === updatedConversation._id);
          
          if (existingIndex !== -1) {
            const updatedConversations = [...prevConversations];
            updatedConversations[existingIndex] = updatedConversation;
            return updatedConversations.sort((a, b) => 
              new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
            );
          } else {
            return [updatedConversation, ...prevConversations];
          }
        });
      };

      const handleMessageRead = ({ conversationId }) => {
        console.log("PLACE3")

        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      };

      const handleNewMessage = (message) => {
        console.log("PLACE4")

        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv => {
            if (conv._id === message.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + (message.sender._id !== currentUser.id ? 1 : 0),
              };
            }
            return conv;
          });
          return updatedConversations.sort((a, b) => 
            new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
          );
        });
      };

      socket.on('update conversation', handleUpdateConversation);
      socket.on('message read', handleMessageRead);
      socket.on('new message', handleNewMessage);
  
      return () => {
        socket.off('update conversation', handleUpdateConversation);
        socket.off('message read', handleMessageRead);
        socket.off('new message', handleNewMessage);
      };
    }
  }, [socket, currentUser.id]);

  const formatLastMessageTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    try {
      const date = parseISO(timestamp);
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else if (isThisWeek(date)) {
        return format(date, 'EEEE');
      } else {
        return formatDistanceToNow(date, { addSuffix: true });
      }
    } catch (error) {
      console.error('Error formatting last message time:', error);
      return '';
    }
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
      conv.participants && conv.participants.length > 0 && (
        conv.participants.some(p => 
          p.username && p.username.toLowerCase().includes(filter.toLowerCase())
        ) ||
        (conv.lastMessage && conv.lastMessage.content && 
         conv.lastMessage.content.toLowerCase().includes(filter.toLowerCase()))
      )
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
          console.log("PLACE5")

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
    const otherUser = conversation.participants.find(p => p._id !== currentUser.id);
    onSelectConversation(otherUser);
  }, [socket, onSelectConversation, toast, currentUser]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Text color="red.500">{error}</Text>
        <RefreshButton onClick={fetchConversations} colorScheme="purple">Retry</RefreshButton>
      </Box>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <NoConversationsMessage>No conversations found</NoConversationsMessage>
        <RefreshButton onClick={fetchConversations} colorScheme="purple">Refresh</RefreshButton>
      </Box>
    );
  }

  return (
    <VStack spacing={0} align="stretch">
      {filteredConversations.map((conversation) => {
        const otherUser = conversation.participants.find(p => p._id !== currentUser.id);
        if (!otherUser) {
          console.warn("Other user not found in conversation:", conversation);
          return null;
        }
        const isUnread = conversation.unreadCount > 0 && conversation.lastMessage?.sender._id !== currentUser.id;
        return (
          <ConversationItem
            key={conversation._id}
            onClick={() => handleConversationClick(conversation)}
          >
            <HStack spacing={4} align="flex-start">
              <Avatar
                src={otherUser.photo || 'https://via.placeholder.com/150'}
                name={otherUser.username}
                size="md"
              />
              <Box flex={1}>
                <HStack justify="space-between" align="center">
                  <Text fontWeight="bold" fontSize="16px">{otherUser.username}</Text>
                  <HStack>
                    {isUnread && (
                      <UnreadBadge>{conversation.unreadCount}</UnreadBadge>
                    )}
                    
                    <TimeStamp>
                      {conversation.lastMessage && formatLastMessageTime(conversation.lastMessage.createdAt)}
                    </TimeStamp>
                  </HStack>
                </HStack>
                <LastMessage 
                  $unread={isUnread}
                  noOfLines={1}
                >
                  {conversation.lastMessage ? conversation.lastMessage.content : "No messages yet"}
                </LastMessage>
              </Box>
            </HStack>
          </ConversationItem>
        );
      })}
    </VStack>
  );
};

export default React.memo(Conversations);