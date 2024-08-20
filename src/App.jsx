import React, { useState, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import MainPage from "./components/MainPage";
import Login from "./components/Login";
import Register from "./components/Register";
import EmailVerification from "./components/EmailVerification";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { theme, GlobalStyle } from "./SharedStyles";
import { SocketProvider } from './contexts/SocketContext';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <GlobalStyle />
      <SocketProvider>
        <Router>
          <Routes>
            {user ? (
              <Route
                path="/"
                element={
                  <MainPage
                    user={user}
                    setUser={setUser}
                    onLogout={handleLogout}
                  />
                }
              />
            ) : (
              <>
                <Route path="login" element={<Login onLogin={handleLogin} />} />
                <Route path="register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
              </>
            )}
            <Route path="verify-email/:token" element={<EmailVerification />} />
            <Route
              path="*"
              element={user ? <Navigate to="/" /> : <Navigate to="/login" />}
            />
          </Routes>
        </Router>
      </SocketProvider>
    </ChakraProvider>
  );
}

export default App;