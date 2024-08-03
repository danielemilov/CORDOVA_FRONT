import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import Chat from './components/Chat';
import Login from './components/Login';
import Register from './components/Register';
import EmailVerification from './components/EmailVerification';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          {user ? (
            <Route path="/chat" element={<Chat user={user} setUser={setUser} />} />
          ) : (
            <>
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register />} />
            </>
          )}
          <Route path="/verify-email/:token" element={<EmailVerification />} />
          <Route path="*" element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;