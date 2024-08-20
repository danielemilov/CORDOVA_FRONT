// ChatStyles.js
import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #000000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

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

export const Header = styled.div`
  background-color: #0000003b;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-right-radius: 20px;
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

export const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
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
  SendButton
};