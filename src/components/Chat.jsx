import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, VStack, HStack, Text, Input, IconButton, useToast, Spinner, Flex, Avatar, Image,
} from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import { FaPaperPlane } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import api from "../api";
import { useSocket } from "../contexts/SocketContext";
import styled from "styled-components";

const ChatContainer = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f7f7f7;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const Header = styled(Box)`
  background-color: #000000;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessageContainer = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled(Box)`
  max-width: 70%;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
`;

const InputContainer = styled(Box)`
  padding: 1rem;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const Chat = ({ currentUser, otherUser, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState(null);
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();

// In Chat.jsx

const fetchMessages = useCallback(async (pageNum = 1) => {
  if (!currentUser || !otherUser) {
    console.error("Current user or other user is not defined");
    return;
  }

  try {
    console.log(`Fetching messages for page ${pageNum}`);
    const response = await api.get(`/api/messages/${otherUser._id}`, {
      params: { page: pageNum, limit: 5 },
    });
    console.log("Fetched messages response:", response.data);
    const data = response.data;
    setMessages((prevMessages) => {
      const newMessages = Array.isArray(data.messages) ? data.messages : [];
      return [...prevMessages, ...newMessages];
    });
    setHasMore(data.hasMore);
    setPage((prevPage) => prevPage + 1);
  } catch (error) {
    console.error("Error fetching messages:", error);
    toast({
      title: "Error",
      description: "Failed to load messages. Please try again.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
  }
}, [currentUser, otherUser, toast]);
useEffect(() => {
  if (socket) {
    socket.on('private message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('private message');
    };
  }
}, [socket]);

  useEffect(() => {
    if (isOpen && socket && currentUser && otherUser) {
      console.log("Chat component opened, fetching messages");
      fetchMessages();

      socket.on("private message", (message) => {
        console.log("Received private message:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      });

      return () => {
        console.log("Cleaning up socket listeners");
        socket.off("private message");
      };
    }
  }, [isOpen, socket, currentUser, otherUser, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() && !file) return;
  
    try {
      let mediaUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/upload', formData);
        mediaUrl = response.data.url;
      }
  
      const messageData = {
        recipient: otherUser._id,
        content: newMessage.trim(),
        media: mediaUrl,
      };
  
      socket.emit('private message', messageData, (error, sentMessage) => {
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
          setFile(null);
          scrollToBottom();
        }
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [newMessage, file, otherUser._id, socket, toast]);

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

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    if (isToday(messageDate)) {
      return format(messageDate, "h:mm a");
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, "h:mm a")}`;
    } else if (isThisWeek(messageDate)) {
      return format(messageDate, "EEEE h:mm a");
    } else {
      return format(messageDate, "dd.MM.yyyy h:mm a");
    }
  };

  const renderMessage = (msg) => {
    if (!msg || !msg.sender) {
      console.warn("Invalid message received:", msg);
      return null;
    }
  
    const isSentByCurrentUser = msg.sender._id === currentUser._id;
  
    console.log('Message:', msg);
    console.log('Current User:', currentUser);
    console.log('Is sent by current user:', isSentByCurrentUser);
  
    return (
      <Flex
        key={msg._id}
        justifyContent={isSentByCurrentUser ? "flex-end" : "flex-start"}
        mb={4}
      >
        {!isSentByCurrentUser && (
          <Avatar
            size="sm"
            name={msg.sender.username || "Unknown"}
            src={msg.sender.photo}
            mr={2}
            alignSelf="flex-end"
          />
        )}
        <Box
          bg={isSentByCurrentUser ? "blue.100" : "green.100"}
          color={isSentByCurrentUser ? "blue.800" : "green.800"}
          borderRadius="lg"
          p={3}
          maxWidth="70%"
        >
          {msg.media && (
            <Image
              src={msg.media}
              alt="Uploaded media"
              maxWidth="100%"
              mb={2}
              borderRadius="md"
            />
          )}
          <Text whiteSpace="pre-wrap">{msg.content}</Text>
          <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
            {formatMessageTime(msg.timestamp)}
          </Text>
        </Box>
        {isSentByCurrentUser && (
          <Avatar
            size="sm"
            name={msg.sender.username || "Unknown"}
            src={msg.sender.photo}
            ml={2}
            alignSelf="flex-end"
          />
        )}
      </Flex>
    );
  };

  if (!isOpen) return null;

  return (
    <ChatContainer>
      <Header>
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Back"
            onClick={onClose}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
          <Avatar
            size="sm"
            name={otherUser.username || "Unknown"}
            src={otherUser.photo}
          />
          <Text>{otherUser.username}</Text>
        </HStack>
      </Header>

      <MessageContainer ref={messageContainerRef} id="scrollableDiv">
        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" height="100%">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <InfiniteScroll
            dataLength={messages.length}
            next={() => fetchMessages(page)}
            hasMore={hasMore}
            loader={
              <Flex justifyContent="center" mt={4}>
                <Spinner size="md" />
              </Flex>
            }
            scrollableTarget="scrollableDiv"
            inverse={true}
            style={{ display: 'flex', flexDirection: 'column-reverse' }}
          >
            <VStack spacing={4} align="stretch">
              {messages.map((msg) => renderMessage(msg))}
            </VStack>
          </InfiniteScroll>
        )}
        <div ref={messagesEndRef} />
      </MessageContainer>

      <InputContainer>
        <HStack spacing={2}>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            variant="filled"
            flex={1}
          />
          <input
            type="file"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <IconButton
            icon={<AttachmentIcon />}
            onClick={() => fileInputRef.current.click()}
            variant="ghost"
            aria-label="Attach file"
          />
          <IconButton
            icon={<FaPaperPlane />}
            colorScheme="blue"
            onClick={handleSendMessage}
            aria-label="Send message"
          />
        </HStack>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;