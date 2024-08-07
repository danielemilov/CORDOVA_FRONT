// App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ChakraProvider, useToast } from "@chakra-ui/react";
import { io } from "socket.io-client";
import theme from "./theme";
import MainPage from "./components/MainPage";
import Login from "./components/Login";
import Register from "./components/Register";
import EmailVerification from "./components/EmailVerification";
import Settings from "./components/Settings";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [socket, setSocket] = useState(null);
  const toast = useToast();

  const setupSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (user && token && !socket) {
      const newSocket = io(API_BASE_URL, {
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

      newSocket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket:', reason);
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('user status', ({ userId, isOnline }) => {
        console.log('User status update:', userId, isOnline);
        // You might want to update the user list here if you're keeping it in the App state
      });

      newSocket.on('new notification', (notification) => {
        if (notification.type === 'new_message') {
          toast({
            title: "New Message",
            description: `New message from ${notification.message.sender.username}`,
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
      });

      return newSocket;
    }
    return null;
  }, [user, toast]);

  useEffect(() => {
    const newSocket = setupSocket();
    if (newSocket) {
      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [setupSocket]);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          {user ? (
            <>
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
              <Route
                path="/settings"
                element={<Settings user={user} setUser={setUser} />}
              />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </>
          )}
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route
            path="*"
            element={user ? <Navigate to="/" /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;