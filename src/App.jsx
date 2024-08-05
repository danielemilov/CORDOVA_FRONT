import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import theme from './theme';
import MainPage from './components/MainPage';
import Login from './components/Login';
import Register from './components/Register';
import EmailVerification from './components/EmailVerification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connectToWebSocket = async () => {
      try {
        if (user) {
          const newSocket = io(API_BASE_URL, {
            auth: { token: localStorage.getItem('token') },
            transports: ['websocket'],
            upgrade: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          });

          newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            setSocket(newSocket);
          });

          newSocket.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err);
            // Handle the error, e.g., display an error message to the user
          });

          newSocket.on('disconnect', () => {
            console.error('WebSocket connection disconnected');
            // Handle the disconnection, e.g., try to reconnect
          });
        }
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        // Handle the error, e.g., display an error message to the user
      }
    };

    connectToWebSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, API_BASE_URL]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          {user ? (
            <Route
              path="/"
              element={
                <MainPage
                  user={user}
                  setUser={setUser}
                  socket={socket}
                  onLogout={handleLogout}
                />
              }
            />
          ) : (
            <>
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register />} />
            </>
          )}
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;