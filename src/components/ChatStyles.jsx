// ChatStyles.js
import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
`;

export const Sidebar = styled.div`
  width: 30%;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
`;

export const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  background-color: #075e54;
  color: white;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const UserList = styled.div`
  overflow-y: auto;
`;

export const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }

  ${({ $active }) => $active && `
    background-color: #ebebeb;
  `}
`;


export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
`;

export const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #e5ddd5;
`;

export const MessageItem = styled.div`
  max-width: 60%;
  padding: 8px 12px;
  border-radius: 7.5px;
  margin-bottom: 10px;
  position: relative;
  ${({ sent }) => sent ? `
    align-self: flex-end;
    background-color: #dcf8c6;
  ` : `
    align-self: flex-start;
    background-color: #ffffff;
  `}
`;

export const MessageInput = styled.div`
  display: flex;
  padding: 10px;
  background-color: #f0f0f0;
`;

export const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 21px;
  background-color: white;
`;

export const SendButton = styled.button`
  background-color: #075e54;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;