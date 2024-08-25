import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconButton, useToast, Spinner, Input, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, VStack, Box, Menu, MenuButton, MenuList, MenuItem, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
import { FaPaperPlane, FaMicrophone, FaStop } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, isToday, isYesterday, isThisWeek, parseISO, isSameDay } from "date-fns";
import api from "../api";
import { useSocket } from "../contexts/SocketContext";
import styled from "styled-components";
import { MoreVertical } from 'lucide-react';
import RecordRTC from 'recordrtc';

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

const Header = styled.header`
  background-color: #000000;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const Username = styled.span`
  font-weight: bold;
  margin-left: 10px;
`;

const MessageContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column-reverse;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px;
  border-radius: 20px;
  background-color: ${(props) => (props.$isSentByCurrentUser ? "rgb(192, 132, 237)" : "#ffffff")};
  color: ${(props) => (props.$isSentByCurrentUser ? "#ffffff" : "#000000")};
  align-self: ${(props) => (props.$isSentByCurrentUser ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
  position: relative;
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

const StyledInput = styled(Input)`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
`;

const TypingIndicator = styled.div`
  font-size: 0.8em;
  color: #666;
  padding: 5px 10px;
  position: absolute;
  bottom: 60px;
  left: 20px;
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isSentByCurrentUser ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
`;

const DeletedMessageBubble = styled(MessageBubble)`
  background-color: #f0f0f0;
  color: #000000;
  font-style: italic;
`;

const EditedTag = styled.span`
  color: #999999;
  font-size: 0.8em;
  margin-left: 5px;
`;

const OptionsContainer = styled(VStack)`
  background-color: #1a5f7a;
  border-radius: 8px;
  padding: 8px;
`;

const OptionButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
  color: white;
  &.edit {
    background-color: #f5f6ff;
  }
  &.delete {
    background-color: #fb4444;
  }
`;

const MessageStatus = styled.div`
  font-size: 0.7em;
  color: #999;
  text-align: right;
  margin-top: 2px;
`;

const SeenIndicator = styled.img`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 5px;
`;

const DateSeparator = styled.div`
  text-align: center;
  margin: 10px 0;
  color: #999;
  font-size: 0.9em;
`;

const VoiceMessageContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 5px 10px;
`;

const VoicePreview = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 10px;
  margin-top: 10px;
`;

const MenuOption = styled(MenuItem)`
  color: ${props => props.color || 'inherit'};
`;

const UnreadBadge = styled(Badge)`
  position: absolute;
  top: 0;
  left: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 12px;
`;

const MAX_RECORDING_TIME = 60000;

