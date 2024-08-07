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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Textarea,
} from "@chakra-ui/react";
import { ArrowBackIcon, DeleteIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { FaPaperPlane, FaEllipsisV } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import api from "../api";

const Chat = ({ currentUser, otherUser, isOpen, onClose, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!currentUser || !otherUser) return;
  
    try {
      const response = await api.get(`/api/messages/${otherUser.id}?page=${pageNum}&limit=20`);
      const data = response.data;
      setMessages(prevMessages => [...data.messages.reverse(), ...prevMessages]);
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
    if (isOpen && socket && currentUser && currentUser.id && otherUser) {
      fetchMessages();
  
      socket.on("private message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on("user typing", (typingUserId) => {
        if (typingUserId === otherUser.id) {
          setIsTyping(true);
        }
      });

      socket.on("user stop typing", (typingUserId) => {
        if (typingUserId === otherUser.id) {
          setIsTyping(false);
        }
      });

      socket.on("message unsent", ({ messageId }) => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
      });

      socket.on("message edited", (editedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === editedMessage._id ? editedMessage : msg))
        );
      });
  
      return () => {
        socket.off("private message");
        socket.off("user typing");
        socket.off("user stop typing");
        socket.off("message unsent");
        socket.off("message edited");
      };
    }
  }, [isOpen, socket, currentUser, otherUser, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !socket || !currentUser || !otherUser) return;
  
    const messageToSend = {
      recipientId: otherUser.id,
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
    socket.emit("typing", { recipientId: otherUser.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", { recipientId: otherUser.id });
    }, 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUnsendMessage = (messageId) => {
    socket.emit("message unsent", { messageId, recipientId: otherUser.id }, (error) => {
      if (error) {
        toast({
          title: "Error",
          description: "Failed to unsend message. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
      }
    });
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
  };

  const handleSaveEdit = () => {
    if (!editingMessage) return;

    socket.emit("message edited", {
      messageId: editingMessage._id,
      newContent: editingMessage.content,
      recipientId: otherUser.id
    }, (error, updatedMessage) => {
      if (error) {
        toast({
          title: "Error",
          description: "Failed to edit message. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
        );
        setEditingMessage(null);
      }
    });
  };

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

  const renderMessage = (msg, index, messages) => {
    const isSentByCurrentUser = currentUser && msg.sender.id === currentUser.id;
    const isFirstMessageInSequence = index === 0 || messages[index - 1].sender.id !== msg.sender.id;
  
    return (
      <Flex
        key={`${msg._id}-${index}`}
        justifyContent={isSentByCurrentUser ? "flex-end" : "flex-start"}
        mb={2}
      >
        {!isSentByCurrentUser && isFirstMessageInSequence && (
          <Avatar 
            size="sm" 
            name={msg.sender.username} 
            src={msg.sender.photo} 
            mr={2} 
            alignSelf="flex-end" 
          />
        )}
        {!isSentByCurrentUser && !isFirstMessageInSequence && <Box width="32px" mr={2} />}
        <Box
          maxWidth="70%"
          bg={isSentByCurrentUser ? "blue.100" : "green.100"}
          color={isSentByCurrentUser ? "blue.800" : "green.800"}
          borderRadius={isSentByCurrentUser ? "20px 20px 0 20px" : "20px 20px 20px 0"}
          p={3}
          boxShadow="md"
        >
          {editingMessage && editingMessage._id === msg._id ? (
            <VStack>
              <Textarea
                value={editingMessage.content}
                onChange={(e) => setEditingMessage({...editingMessage, content: e.target.value})}
                size="sm"
              />
              <HStack>
                <IconButton
                  icon={<CheckIcon />}
                  size="xs"
                  onClick={handleSaveEdit}
                  aria-label="Save edit"
                />
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  onClick={() => setEditingMessage(null)}
                  aria-label="Cancel edit"
                />
              </HStack>
            </VStack>
          ) : (
            <>
              <Text>{msg.content}</Text>
              <Text fontSize="xs" textAlign="right" mt={1} opacity={0.8}>
                {formatMessageTime(msg.timestamp)}
              </Text>
            </>
          )}
        </Box>
        {isSentByCurrentUser && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size="xs"
              ml={2}
            />
            <MenuList>
              <MenuItem icon={<EditIcon />} onClick={() => handleEditMessage(msg)}>
                Edit
              </MenuItem>
              <MenuItem icon={<DeleteIcon />} onClick={() => handleUnsendMessage(msg._id)}>
                Unsend
              </MenuItem>
            </MenuList>
          </Menu>
        )}
        {isSentByCurrentUser && isFirstMessageInSequence && (
          <Avatar 
            size="sm" 
            name={currentUser.username} 
            src={currentUser.photo} 
            ml={2} 
            alignSelf="flex-end" 
          />
        )}
        {isSentByCurrentUser && !isFirstMessageInSequence && <Box width="32px" ml={2} />}
      </Flex>
    );
  };

  if (!isOpen) return null;

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
            inverse={false}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {messages.map((msg, index) => renderMessage(msg, index, messages))}
          </InfiniteScroll>
          <div ref={messagesEndRef} />
        </Box>
        {isTyping && (
          <Text fontSize="sm" fontStyle="italic" ml={4} mb={2}>
            {otherUser.username} is typing...
          </Text>
        )}
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