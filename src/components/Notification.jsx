import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSocket } from "../contexts/SocketContext";
const NotificationBadge = styled.div`
  background-color: #ff4d4f;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  position: absolute;
  top: -5px;
  right: -5px;
`;

const NotificationWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Notification = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('new notification', (data) => {
        if (data.recipientId === userId) {
          setUnreadCount((prevCount) => prevCount + 1);
        }
      });

      return () => {
        socket.off('new notification');
      };
    }
  }, [socket, userId]);

  if (unreadCount === 0) return null;

  return (
    <NotificationWrapper>
      <NotificationBadge>{unreadCount}</NotificationBadge>
    </NotificationWrapper>
  );
};

export default Notification;