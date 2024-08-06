import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { io } from "socket.io-client";
import theme from "./theme";
import MainPage from "./components/MainPage";
import Login from "./components/Login";
import Register from "./components/Register";
import EmailVerification from "./components/EmailVerification";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
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
  
      return () => {
        if (newSocket) newSocket.disconnect();
      };
    }
  }, [user]);


  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
