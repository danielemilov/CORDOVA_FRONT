import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { FaPaperPlane } from 'react-icons/fa';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Heading,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  ChatContainer,
  Sidebar,
  ChatArea,
  Header,
  UserList,
  UserItem,
  Avatar,
  MessageList,
  MessageItem,
  MessageInput,
  SendButton
} from './ChatStyles';


const API_BASE_URL = 'http://localhost:4000'; // Update this to your backend URL

const Chat = ({ user, setUser }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication error',
        description: 'Please log in again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      window.location.href = '/login';
      return;
    }

    const newSocket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsLoading(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to the server. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    newSocket.on('private message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on('user status', ({ userId, isOnline }) => {
      setOnlineUsers((prevUsers) => {
        if (isOnline) {
          return prevUsers.some(u => u._id === userId) 
            ? prevUsers 
            : [...prevUsers, { _id: userId, isOnline }];
        } else {
          return prevUsers.filter(u => u._id !== userId);
        }
      });
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [toast]);

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/online-users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOnlineUsers(response.data);
    } catch (error) {
      console.error('Error fetching online users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch online users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchOnlineUsers]);

  const fetchChatHistory = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chat history.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory(selectedUser._id);
    }
  }, [selectedUser, fetchChatHistory]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedUser || !socket) {
      return;
    }

    const messageToSend = {
      recipientId: selectedUser._id,
      content: newMessage,
    };

    socket.emit('private message', messageToSend, (error) => {
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message: ' + error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setMessages((prevMessages) => [...prevMessages, { ...messageToSend, sender: user._id, timestamp: new Date() }]);
        setNewMessage('');
      }
    });
  }, [newMessage, selectedUser, socket, toast, user._id]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    if (socket) {
      socket.disconnect();
    }
    window.location.href = '/login';
  }, [setUser, socket]);

  const handleUserSelect = useCallback((user) => {
    setSelectedUser(user);
    setMessages([]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <ChatContainer>
      <Sidebar>
        <Header>
          <h2>Chats</h2>
        </Header>
        <UserList>
          {onlineUsers.map((u) => (
            <UserItem
            key={u._id}
            $active={selectedUser && selectedUser._id === u._id}
            onClick={() => handleUserSelect(u)}
          >
              <Avatar src={u.photo || 'https://via.placeholder.com/40'} alt={u.username} />
              <span>{u.username}</span>
            </UserItem>
          ))}
        </UserList>
      </Sidebar>
      <ChatArea>
        <Header>
          {selectedUser && (
            <>
              <Avatar src={selectedUser.photo || 'https://via.placeholder.com/40'} alt={selectedUser.username} />
              <span>{selectedUser.username}</span>
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </Header>
        <MessageList>
          {messages.map((msg, index) => (
            <MessageItem key={index} sent={msg.sender === user._id}>
              {msg.content}
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </MessageItem>
          ))}
          <div ref={messagesEndRef} />
        </MessageList>
        {selectedUser && (
          <MessageInput>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <SendButton onClick={handleSendMessage}>
              <FaPaperPlane />
            </SendButton>
          </MessageInput>
        )}
      </ChatArea>
    </ChatContainer>
  );
};

export default Chat;