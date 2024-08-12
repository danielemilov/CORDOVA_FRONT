import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const ConversationContainer = styled.div`
  padding: 10px;
`;

const Message = styled.div`
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  background-color: ${props => props.unread ? '#f0f8ff' : 'transparent'};
  font-weight: ${props => props.unread ? 'bold' : 'normal'};
`;

function Conversation({ userId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await axios.get(`/api/messages/${userId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    fetchMessages();
  }, [userId]);

  useEffect(() => {
    async function markAsRead() {
      try {
        await axios.post('/api/messages/mark-read', { senderId: userId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }

    markAsRead();
  }, [userId]);

  return (
    <ConversationContainer>
      {messages.map((message) => (
        <Message
          key={message._id}
          unread={!message.read}
        >
          <p>{message.content}</p>
        </Message>
      ))}
    </ConversationContainer>
  );
}

export default Conversation;
