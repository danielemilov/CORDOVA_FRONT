import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconButton, useToast, Spinner, Input, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, VStack, Box } from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
import { FaPaperPlane, FaMicrophone, FaStop } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { format, isToday, isYesterday, isThisWeek, parseISO, isSameDay } from "date-fns";
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

const Header = styled.header`
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
  flex-direction: column;
`;

const MessageBubble = styled.div`
  max-width: 100%;
  padding: 10px;
  border-radius: 20px;
  background-color: ${(props) => (props.$isSentByCurrentUser ? "#6ecb91" : "#ffffff")};
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
  color: #999;
  margin-left: 10px;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${(props) => (props.$isSentByCurrentUser ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
  position: relative;
`;

const DeletedMessageBubble = styled(MessageBubble)`
  background-color: #000000;
  color: #ffffff;
`;

const EditedTag = styled.span`
  color: red;
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
    background-color: #3498db;
  }
  &.delete {
    background-color: #2c3e50;
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
      socket.on("private message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
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
      socket.on("message deleted", (messageId) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, content: "This message was unsent.", deleted: true } : msg
          )
        );
      });
      socket.on("message edited", (updatedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === updatedMessage._id ? { ...updatedMessage, edited: true } : msg))
        );
      });
      socket.on("message seen", (messageId) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === messageId ? { ...msg, seen: true } : msg))
        );
      });
      return () => {
        socket.off("private message");
        socket.off("user typing");
        socket.off("user stop typing");
        socket.off("message deleted");
        socket.off("message edited");
        socket.off("message seen");
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
  }, [newMessage, file, audioBlob, otherUser._id, socket, toast, editingMessageId]);

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
      socket.emit("delete message", messageId, (error) => {
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
              msg._id === messageId ? { ...msg, content: "This message was unsent.", deleted: true } : msg
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
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];
  
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
  
      mediaRecorderRef.current.start();
      setIsRecording(true);
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
  
      console.log('FormData contents:', formData);
  
      const response = await api.post("/api/messages/voice", formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log('Voice message sent successfully:', response.data);
  
      const sentMessage = response.data;
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
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
  const renderMessage = (msg, index, messages) => {
    if (!msg || !msg.sender) {
      console.warn("Invalid message received:", msg);
      return null;
    }

    const isSentByCurrentUser = msg.sender._id === currentUser.id;
    const isFirstInSequence = index === 0 || messages[index - 1].sender._id !== msg.sender._id;
    const showAvatar = !isSentByCurrentUser && isFirstInSequence;
    const currentDate = parseISO(msg.timestamp);
    const previousDate = index > 0 ? parseISO(messages[index - 1].timestamp) : null;
    const showDateSeparator = index === 0 || !isThisWeek(currentDate) || (previousDate && !isSameDay(currentDate, previousDate));

    return (
      <React.Fragment key={msg._id}>
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
        {isTyping && <TypingIndicator>Typing...</TypingIndicator>}
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
            inverse={true}
            style={{ display: "flex", flexDirection: "column-reverse" }}
          >
            {messages.slice().reverse().map((msg, index, array) => renderMessage(msg, array.length - 1 - index, array.slice().reverse()))}
          </InfiniteScroll>
        )}
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
              colorScheme="blue"
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