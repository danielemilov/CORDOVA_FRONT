// SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

    if (token) {
      const newSocket = io(API_BASE_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        setSocket(newSocket);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket:', reason);
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      return () => {
        newSocket.close();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};