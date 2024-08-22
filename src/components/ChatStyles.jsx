// ChatStyles.js
import styled from 'styled-components';
import { VStack } from "@chakra-ui/react";


export const Sidebar = styled.div`
  width: 30%;
  background-color: #0000003b;
  border-right: 1px solid #333333;
  overflow-y: auto;
`;

export const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;



export const UserList = styled.div`
  overflow-y: auto;
`;

export const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #333333;
  }

  ${({ $active }) => $active && `
    background-color: #1a1a1a;
  `}
`;



export const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #0000003b;
`;

export const MessageItem = styled.div`
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 15px;
  margin-bottom: 15px;
  position: relative;
  font-size: 16px;

  ${({ sent }) => sent ? `
    align-self: flex-end;
    background-color: #007AFF;
    color: white;
  ` : `
    align-self: flex-start;
    background-color: #333333;
    color: white;
  `}
`;

export const MessageInput = styled.div`
  display: flex;
  padding: 15px;
  background-color: #0000003b;
`;

export const Input = styled.input`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  background-color: #333333;
  color: white;
  font-size: 16px;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
`;

export const SendButton = styled.button`
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  margin-left: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }
`;

export const ChatContainer = styled.div`
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

export const Header = styled.header`
  background-color: #000000;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

export const Username = styled.span`
  font-weight: bold;
`;

export const MessageContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

export const MessageBubble = styled.div`
  max-width: 100%;
  padding: 10px;
  border-radius: 20px;
  background-color: ${(props) => (props.$isSentByCurrentUser ? "rgb(192, 132, 237)" : "#ffffff")};
  color: ${(props) => (props.$isSentByCurrentUser ? "#ffffff" : "#000000")};
  position: relative;
`;


export const MessageContent = styled.p`
  margin: 0;
  white-space: pre-wrap;
`;

export const MessageTime = styled.span`
  font-size: 0.8em;
  color: #666;
  display: block;
  text-align: right;
  margin-top: 5px;
`;

export const InputContainer = styled.div`
  padding: 1rem;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
`;

export const StyledInput = styled(Input)`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
`;

export const TypingIndicator = styled.div`
  font-size: 0.8em;
  color: #ffffff;
  margin-left: 10px; 
`;

export const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${(props) => (props.$isSentByCurrentUser ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
  position: relative;
`;

export const DeletedMessageBubble = styled(MessageBubble)`
  background-color: #f0f0f0;
  color: #000000;
`;

export const EditedTag = styled.span`
  color: #999999;
  font-size: 0.8em;
  position: absolute;
  top: -15px;
  right: 5px;
`;

export const OptionsContainer = styled(VStack)`
  background-color: #1a5f7a;
  border-radius: 8px;
  padding: 8px;
`;
 
export const OptionButton = styled(Button)`
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

export const MessageStatus = styled.div`
  font-size: 0.7em;
  color: #999;
  text-align: right;
  margin-top: 2px;
`;

export const SeenIndicator = styled.img`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 5px;
`;

export const DateSeparator = styled.div`
  text-align: center;
  margin: 10px 0;
  color: #999;
  font-size: 0.9em;
`;

export const VoiceMessageContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 5px 10px;
`;

export const VoicePreview = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 10px;
  margin-top: 10px;
`;

export default {
  ChatContainer,
  Sidebar,
  ChatArea,
  Header,
  UserList,
  UserItem,
  Avatar,
  MessageList,
  MessageItem,
  MessageInput,
  Input,
  SendButton,
  Username,
  MessageContainer,
  MessageBubble,
  MessageContent,
  MessageTime,
  InputContainer,
  StyledInput,
  TypingIndicator,
  MessageWrapper,
  DeletedMessageBubble,
  EditedTag,
  OptionsContainer,
  OptionButton,
  MessageStatus,
  SeenIndicator,
  DateSeparator,
  VoiceMessageContainer,
  VoicePreview
};
