import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api';
import { getUserLocation } from '../utils';
import FaceVerification from './FaceVerification';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import Fluid from 'webgl-fluid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RegisterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f7f7;
  padding: 20px;
`;

const RegisterForm = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  background-color: white;
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;

  @media only screen 
    and (min-device-width: 375px) 
    and (max-device-width: 812px) 
    and (-webkit-min-device-pixel-ratio: 3) {
    padding: 30px 20px;
    border-radius: 0;
    max-width: none;
    justify-content: flex-start;
    padding-top: 60px;
  }
`;

const FormContent = styled.div`
  position: relative;
  z-index: 1;
  padding-top: 40px;
`;

const Title = styled.h1`
  font-size: 34px;
  font-weight: 900;
  color: #b766ce;
  text-align: center;
  margin-bottom: 60px;

  @media only screen 
    and (min-device-width: 375px) 
    and (max-device-width: 812px) 
    and (-webkit-min-device-pixel-ratio: 3) {
    font-size: 62px;
    margin-bottom: 50px;
  }
`;

const Title2 = styled.h1`
  font-size: 34px;
  font-weight: 900;
  color: #000000;
  text-align: center;
  margin-bottom: 40px;
  margin-top: -60px;

  @media only screen 
    and (min-device-width: 375px) 
    and (max-device-width: 812px) 
    and (-webkit-min-device-pixel-ratio: 3) {
    font-size: 62px;
    margin-bottom: 50px;
  }
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

  @media only screen 
    and (min-device-width: 375px) 
    and (max-device-width: 812px) 
    and (-webkit-min-device-pixel-ratio: 3) {
    font-size: 16px;
    padding: 14px 20px;
    margin: 12px 0;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
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

  @media only screen 
    and (min-device-width: 375px) 
    and (max-device-width: 812px) 
    and (-webkit-min-device-pixel-ratio: 3) {
    font-size: 18px;
    padding: 14px;
    margin-top: 30px;
  }
`;

const ErrorMessage = styled.p`
  color: #ff0000;
  text-align: center;
  margin-top: 5px;
  font-size: 14px;

  @media only screen 
    and (min-device-width: 375px) 
    and (max-device-width: 812px) 
    and (-webkit-min-device-pixel-ratio: 3) {
    font-size: 16px;
  }
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

  @media only screen 
    and (min-device-width: 375px) 
    and (max-device-width: 812px) 
    and (-webkit-min-device-pixel-ratio: 3) {
    margin-top: 20px;
    font-size: 16px;
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
  font-size: 20px;
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

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const CheckboxLabel = styled.label`
  margin-left: 10px;
  font-size: 14px;
`;

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .required('Username is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&.)')
    .required('Password is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  birthDate: Yup.date()
    .max(new Date(Date.now() - 567648000000), 'You must be at least 18 years old')
    .required('Birth date is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Please select a gender')
    .required('Gender is required'),
  agreedToPrivacyPolicy: Yup.boolean()
    .oneOf([true], 'You must agree to the privacy policy')
    .required('You must agree to the privacy policy'),
});

function Register() {
  const navigate = useNavigate();
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef(null);
  const [fluidInstance, setFluidInstance] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initializeFluid = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const fluidOptions = {
        SPLAT_RADIUS: 0.6,
        DENSITY_DISSIPATION: 0.98,
        VELOCITY_DISSIPATION: 0.98,
        PRESSURE_DISSIPATION: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 10,
        SPLAT_FORCE: 4000,
        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 10,
        PAUSED: false,
        BACK_COLOR: { r: 255, g: 255, b: 255 },
        TRANSPARENT: true,
        BLOOM: true,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.2,
        BLOOM_THRESHOLD: 0.6,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 0.3,
      };

      const newFluidInstance = Fluid(canvas, fluidOptions);
      setFluidInstance(newFluidInstance);
    };

    initializeFluid();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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

  const handleSubmit = async (values, actions) => {
    if (!isVerificationComplete) {
      setShowFaceVerification(true);
      return;
    }

    try {
      const location = await getUserLocation();
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'birthDate') {
          const birthDate = new Date(values[key]);
          formData.append(key, birthDate.toISOString());
        } else {
          formData.append(key, values[key]);
        }
      });
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      
      if (uploadedPhoto) {
        const response = await fetch(uploadedPhoto);
        const blob = await response.blob();
        formData.append('photo', blob, 'user_photo.jpg');
      }

      const response = await api.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      actions.setErrors({ submit: error.response?.data?.message || 'An error occurred during registration.' });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleVerificationComplete = (photo) => {
    setIsVerificationComplete(true);
    setUploadedPhoto(photo);
    setShowFaceVerification(false);
  };

  return (
    <RegisterWrapper>
      <RegisterForm>
        <FluidContainer>
          <FluidCanvas ref={canvasRef} />
        </FluidContainer>
        <FormContent>
          <Title>FE!N</Title>
          <Title2>Register</Title2>
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              birthDate: '',
              gender: '',
              agreedToPrivacyPolicy: false,
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Field name="username">
                  {({ field }) => (
                    <Input {...field} placeholder="Username" />
                  )}
                </Field>
                {errors.username && touched.username && <ErrorMessage>{errors.username}</ErrorMessage>}

                <Field name="email">
                  {({ field }) => (
                    <Input {...field} type="email" placeholder="Email" />
                  )}
                </Field>
                {errors.email && touched.email && <ErrorMessage>{errors.email}</ErrorMessage>}

                <PasswordWrapper>
                  <Field name="password">
                    {({ field }) => (
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                      />
                    )}
                  </Field>
                  <TogglePasswordVisibility
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </TogglePasswordVisibility>
                </PasswordWrapper>
                {errors.password && touched.password && <ErrorMessage>{errors.password}</ErrorMessage>}

                <Field name="birthDate">
                  {({ field }) => (
                    <Input {...field} type="date" placeholder="Birth Date" />
                  )}
                </Field>
                {errors.birthDate && touched.birthDate && <ErrorMessage>{errors.birthDate}</ErrorMessage>}

                <Field name="gender" as="select">
                  {({ field }) => (
                    <Input {...field} as="select">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Input>
                  )}
                </Field>
                {errors.gender && touched.gender && <ErrorMessage>{errors.gender}</ErrorMessage>}
                <CheckboxWrapper>
                  <Field type="checkbox" name="agreedToPrivacyPolicy" id="agreedToPrivacyPolicy" />
                  <CheckboxLabel htmlFor="agreedToPrivacyPolicy">
                    I agree to the <Link to="/privacy-policy">Privacy Policy</Link>
                  </CheckboxLabel>
                </CheckboxWrapper>
                {errors.agreedToPrivacyPolicy && touched.agreedToPrivacyPolicy && (
                  <ErrorMessage>{errors.agreedToPrivacyPolicy}</ErrorMessage>
                )}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
                {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}
              </Form>
            )}
          </Formik>
          <LinkText to="/login">Already have an account? Login</LinkText>
        </FormContent>
      </RegisterForm>

      {showFaceVerification && (
        <FaceVerification
          onVerificationComplete={handleVerificationComplete}
          onClose={() => setShowFaceVerification(false)}
        />
      )}
    </RegisterWrapper>
  );
}

export default Register;