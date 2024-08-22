import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconButton, useToast, Spinner, Input, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, VStack, Box, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
import { FaPaperPlane, FaMicrophone, FaStop } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, isToday, isYesterday, isThisWeek, parseISO, isSameDay } from "date-fns";
import api from "../api";
import { useSocket } from "../contexts/SocketContext";
import styled from "styled-components";
import { MoreVerticalIcon } from 'lucide-react';  // Or another icon library


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
  flex-direction: column;
`;

const MessageBubble = styled.div`
  max-width: 100%;
  padding: 10px;
  border-radius: 20px;
  background-color: ${(props) => (props.$isSentByCurrentUser ? "rgb(192, 132, 237)" : "#ffffff")};
  color: ${(props) => (props.$isSentByCurrentUser ? "#ffffff" : "#000000")};
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
  justify-content: ${(props) => (props.$isSentByCurrentUser ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
  position: relative;
`;

const DeletedMessageBubble = styled(MessageBubble)`
  background-color: #f0f0f0;
  color: #000000;
`;

const EditedTag = styled.span`
  color: #999999;
  font-size: 0.8em;
  position: absolute;
  top: -15px;
  right: 5px;
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

const MAX_RECORDING_TIME = 60000; // 60 seconds

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
  const toast = useToast();
  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingTimeoutRef = useRef(null);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!currentUser || !otherUser) {
      console.error("Current user or other user is not defined");
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.get(`/api/messages/${otherUser._id}`, {
        params: { page: pageNum, limit: 20 },
      });
      const { messages: newMessages, hasMore } = response.data;
      setMessages((prevMessages) => {
        const updatedMessages = Array.isArray(newMessages) ? newMessages : [];
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
  }, [isOpen, currentUser, otherUser, fetchMessages]);

  const markMessagesAsSeen = useCallback((messageIds) => {
    socket.emit('mark as seen', messageIds, (error, updatedCount) => {
      if (error) {
        console.error('Error marking messages as seen:', error);
      } else {
        console.log(`${updatedCount} messages marked as seen`);
      }
    });
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('new message', handleNewMessage);
      socket.on('message edited', handleEditedMessage);
      socket.on('message deleted', handleDeletedMessage);

      return () => {
        socket.off('new message', handleNewMessage);
        socket.off('message edited', handleEditedMessage);
        socket.off('message deleted', handleDeletedMessage);
      };
    }
  }, [socket]);

  const handleNewMessage = useCallback((message) => {
    setMessages(prevMessages => [...prevMessages, message]);
    scrollToBottom();
  }, []);

  const handleEditedMessage = useCallback((editedMessage) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg._id === editedMessage._id ? editedMessage : msg
      )
    );
  }, []);

  const handleDeletedMessage = useCallback((deletedMessage) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg._id === deletedMessage._id ? deletedMessage : msg
      )
    );
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const unseenMessages = messages
        .filter(msg => msg.recipient === currentUser.id && !msg.seen)
        .map(msg => msg._id);
      
      if (unseenMessages.length > 0) {
        markMessagesAsSeen(unseenMessages);
      }
    }
  }, [messages, currentUser.id, markMessagesAsSeen]);

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
        recipient: otherUser._id,
        content: newMessage.trim(),
        media: mediaUrl,
        type: messageType,
      };
      if (editingMessageId) {
        socket.emit("edit message", { messageId: editingMessageId, content: newMessage.trim() }, (error, updatedMessage) => {
          if (error) {
            console.error("Error editing message:", error);
            toast({
              title: "Error",
              description: "Failed to edit message. Please try again.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          } else {
            setMessages((prevMessages) =>
              prevMessages.map((msg) => (msg._id === updatedMessage._id ? { ...updatedMessage, edited: true } : msg))
            );
            setNewMessage("");
            setEditingMessageId(null);
          }
        });
      } else {
        socket.emit("private message", messageData, (error, sentMessage) => {
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
            setAudioBlob(null);
            setAudioUrl(null);
            scrollToBottom();
          }
        });
      }
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
  }, [newMessage, file, audioBlob, otherUser._id, socket, toast, editingMessageId, scrollToBottom]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    socket.emit("typing", { recipientId: otherUser._id });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", { recipientId: otherUser._id });
    }, 3000);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();
      const compressor = audioContext.createDynamicsCompressor();

      source.connect(compressor);
      compressor.connect(destination);

      mediaRecorderRef.current = new MediaRecorder(destination.stream, { mimeType: 'audio/webm' });
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, MAX_RECORDING_TIME);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error.name === 'NotSupportedError') {
        alert('Audio recording is not supported in this browser. Please try using a different browser.');
      } else {
        toast({
          title: "Error",
          description: "Failed to start recording. Please check your microphone permissions.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
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
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setAudioBlob(null);
      setAudioUrl(null);
      scrollToBottom();
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
      await api.delete(`/api/messages/conversation/${otherUser._id}`);
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
    try {
      await api.post(`/api/users/block/${otherUser._id}`);
      toast({
        title: "User blocked",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
        priority: "medium"
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
        description: "Failed to report conversation. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    return messages.map((msg, index) => {
      if (!msg || !msg.sender) {
        console.warn("Invalid message received:", msg);
        return null;
      }
      const currentDate = parseISO(msg.timestamp);
      const showDateSeparator = !lastDate || !isSameDay(currentDate, lastDate);
      lastDate = currentDate;

      const isSentByCurrentUser = msg.sender._id === currentUser.id;
      const isFirstInSequence = index === 0 || messages[index - 1].sender._id !== msg.sender._id;
      const showAvatar = !isSentByCurrentUser && isFirstInSequence;

      return (
        <React.Fragment key={`${msg._id}-${index}`}>
          {showDateSeparator && (
            <DateSeparator>
              {format(currentDate, 'MMMM d, yyyy')}
            </DateSeparator>
          )}
          <MessageWrapper $isSentByCurrentUser={isSentByCurrentUser}>
            {showAvatar && <Avatar src={otherUser.photo} alt={otherUser.username} />}
            <Box ml={showAvatar ? 2 : 0}>
              {msg.deleted ? (
                <DeletedMessageBubble>
                  <MessageContent>{msg.content}</MessageContent>
                  <MessageTime>{formatMessageTime(msg.timestamp)}</MessageTime>
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
                      <MessageTime>{formatMessageTime(msg.timestamp)}</MessageTime>
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
            </Box>
          </MessageWrapper>
        </React.Fragment>
      );
    });
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
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<MoreVerticalIcon />}
            variant="ghost"
            colorScheme="whiteAlpha"
          />
          <MenuList>
            <MenuItem onClick={handleDeleteConversation}>Delete Conversation</MenuItem>
            <MenuItem onClick={handleBlockUser}>Block User</MenuItem>
            <MenuItem onClick={handleReportConversation}>Report Conversation</MenuItem>
          </MenuList>
        </Menu>
      </Header>

      <MessageContainer ref={messageContainerRef} id="scrollableDiv">
        {isLoading && messages.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Spinner size="xl" />
          </div>
        ) : (
          <InfiniteScroll
            dataLength={messages.length}
            next={() => fetchMessages(page)}
            hasMore={hasMore}
            loader={<div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}><Spinner size="md" /></div>}
            scrollableTarget="scrollableDiv"
            inverse={false}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {renderMessages()}
          </InfiniteScroll>
        )}
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
    </ChatContainer>
  );
};

export default Chat;