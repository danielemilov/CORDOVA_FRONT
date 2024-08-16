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
background-color: white;
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
  background-color: rgb(160, 169, 234);
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
  font-weight: 900;
  color: #0c3478;
  text-align: center;
  margin-bottom: 60px;
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
  margin-top: 40px;
  background-color: rgba(0, 0, 0, 0.813);
  color: #ffffff;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(85, 85, 85, 0.7);
    color: #ffffff;
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
  color: #000000;
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
  color: #e59ef0;
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
        SPLAT_RADIUS: 10.6,
        DENSITY_DISSIPATION: 0.9999999999999995,
        VELOCITY_DISSIPATION: 0.999999999599995,
        PRESSURE_DISSIPATION: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 10,
        SPLAT_FORCE: 99000,
        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 2,
        PAUSED: false,
        BACK_COLOR: { r: 255, g: 255, b: 255 },
        TRANSPARENT: true,
        BLOOM: true,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.2,
        BLOOM_THRESHOLD: 100,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 0.3,
        COLOR_PALETTE: [
          { r: 50, g: 100, b: 150 },
          { r: 70, g: 130, b: 180 },
          { r: 100, g: 149, b: 237 },
          { r: 176, g: 224, b: 230 },
          { r: 135, g: 206, b: 235 },
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

        if (Math.random() < 0.05) {
          const x = Math.random();
          const y = Math.random();
          const dx = (Math.random() - 0.5) * 0.005;
          const dy = (Math.random() - 0.5) * 0.005;
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
            <Title>MERGE</Title>
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