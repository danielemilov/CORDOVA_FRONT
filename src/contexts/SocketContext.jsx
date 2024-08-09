import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Initialize with token from localStorage

  useEffect(() => {
    const connectToWebSocket = () => {
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
          // Handle the error, e.g., display an error message to the user
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
    };

    const cleanup = connectToWebSocket();

    return cleanup;
  }, [token]); // Re-run effect when token changes

  useEffect(() => {
    const handleTokenChange = () => {
      const newToken = localStorage.getItem('token');
      if (newToken !== token) {
        setToken(newToken);
      }
    };

    handleTokenChange(); // Initial check

    window.addEventListener('storage', handleTokenChange); // Update token if changed in other tabs

    return () => {
      window.removeEventListener('storage', handleTokenChange);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
