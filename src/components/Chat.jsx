import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Avatar,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FaPaperPlane } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const Chat = ({ currentUser, otherUser, isOpen, onClose, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!currentUser || !otherUser) return;
  
    try {
      console.log('Fetching messages for users:', currentUser._id, otherUser._id);
      const response = await fetch(`${API_BASE_URL}/api/messages/${otherUser._id}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch messages");
      }
      const data = await response.json();
      console.log('Fetched messages:', data.length);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load messages. Please try again.",
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
        console.log("Received new message:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off("private message");
      };
    }
  }, [isOpen, socket, currentUser, otherUser, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !socket || !currentUser || !otherUser) return;
  
    const messageToSend = {
      recipientId: otherUser._id,
      content: newMessage,
    };
  
    socket.emit("private message", messageToSend, (error) => {
      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...messageToSend, sender: currentUser._id, timestamp: new Date() },
        ]);
        setNewMessage(""); // Clear the input after sending
        console.log('Message sent, input cleared');
      }
    });
  }, [newMessage, otherUser, socket, toast, currentUser]);
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
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
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
  
    if (messageDate.toDateString() === now.toDateString()) {
      return `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return messageDate.toLocaleDateString([], { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    return messages.map((msg, index) => {
      const messageDate = new Date(msg.timestamp);
      const formattedTime = formatMessageTime(msg.timestamp);
      const showDateHeader = lastDate !== messageDate.toDateString();
      lastDate = messageDate.toDateString();

      return (
        <React.Fragment key={msg._id || `msg-${index}`}>
          {showDateHeader && (
            <Text textAlign="center" fontSize="sm" color="gray.500" my={2}>
              {formattedTime.split(' at ')[0]}
            </Text>
          )}
          <Box
            alignSelf={msg.sender === currentUser._id ? "flex-end" : "flex-start"}
            bg={msg.sender === currentUser._id ? "purple.500" : "gray.100"}
            color={msg.sender === currentUser._id ? "white" : "black"}
            borderRadius="lg"
            p={2}
            maxW="70%"
          >
            <Text>{msg.content}</Text>
            <Text fontSize="xs" textAlign="right">
              {formattedTime.split(' at ')[1]}
            </Text>
          </Box>
        </React.Fragment>
      );
    });
  };

  return (
    <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="white" zIndex={1000}>
      <Flex direction="column" h="100%">
        <Box p={4} bg="black" color="white">
          <HStack>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={onClose}
              variant="ghost"
              color="white"
              aria-label="Go back"
            />
            <Avatar src={otherUser.photo} name={otherUser.username} size="sm" />
            <Text fontWeight="bold">{otherUser.username}</Text>
          </HStack>
        </Box>
        <VStack flex={1} overflowY="auto" p={4} spacing={4}>
          {isLoading ? (
            <Spinner />
          ) : (
            renderMessages()
          )}
          <div ref={messagesEndRef} />
        </VStack>
        <HStack p={4} bg="gray.100">
          <Input
            ref={inputRef}
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