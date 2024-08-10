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
  Image,
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
  flex-direction: column-reverse;
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
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!currentUser || !otherUser) {
      console.error("Current user or other user is not defined");
      return;
    }
  
    try {
      console.log(`Fetching messages for page ${pageNum}`);
      const response = await api.get(`/api/messages/${otherUser._id}`, {
        params: { page: pageNum, limit: 20 },
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
      console.log("Chat component opened, fetching messages");
      fetchMessages();
  
      socket.on("private message", (message) => {
        console.log("Received private message:", message);
        if (
          message.sender?._id === otherUser._id ||
          message.recipient?._id === otherUser._id
        ) {
          setMessages((prevMessages) => [message, ...prevMessages]);
        } else {
          console.warn("Message received with invalid sender or recipient:", message);
        }
      });
  
      return () => {
        console.log("Cleaning up socket listeners");
        socket.off("private message");
      };
    }
  }, [isOpen, socket, currentUser, otherUser, fetchMessages]);
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() && !file) {
      console.error("Cannot send empty message");
      return;
    }
    
    if (!currentUser || !otherUser) {
      console.error("Current user or other user is not defined");
      return;
    }
  
    if (!socket) {
      console.error("Socket is not available");
      return;
    }
  
    const formData = new FormData();
    formData.append("sender", currentUser._id);
    formData.append("recipient", otherUser._id);
    formData.append("content", newMessage);
    if (file) {
      formData.append("file", file);
    }
  
    try {
      console.log("Sending message:", { recipient: otherUser._id, content: newMessage });
      const response = await api.post("/api/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Message sent response:", response.data);
      const sentMessage = response.data;
      setMessages((prevMessages) => [sentMessage, ...prevMessages]);
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
  
    return (
      <Flex
        key={msg._id}
        justifyContent={isSentByCurrentUser ? "flex-end" : "flex-start"}
        mb={2}
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
        <MessageBubble
          bg={isSentByCurrentUser ? "blue.100" : "green.100"}
          color={isSentByCurrentUser ? "blue.800" : "green.800"}
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
          <Text>{msg.content}</Text>
          <Text fontSize="xs" textAlign="right" mt={1} opacity={0.8}>
            {formatMessageTime(msg.timestamp)}
          </Text>
        </MessageBubble>
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
    <ChatContainer>
      <Header>
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={onClose}
            variant="ghost"
            color="white"
            aria-label="Go back"
            _hover={{ bg: "green.600" }}
          />
          <Avatar size="md" name={otherUser.username} src={otherUser.photo} />
          <VStack align="flex-start" spacing={0}>
            <Text fontWeight="bold">{otherUser.username}</Text>
            <Text fontSize="sm" color="gray.300">
              {otherUser.isOnline ? "Online" : "Offline"}
            </Text>
          </VStack>
        </HStack>
      </Header>
      <MessageContainer
        id="scrollableDiv"
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          overflow: "auto",
        }}
      >
        {isLoading ? (
          <Spinner size="lg" margin="auto" />
        ) : (
          <InfiniteScroll
            dataLength={messages.length}
            next={fetchMessages}
            hasMore={hasMore}
            loader={<Spinner size="lg" margin="auto" />}
            style={{ display: "flex", flexDirection: "column-reverse" }}
            inverse={true}
            scrollableTarget="scrollableDiv"
          >
            {messages.map(renderMessage)}
          </InfiniteScroll>
        )}
        <div ref={messagesEndRef} />
      </MessageContainer>
      <InputContainer>
        <HStack spacing={2}>
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <IconButton
            icon={<AttachmentIcon />}
            onClick={() => fileInputRef.current.click()}
            variant="ghost"
            aria-label="Attach file"
            _hover={{ bg: "green.100" }}
          />
          <IconButton
            icon={<FaPaperPlane />}
            onClick={handleSendMessage}
            variant="solid"
            colorScheme="green"
            aria-label="Send message"
            _hover={{ bg: "green.600" }}
          />
        </HStack>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;