const Chat = ({ currentUser, otherUser, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const toast = useToast();
  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const [recorder, setRecorder] = useState(null);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!currentUser || !otherUser) {
      console.error("Current user or other user is not defined");
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.get(`/api/messages/${otherUser._id}`, {
        params: { page: pageNum, limit: 15 },
      });
      const { messages: newMessages, hasMore } = response.data;
      setMessages((prevMessages) => {
        const updatedMessages = Array.isArray(newMessages) 
          ? newMessages.filter(msg => msg && msg.createdAt && !isNaN(new Date(msg.createdAt).getTime()))
          : [];
        return pageNum === 1 ? updatedMessages : [...prevMessages, ...updatedMessages];
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
      setMessages([]);
      setPage(1);
      setHasMore(true);
      fetchMessages(1);
    }
    setNewMessage("");
  }, [isOpen, currentUser, otherUser, fetchMessages]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        if (message.sender._id === otherUser._id || message.sender._id === currentUser.id) {
          setMessages(prevMessages => [message, ...prevMessages]);
          if (message.sender._id === otherUser._id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      };

      const handleEditedMessage = (editedMessage) => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === editedMessage._id ? editedMessage : msg
          )
        );
      };

      const handleDeletedMessage = (deletedMessage) => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === deletedMessage._id ? deletedMessage : msg
          )
        );
      };

      socket.on('new message', handleNewMessage);
      socket.on('message edited', handleEditedMessage);
      socket.on('message deleted', handleDeletedMessage);

      return () => {
        socket.off('new message', handleNewMessage);
        socket.off('message edited', handleEditedMessage);
        socket.off('message deleted', handleDeletedMessage);
      };
    }
  }, [socket, currentUser.id, otherUser._id]);

  useEffect(() => {
    if (messages.length > 0 && socket && socket.connected) {
      const unseenMessages = messages
        .filter(msg => msg.recipient === currentUser.id && !msg.seen)
        .map(msg => msg._id);
      
      if (unseenMessages.length > 0) {
        socket.emit('mark as seen', unseenMessages, (error, updatedCount) => {
          if (error) {
            console.error('Error marking messages as seen:', error);
          } else {
            console.log(`${updatedCount} messages marked as seen`);
            setUnreadCount(0);
          }
        });
      }
    }
  }, [messages, currentUser.id, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("user typing", (userId) => {
        if (userId === otherUser._id) {
          setIsTyping(true);
        }
      });
      socket.on("user stop typing", (userId) => {
        if (userId === otherUser._id) {
          setIsTyping(false);
        }
      });
      return () => {
        socket.off("user typing");
        socket.off("user stop typing");
      };
    }
  }, [socket, otherUser._id]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() && !file && !audioBlob) return;
    if (!socket || !socket.connected) {
      toast({
        title: "Error",
        description: "Not connected to chat server. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      let mediaUrl = null;
      let messageType = "text";
  
      if (file) {
        if (file.type.startsWith("image/")) {
          const formData = new FormData();
          formData.append("file", file);
          const response = await api.post("/api/messages/upload", formData);
          mediaUrl = response.data.url;
          messageType = "image";
        } else {
          toast({
            title: "Error",
            description: "Only photos are allowed.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      } else if (audioBlob) {
        const formData = new FormData();
        formData.append("file", audioBlob, "voice_message.webm");
        const response = await api.post("/api/messages/upload", formData);
        mediaUrl = response.data.url;
        messageType = "voice";
      }
  
      const messageData = {
        sender: currentUser.id,
        recipient: otherUser._id,
        content: newMessage.trim(),
        media: mediaUrl,
        type: messageType,
      };
      
      socket.emit("private message", messageData, (error, sentMessage) => {
        if (error) {
          console.error("Error sending message:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to send message. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else {
          setMessages((prevMessages) => [sentMessage, ...prevMessages]);
          setNewMessage("");
          setFile(null);
          setAudioBlob(null);
          setAudioUrl(null);
        }
      });
    } catch (error) {
      console.error("Error handling message:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [newMessage, file, audioBlob, otherUser._id, currentUser.id, socket, toast]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket && socket.connected) {
      socket.emit("typing", { recipientId: otherUser._id });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop typing", { recipientId: otherUser._id });
      }, 3000);
    }
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
  
  const handleDeleteMessage = async (messageId) => {
    try {
      if (!socket || !socket.connected) {
        throw new Error("Socket connection not established");
      }
      socket.emit("delete message", messageId, (error, deletedMessage) => {
        if (error) {
          console.error("Error deleting message:", error);
          toast({
            title: "Error",
            description: "Failed to unsend message. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === deletedMessage._id ? deletedMessage : msg
            )
          );
  
          toast({
            title: "Message unsent",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to unsend message. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleEditMessage = (messageId, content) => {
    setEditingMessageId(messageId);
    setNewMessage(content);
    inputRef.current.focus();
  };
  
  const formatMessageTime = useCallback((timestamp) => {
    if (!timestamp) {
      console.warn("Empty timestamp provided to formatMessageTime");
      return '';
    }
    
    try {
      const messageDate = parseISO(timestamp);
      
      if (isNaN(messageDate.getTime())) {
        console.warn('Invalid date:', timestamp);
        return '';
      }
  
      if (isToday(messageDate)) {
        return format(messageDate, "h:mm a");
      } else if (isYesterday(messageDate)) {
        return `Yesterday ${format(messageDate, "h:mm a")}`;
      } else if (isThisWeek(messageDate)) {
        return format(messageDate, "EEEE h:mm a");
      } else {
        return format(messageDate, "dd.MM.yyyy h:mm a");
      }
    } catch (error) {
      console.error('Error formatting message time:', error);
      return '';
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newRecorder = RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        sampleRate: 44100,
        desiredSampRate: 16000,
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1
      });
      newRecorder.startRecording();
      setRecorder(newRecorder);
      setIsRecording(true);

      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, MAX_RECORDING_TIME);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your microphone permissions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const stopRecording = () => {
    if (recorder) {
      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
      });
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
  };
  
  const cancelRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };
  
  const sendVoiceMessage = async () => {
    if (!audioBlob) return;
  
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice_message.webm");
      formData.append("recipient", otherUser._id);
  
      const response = await api.post("/api/messages/voice", formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const sentMessage = response.data;
      setMessages((prevMessages) => [sentMessage, ...prevMessages]);
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (error) {
      console.error("Error sending voice message:", error);
      console.error("Error response:", error.response?.data);
      toast({
        title: "Error",
        description: "Failed to send voice message. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleDeleteConversation = async () => {
    try {
      await api.delete(`/api/messages/conversations/${otherUser._id}`);
      toast({
        title: "Conversation deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleBlockUser = async () => {
    setIsBlockModalOpen(true);
  };

  const confirmBlockUser = async () => {
    try {
      await api.post(`/api/users/block/${otherUser._id}`);
      toast({
        title: "User blocked",
        description: `${otherUser.username} has been blocked successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsBlockModalOpen(false);
      onClose();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  
  const handleReportConversation = async () => {
    try {
      await api.post(`/api/reports/create`, {
        reportedUserId: otherUser._id,
        conversationId: messages[0]?.conversationId,
        reason: "Inappropriate content",
      });
      toast({
        title: "Conversation reported",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error reporting conversation:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to report conversation. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    return messages.map((msg, index) => {
      if (!msg || !msg.createdAt) {
        console.warn("Invalid message or missing createdAt:", msg);
        return null;
      }
      
      let currentDate;
      try {
        currentDate = parseISO(msg.createdAt);
        if (isNaN(currentDate.getTime())) {
          console.warn("Invalid date:", msg.createdAt);
          return null;
        }
      } catch (error) {
        console.error("Error parsing date:", error);
        return null;
      }
  
      const showDateSeparator = !lastDate || !isSameDay(currentDate, lastDate);
      lastDate = currentDate;
  
      const isSentByCurrentUser = msg.sender._id === currentUser.id;
  
      return (
        <React.Fragment key={`${msg._id}-${index}`}>
          {showDateSeparator && (
            <DateSeparator>
              {format(currentDate, 'MMMM d, yyyy')}
            </DateSeparator>
          )}
          <MessageWrapper $isSentByCurrentUser={isSentByCurrentUser}>
            {msg.deleted ? (
              <DeletedMessageBubble>
                <MessageContent>This message was unsent.</MessageContent>
                <MessageTime>
                  {msg.createdAt ? formatMessageTime(msg.createdAt) : ''}
                </MessageTime>
              </DeletedMessageBubble>
            ) : (
              <Popover placement="top" trigger="click">
                <PopoverTrigger>
                  <MessageBubble $isSentByCurrentUser={isSentByCurrentUser}>
                    {msg.type === "image" && (
                      <img
                        src={msg.media}
                        alt="Uploaded media"
                        style={{
                          maxWidth: "100%",
                          marginBottom: "10px",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                    {msg.type === "voice" && (
                      <VoiceMessageContainer>
                        <audio controls src={msg.media} />
                      </VoiceMessageContainer>
                    )}
                    <MessageContent>{msg.content}</MessageContent>
                    {msg.edited && <EditedTag>edited</EditedTag>}
                    <MessageTime>{msg.createdAt ? formatMessageTime(msg.createdAt) : ''}</MessageTime>
                    <MessageStatus>
                      {isSentByCurrentUser && (msg.seen ? "Seen" : "Sent")}
                      {msg.seen && isSentByCurrentUser && (
                        <SeenIndicator src={otherUser.photo} alt={otherUser.username} />
                      )}
                    </MessageStatus>
                  </MessageBubble>
                </PopoverTrigger>
                {isSentByCurrentUser && (
                  <PopoverContent>
                    <PopoverBody>
                      <OptionsContainer>
                        {msg.type !== "voice" && (
                          <OptionButton className="edit" onClick={() => handleEditMessage(msg._id, msg.content)}>
                            Edit
                          </OptionButton>
                        )}
                        <OptionButton className="delete" onClick={() => handleDeleteMessage(msg._id)}>
                          Delete
                        </OptionButton>
                      </OptionsContainer>
                    </PopoverBody>
                  </PopoverContent>
                )}
              </Popover>
            )}
          </MessageWrapper>
        </React.Fragment>
      );
    }).filter(Boolean);
  };
  
  if (!isOpen) return null;
  
  return (
    <ChatContainer>
      <Header>
        <UserInfo>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Back"
            onClick={onClose}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
          <Avatar src={otherUser.photo} alt={otherUser.username} />
          <Username>{otherUser.username}</Username>
          {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
        </UserInfo>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<MoreVertical />}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
          <MenuList>
            <MenuOption onClick={handleDeleteConversation} color="red.500">Delete Conversation</MenuOption>
            <MenuOption onClick={handleBlockUser} color="orange.500">Block User</MenuOption>
            <MenuOption onClick={handleReportConversation} color="yellow.500">Report Conversation</MenuOption>
          </MenuList>
        </Menu>
      </Header>

      <MessageContainer ref={messageContainerRef} id="scrollableDiv">
        <InfiniteScroll
          dataLength={messages.length}
          next={() => fetchMessages(page)}
          hasMore={hasMore}
          loader={<Spinner />}
          scrollableTarget="scrollableDiv"
          inverse={true}
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {renderMessages()}
        </InfiniteScroll>
        {isTyping && <TypingIndicator>Typing...</TypingIndicator>}
      </MessageContainer>

      <InputContainer>
        {audioUrl ? (
          <VoicePreview>
            <audio controls src={audioUrl} />
            <IconButton
              icon={<CloseIcon />}
              onClick={cancelRecording}
              variant="ghost"
              aria-label="Cancel recording"
            />
            <IconButton
              icon={<FaPaperPlane />}
              onClick={sendVoiceMessage}
              colorScheme="blue"
              aria-label="Send voice message"
            />
          </VoicePreview>
        ) : (
          <>
            <StyledInput
              placeholder={editingMessageId ? "Edit message..." : "Type a message..."}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            />
            <input
              type="file"
              accept="image/*"
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
              icon={isRecording ? <FaStop /> : <FaMicrophone />}
              onClick={isRecording ? stopRecording : startRecording}
              variant="ghost"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              colorScheme={isRecording ? "red" : "gray"}
            />
            <IconButton
              icon={<FaPaperPlane />}
              colorScheme="purple"
              onClick={handleSendMessage}
              aria-label="Send message"
            />
          </>
        )}
      </InputContainer>

      <Modal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Block User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to block {otherUser.username} forever? This action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={confirmBlockUser}>
            Yes, Block User
          </Button>
          <Button variant="ghost" onClick={() => setIsBlockModalOpen(false)}>
            No, Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </ChatContainer>
  );
};

export default Chat;