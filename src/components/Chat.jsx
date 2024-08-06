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
import InfiniteScroll from "react-infinite-scroll-component";
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const Chat = ({ currentUser, otherUser, isOpen, onClose, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!currentUser || !otherUser) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${otherUser._id}?page=${pageNum}&limit=20`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, ...data.messages]);
      setHasMore(data.hasMore);
      setPage(pageNum + 1);
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
  
    socket.emit("private message", messageToSend, (error, sentMessage) => {
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
        setMessages((prevMessages) => [...prevMessages, sentMessage]);
        setNewMessage("");
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

  const renderMessage = (msg, index, arr) => {
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
          bg={isSentByCurrentUser ? "blue.100" : "green-100"}
          color={isSentByCurrentUser ? "blue.800" : "green"}
          borderRadius={isSentByCurrentUser ? "20px 20px 0 20px" : "20px 20px 20px 0"}
          p={3}
          boxShadow="md"
        >
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
          >
            {messages.map((msg, index, arr) => renderMessage(msg, index, arr))}
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
              icon={<FaPaperPlane />}
              onClick={handleSendMessage}
              isDisabled={!newMessage.trim()}
              colorScheme="blue"
              aria-label="Send message"
              borderRadius="full"
            />
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Chat;