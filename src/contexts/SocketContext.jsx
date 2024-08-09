// SocketContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket:', reason);
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};