import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api';
import Fluid from 'webgl-fluid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const cycleColors = keyframes`
  0% {
    background: radial-gradient(circle, rgba(135,206,250,0.4) 28%, rgba(255,255,255,0.539) 100%);
  }
  33% {
    background: radial-gradient(circle, rgba(147,112,219,0.4) 28%, rgba(255,255,255,0.539) 100%);
  }
  66% {
    background: radial-gradient(circle, rgba(255,182,193,0.4) 28%, rgba(255,255,255,0.539) 100%);
  }
  100% {
    background: radial-gradient(circle, rgba(135,206,250,0.4) 28%, rgba(255,255,255,0.539) 100%);
  }
`;

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: rgb(227, 223, 227);
  animation: ${cycleColors} 15s infinite;
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
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15), 0 3px 15px rgba(0, 0, 0, 0.2);
  }
`;

const FormContent = styled.div`
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
  letter-spacing: -0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 20px;
  margin: 10px 0;
  border: none;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.3);
    background-color: #ffffff;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  margin-top: 20px;
  background: linear-gradient(135deg, #869afb 0%, #ffffff 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  text-align: center;
  margin-top: 10px;
  font-weight: 500;
`;

const LinkText = styled(Link)`
  color: #667eea;
  text-decoration: none;
  margin-top: 20px;
  text-align: center;
  display: block;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #764ba2;
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
  color: #667eea;
  transition: color 0.3s ease;

  &:hover {
    color: #764ba2;
  }
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
            <Title>X LOVIN</Title>
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