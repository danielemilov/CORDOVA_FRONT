import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './components/Chat';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
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
        <Route path="*" element={user ? <Chat user={user} setUser={setUser} /> : <Login setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
