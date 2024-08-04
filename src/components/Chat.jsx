import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  useToast,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { FaPaperPlane } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const Chat = ({ currentUser, otherUser, isOpen, onClose, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const [inputKey, setInputKey] = useState(0); // New state for input key


  const fetchMessages = useCallback(async () => {
    if (!currentUser || !otherUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${otherUser._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, otherUser, toast]);

  useEffect(() => {
    if (isOpen && socket) {
      fetchMessages();
      
      socket.on('private message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off('private message');
      };
    }
  }, [isOpen, socket, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !socket) return;
  
    const messageToSend = {
      recipientId: otherUser._id,
      content: newMessage,
    };
  
    socket.emit('private message', messageToSend, (error) => {
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...messageToSend, sender: currentUser._id, timestamp: new Date() },
        ]);
        setNewMessage('');
      }
    });
  }, [newMessage, otherUser._id, socket, toast, currentUser._id]);
  
  // Use this effect to ensure the input is cleared
  useEffect(() => {
    if (newMessage === '') {
      const inputElement = document.querySelector('input[placeholder="Type a message"]');
      if (inputElement) {
        inputElement.value = '';
      }
    }
  }, [newMessage]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;


  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="white" zIndex={1000}>
      <Flex direction="column" h="100%">
        <Box p={4} bg="teal.500" color="white">
          <HStack>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onClose}
              variant="ghost"
              color="white"
              aria-label="Go back"
            />
            <Text fontWeight="bold">{otherUser.username}</Text>
          </HStack>
        </Box>
        <VStack flex={1} overflowY="auto" p={4} spacing={4}>
          {isLoading ? (
            <Spinner />
          ) : (
            messages.map((msg, index) => (
              <Box
                key={msg._id || `msg-${index}`}
                alignSelf={msg.sender === currentUser._id ? 'flex-end' : 'flex-start'}
                bg={msg.sender === currentUser._id ? 'teal.500' : 'gray.100'}
                color={msg.sender === currentUser._id ? 'white' : 'black'}
                borderRadius="lg"
                p={2}
                maxW="70%"
              >
                <Text>{msg.content}</Text>
                <Text fontSize="xs" textAlign="right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </VStack>
        <HStack p={4} bg="gray.100">
        <Input
  value={newMessage}
  onChange={handleInputChange}
  onKeyDown={handleKeyDown}
  placeholder="Type a message"
/>
          <IconButton
            icon={<FaPaperPlane />}
            onClick={handleSendMessage}
            isDisabled={!newMessage.trim()}
            colorScheme="teal"
            aria-label="Send message"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Chat;