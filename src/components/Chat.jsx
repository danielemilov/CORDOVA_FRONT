import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconButton, useToast, Spinner } from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import { FaPaperPlane } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import api from "../api";
import { useSocket } from "../contexts/SocketContext";
import styled from "styled-components";

const ChatContainer = styled.div`
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

const Header = styled.div`
  background-color: #000000;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const Username = styled.span`
  font-weight: bold;
`;

const MessageContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column-reverse;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${props => props.isSentByCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 10px;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px;
  border-radius: 20px;
  background-color: ${props => props.isSentByCurrentUser ? '#ffcccb' : '#add8e6'};
  color: ${props => props.isSentByCurrentUser ? '#8b0000' : '#00008b'};
`;

const MessageContent = styled.p`
  margin: 0;
  white-space: pre-wrap;
`;

const MessageTime = styled.span`
  font-size: 0.8em;
  color: #666;
  display: block;
  text-align: right;
  margin-top: 5px;
`;

const InputContainer = styled.div`
  padding: 1rem;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
`;

  const Chat = ({ currentUser, otherUser, isOpen, onClose }) => {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState(null);
  const toast = useToast();
  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!currentUser || !otherUser) {
      console.error("Current user or other user is not defined");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Fetching messages for page ${pageNum}`);
      const response = await api.get(`/api/messages/${otherUser._id}`, {
        params: { page: pageNum, limit: 20 },
      });
      console.log("Fetched messages response:", response.data);
      const { messages, hasMore } = response.data;
      setMessages((prevMessages) => {
        const newMessages = Array.isArray(messages) ? messages : [];
        return pageNum === 1 ? newMessages : [...prevMessages, ...newMessages];
      });
      setHasMore(hasMore);
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
    if (isOpen && currentUser && otherUser) {
      console.log("Chat component opened, fetching messages");
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages(1);
    }
  }, [isOpen, currentUser, otherUser, fetchMessages]);


  useEffect(() => {
    if (socket) {
      socket.on('private message', (message) => {
        setMessages((prevMessages) => [message, ...prevMessages]);
      });

      return () => {
        socket.off('private message');
      };
    }
  }, [socket]);

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
          setMessages((prevMessages) => [sentMessage, ...prevMessages]);
          setNewMessage("");
          setFile(null);
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
  
    const isSentByCurrentUser = msg.sender._id === currentUser.id;
  
    console.log('Message:', msg);
    console.log('Current User:', currentUser);
    console.log('Is sent by current user:', isSentByCurrentUser);
  
    return (
      <MessageWrapper key={msg._id} isSentByCurrentUser={isSentByCurrentUser}>
        <MessageBubble isSentByCurrentUser={isSentByCurrentUser}>
          {msg.media && (
            <img src={msg.media} alt="Uploaded media" style={{ maxWidth: '100%', marginBottom: '10px', borderRadius: '10px' }} />
          )}
          <MessageContent>{msg.content}</MessageContent>
          <MessageTime>{formatMessageTime(msg.timestamp)}</MessageTime>
        </MessageBubble>
      </MessageWrapper>
    );
  };

  if (!isOpen) return null;

  return (
    <ChatContainer>
      <Header>
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Back"
          onClick={onClose}
          variant="ghost"
          colorScheme="whiteAlpha"
        />
        <Avatar src={otherUser.photo} alt={otherUser.username} />
        <Username>{otherUser.username}</Username>
      </Header>

      <MessageContainer ref={messageContainerRef} id="scrollableDiv">
        {isLoading && messages.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spinner size="xl" />
          </div>
        ) : (
          <InfiniteScroll
            dataLength={messages.length}
            next={() => fetchMessages(page)}
            hasMore={hasMore}
            loader={
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Spinner size="md" />
              </div>
            }
            scrollableTarget="scrollableDiv"
            inverse={true}
            style={{ display: 'flex', flexDirection: 'column-reverse' }}
          >
            {messages.map((msg) => renderMessage(msg))}
          </InfiniteScroll>
        )}
      </MessageContainer>

      <InputContainer>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
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
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;