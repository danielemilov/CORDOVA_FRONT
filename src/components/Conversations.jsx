import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IonContent, IonList, IonItem, IonAvatar, IonLabel, IonBadge, IonSpinner, IonButton, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import api from '../api';
import { useSocket } from '../contexts/SocketContext';
import { format, isToday, isYesterday, isThisWeek, parseISO, formatDistanceToNow } from 'date-fns';

const UnreadBadge = styled(IonBadge)`
  margin-left: 10px;
`;

const LastMessage = styled(IonLabel)`
  color: ${props => props.$unread ? '#000' : '#666'};
  font-weight: ${props => props.$unread ? 'bold' : 'normal'};
  font-size: 14px;
  line-height: 1.4;
`;

const TimeStamp = styled(IonLabel)`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
`;

const NoConversationsMessage = styled(IonText)`
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-top: 20px;
`;

const Conversations = ({ onSelectConversation, filter, unreadMessages, currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();
  const history = useHistory();

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/messages/conversations');
      if (Array.isArray(response.data)) {
        setConversations(response.data);
        console.log("PLACE1")
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Received unexpected data format from server');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch conversations';
      setError(errorMessage);
      if (error.response?.status === 401) {
        history.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (socket) {
      const handleUpdateConversation = (updatedConversation) => {
        console.log("PLACE2")
        setConversations(prevConversations => {
          const existingIndex = prevConversations.findIndex(conv => conv._id === updatedConversation._id);

          if (existingIndex !== -1) {
            const updatedConversations = [...prevConversations];
            updatedConversations[existingIndex] = updatedConversation;
            return updatedConversations.sort((a, b) => 
              new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
            );
          } else {
            return [updatedConversation, ...prevConversations];
          }
        });
      };

      const handleMessageRead = ({ conversationId }) => {
        console.log("PLACE3")

        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      };

      const handleNewMessage = (message) => {
        console.log("PLACE4")

        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv => {
            if (conv._id === message.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.unreadCount + (message.sender._id !== currentUser.id ? 1 : 0),
              };
            }
            return conv;
          });
          return updatedConversations.sort((a, b) => 
            new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
          );
        });
      };

      socket.on('update conversation', handleUpdateConversation);
      socket.on('message read', handleMessageRead);
      socket.on('new message', handleNewMessage);

      return () => {
        socket.off('update conversation', handleUpdateConversation);
        socket.off('message read', handleMessageRead);
        socket.off('new message', handleNewMessage);
      };
    }
  }, [socket, currentUser.id]);

  const formatLastMessageTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    try {
      const date = parseISO(timestamp);
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else if (isThisWeek(date)) {
        return format(date, 'EEEE');
      } else {
        return formatDistanceToNow(date, { addSuffix: true });
      }
    } catch (error) {
      console.error('Error formatting last message time:', error);
      return '';
    }
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
      conv.participants && conv.participants.length > 0 && (
        conv.participants.some(p => 
          p.username && p.username.toLowerCase().includes(filter.toLowerCase())
        ) ||
        (conv.lastMessage && conv.lastMessage.content && 
         conv.lastMessage.content.toLowerCase().includes(filter.toLowerCase()))
      )
    );
  }, [conversations, filter]);

  const handleConversationClick = useCallback(async (conversation) => {
    if (socket && socket.connected) {
      socket.emit('mark as read', { conversationId: conversation._id }, (error) => {
        if (error) {
          console.error('Error marking messages as read:', error);
        } else {
          console.log("PLACE5")

          setConversations(prevConversations =>
            prevConversations.map(conv =>
              conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
            )
          );
        }
      });
    } else {
      console.warn('Socket is not connected. Unable to mark messages as read.');
    }
    const otherUser = conversation.participants.find(p => p._id !== currentUser.id);
    onSelectConversation(otherUser);
  }, [socket, onSelectConversation, currentUser]);

  if (isLoading) {
    return (
      <IonContent className="ion-padding">
        <IonSpinner />
      </IonContent>
    );
  }

  if (error) {
    return (
      <IonContent className="ion-padding ion-text-center">
        <IonText color="danger">{error}</IonText>
        <IonButton onClick={fetchConversations}>Retry</IonButton>
      </IonContent>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <IonContent className="ion-padding ion-text-center">
        <NoConversationsMessage>No conversations found</NoConversationsMessage>
        <IonButton onClick={fetchConversations}>Refresh</IonButton>
      </IonContent>
    );
  }

  return (
    <IonContent>
      <IonList>
        {filteredConversations.map((conversation) => {
          const otherUser = conversation.participants.find(p => p._id !== currentUser.id);
          if (!otherUser) {
            console.warn("Other user not found in conversation:", conversation);
            return null;
          }
          const isUnread = conversation.unreadCount > 0 && conversation.lastMessage?.sender._id !== currentUser.id;
          return (
            <IonItem 
              key={conversation._id}
              onClick={() => handleConversationClick(conversation)}
              button
            >
              <IonAvatar slot="start">
                <img src={otherUser.photo || 'https://via.placeholder.com/150'} alt={otherUser.username} />
              </IonAvatar>
              <IonLabel>
                <h2>{otherUser.username}</h2>
                <LastMessage $unread={isUnread}>
                  {conversation.lastMessage ? conversation.lastMessage.content : "No messages yet"}
                </LastMessage>
              </IonLabel>
              <div slot="end">
                {isUnread && (
                  <UnreadBadge color="danger">{conversation.unreadCount}</UnreadBadge>
                )}
                <TimeStamp>
                  {conversation.lastMessage && formatLastMessageTime(conversation.lastMessage.createdAt)}
                </TimeStamp>
              </div>
            </IonItem>
          );
        })}
      </IonList>
    </IonContent>
  );
};

export default React.memo(Conversations);