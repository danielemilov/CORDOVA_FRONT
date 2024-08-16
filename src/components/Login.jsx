import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api';
import Fluid from 'webgl-fluid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: rgb(227, 223, 227);
  background: -moz-radial-gradient(circle, rgba(135,206,250,0.4) 68%, rgb(255, 255, 255) 100%);
  background: -webkit-radial-gradient(circle, rgba(135,206,250,0.4) 68%, rgb(255, 255, 255) 100%);
  background: radial-gradient(circle, rgba(135,206,250,0.4) 28%, rgba(255,255,255,0.539) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#87cefa",endColorstr="#ffffff",GradientType=1);
`;

const LoginWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: transparent;
  z-index: 1;
`;

const LoginForm = styled.form`
  position: relative;
  width: 100%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const FormContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 34px;
  font-weight: bolder;
  color: #3b3193;
  text-align: center;
  margin-bottom: 30px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  border: .1px solid lightgrey;
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 0.798);
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.5);
    background-color: rgba(255, 255, 255, 0.8);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background-color: rgba(59, 130, 246, 0.8);
  color: #ffffff;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(37, 99, 235, 0.9);
  }

  &:disabled {
    background-color: rgba(204, 204, 204, 0.5);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff0000;
  text-align: center;
  margin-top: 10px;
`;

const LinkText = styled(Link)`
  color: #3b82f6;
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
  color: #3b82f6;
`;

const FluidContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const FluidCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

function FluidSimulation() {
  const canvasRef = useRef(null);
  const [fluidInstance, setFluidInstance] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initializeFluid = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const fluidOptions = {
        SPLAT_RADIUS: 0.6,
        DENSITY_DISSIPATION: 0.98,
        VELOCITY_DISSIPATION: 0.99,
        PRESSURE_DISSIPATION: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 30,
        SPLAT_FORCE: 6000,
        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 10,
        PAUSED: false,
        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: true,
        BLOOM: true,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.4,
        BLOOM_THRESHOLD: 0.8,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 1.0,
        COLOR_PALETTE: [
          { r: 59, g: 130, b: 246 },
          { r: 37, g: 99, b: 235 },
          { r: 147, g: 197, b: 253 },
          { r: 191, g: 219, b: 254 },
          { r: 219, g: 234, b: 254 },
        ]
      };

      const newFluidInstance = Fluid(canvas, fluidOptions);
      setFluidInstance(newFluidInstance);
    };

    initializeFluid();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (fluidInstance) {
        fluidInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (fluidInstance) {
        fluidInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!fluidInstance) return;

    let lastTime = 0;
    const animate = (time) => {
      if (lastTime !== 0) {
        const delta = (time - lastTime) / 1000;
        fluidInstance.update();

        if (Math.random() < 0.03) {
          const x = Math.random();
          const y = Math.random();
          const dx = (Math.random() - 0.5) * 0.01;
          const dy = (Math.random() - 0.5) * 0.01;
          fluidInstance.addSplat(x, y, dx, dy);
        }
      }
      lastTime = time;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [fluidInstance]);

  return (
    <FluidContainer>
      <FluidCanvas ref={canvasRef} />
    </FluidContainer>
  );
}

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
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
    <PageContainer>
      <LoginWrapper>
        <LoginForm onSubmit={handleSubmit}>
          <FluidSimulation />
          <FormContent>
            <Title>iLOVE</Title>
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
          </FormContent>
        </LoginForm>
      </LoginWrapper>
    </PageContainer>
  );
}

export default Login;