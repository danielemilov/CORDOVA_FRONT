import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import io from 'socket.io-client';
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
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) newSocket.disconnect();
      };
    }
  }, [user]);

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