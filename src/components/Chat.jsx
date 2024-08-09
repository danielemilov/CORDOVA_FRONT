import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, VStack, HStack, Text, Input, IconButton, useToast, Spinner, Flex, Avatar, Image,
} from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import { FaPaperPlane } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import api from '../api';
import { useSocket } from '../contexts/SocketContext';

const Chat = ({ currentUser, otherUser, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState(null);
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!currentUser || !otherUser) return;
  
    try {
      const response = await api.get(`/api/messages/${otherUser._id}`, {
        params: { page: pageNum, limit: 20 },
      });
      const data = response.data;
      setMessages(prevMessages => [...data.messages.reverse(), ...prevMessages]);
      setHasMore(data.hasMore);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load messages. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, otherUser, toast]);

  useEffect(() => {
    if (isOpen && socket && currentUser && otherUser) {
      fetchMessages();

      socket.on("private message", (message) => {
        if (message.sender._id === otherUser._id || message.recipient._id === otherUser._id) {
          setMessages(prevMessages => [...prevMessages, message]);
        }
      });

      return () => {
        socket.off("private message");
      };
    }
  }, [isOpen, socket, currentUser, otherUser, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if ((!newMessage.trim() && !file) || !socket || !currentUser || !otherUser) return;
  
    const formData = new FormData();
    formData.append('recipientId', otherUser._id);
    formData.append('content', newMessage);
    if (file) {
      formData.append('file', file);
    }
  
    try {
      const response = await api.post('/api/messages/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const sentMessage = response.data;
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage("");
      setFile(null);
      
      socket.emit("private message", sentMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [newMessage, file, otherUser, socket, toast, currentUser]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'h:mm a')}`;
    } else if (isThisWeek(messageDate)) {
      return format(messageDate, 'EEEE h:mm a');
    } else {
      return format(messageDate, 'dd.MM.yyyy h:mm a');
    }
  };

  const renderMessage = (msg) => {
    const isSentByCurrentUser = msg.sender._id === currentUser._id;
  
    return (
      <Flex
        key={msg._id}
        justifyContent={isSentByCurrentUser ? "flex-end" : "flex-start"}
        mb={2}
      >
        {!isSentByCurrentUser && (
          <Avatar 
            size="sm" 
            name={msg.sender.username} 
            src={msg.sender.photo} 
            mr={2} 
            alignSelf="flex-end" 
          />
        )}
        <Box
          maxWidth="70%"
          bg={isSentByCurrentUser ? "blue.100" : "green.100"}
          color={isSentByCurrentUser ? "blue.800" : "green.800"}
          borderRadius={isSentByCurrentUser ? "20px 20px 0 20px" : "20px 20px 20px 0"}
          p={3}
          boxShadow="md"
        >
          {msg.media && (
            <Image src={msg.media} alt="Uploaded media" maxWidth="100%" mb={2} borderRadius="md" />
          )}
          <Text>{msg.content}</Text>
          <Text fontSize="xs" textAlign="right" mt={1} opacity={0.8}>
            {formatMessageTime(msg.timestamp)}
          </Text>
        </Box>
        {isSentByCurrentUser && (
          <Avatar 
            size="sm" 
            name={currentUser.username} 
            src={currentUser.photo} 
            ml={2} 
            alignSelf="flex-end" 
          />
        )}
      </Flex>
    );
  };

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="gray.50" zIndex={1000}>
      <Flex direction="column" h="100%">
        <Box p={4} bg="black" color="white" boxShadow="md">
          <HStack>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onClose}
              variant="ghost"
              color="white"
              aria-label="Go back"
              _hover={{ bg: "green.600" }}
            />
            <Avatar src={otherUser.photo} name={otherUser.username} size="sm" />
            <Text fontWeight="bold">{otherUser.username}</Text>
          </HStack>
        </Box>
        <Box flex={1} overflowY="auto" p={4} id="scrollableDiv">
          <InfiniteScroll
            dataLength={messages.length}
            next={() => fetchMessages(page)}
            hasMore={hasMore}
            loader={<Spinner />}
            scrollableTarget="scrollableDiv"
            style={{ display: 'flex', flexDirection: 'column-reverse' }}
            inverse={true}
            endMessage={
              <Text textAlign="center" mt={4} color="gray.500">
                No more messages
              </Text>
            }
          >
            {messages.map(renderMessage)}
          </InfiniteScroll>
          <div ref={messagesEndRef} />
        </Box>
        <Box p={4} bg="white" boxShadow="0 -2px 10px rgba(0,0,0,0.05)">
          <HStack>
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              bg="gray.100"
              borderRadius="full"
              _focus={{ boxShadow: "outline" }}
            />
            <IconButton
              icon={<AttachmentIcon />}
              onClick={() => fileInputRef.current.click()}
              aria-label="Attach file"
              borderRadius="full"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <IconButton
              icon={<FaPaperPlane />}
              onClick={handleSendMessage}
              isDisabled={!newMessage.trim() && !file}
              colorScheme="blue"
              aria-label="Send message"
              borderRadius="full"
            />
          </HStack>
          {file && (
            <Text mt={2} fontSize="sm">
              File selected: {file.name}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default Chat;