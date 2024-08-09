import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f7f7;
  padding: 20px;
`;

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 34px;
  font-weight: 100;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 25px;
  background-color: #f0f0f0;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #333;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background-color: #333;
  color: #27b600;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #555;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  margin-top: 10px;
`;

const LinkText = styled(Link)`
  color: #333;
  text-decoration: none;
  margin-top: 20px;
  text-align: center;
  display: block;

  &:hover {
    text-decoration: underline;
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const TogglePasswordVisibility = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
`;

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password }, {
        withCredentials: true
      });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLogin(response.data.user);
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginWrapper>
      <LoginForm onSubmit={handleSubmit}>
        <Title>FE!N</Title>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <PasswordWrapper>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <TogglePasswordVisibility
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </TogglePasswordVisibility>
        </PasswordWrapper>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <LinkText to="/register">Don't have an account? Register</LinkText>
        <LinkText to="/forgot-password">Forgot Password?</LinkText>
      </LoginForm>
    </LoginWrapper>
  );
}

export default Login;