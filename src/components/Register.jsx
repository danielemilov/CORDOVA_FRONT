import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  VStack,
  Button,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Box,
  Text,
  Checkbox,
  Link,
  RadioGroup,
  Radio,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FaceVerification from './FaceVerification';
import { getUserLocation } from '../utils';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f7f7;
  padding: 20px;
`;

const RegisterForm = styled(Box)`
  width: 100%;
  max-width: 400px;
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled(Heading)`
  font-size: 34px;
  font-weight: 100;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
`;

const StyledInput = styled.input`
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

const StyledButton = styled(Button)`
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

const ErrorMessage = styled(Text)`
  color: red;
  text-align: center;
  margin-top: 10px;
`;

const LinkText = styled(Link)`
  color: #ff0000;
  text-decoration: none;
  margin-top: 20px;
  text-align: center;
  display: block;
  

  &:hover {
    text-decoration: none;
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

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 25px;
  background-color: #f0f0f0;
  font-size: 16px;
  appearance: none;
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #333;
  }
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
  const toast = useToast();
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({
        title: 'Registration Successful',
        description: 'Please check your email to verify your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'An error occurred during registration.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleVerificationComplete = (photo) => {
    setIsVerificationComplete(true);
    setUploadedPhoto(photo);
    setShowFaceVerification(false);
    toast({
      title: "Face Verification Completed",
      description: "You can now proceed with registration.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <RegisterWrapper>
      <RegisterForm>
        <Title>FE!N</Title>
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
              <VStack spacing={4}>
                <Field name="username">
                  {({ field }) => (
                    <FormControl isInvalid={errors.username && touched.username}>
                      <StyledInput {...field} placeholder="Username" />
                      <ErrorMessage>{errors.username}</ErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="email">
                  {({ field }) => (
                    <FormControl isInvalid={errors.email && touched.email}>
                      <StyledInput {...field} type="email" placeholder="Email" />
                      <ErrorMessage>{errors.email}</ErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="password">
                  {({ field }) => (
                    <FormControl isInvalid={errors.password && touched.password}>
                      <PasswordWrapper>
                        <StyledInput 
                          {...field} 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Password" 
                        />
                        <TogglePasswordVisibility
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </TogglePasswordVisibility>
                      </PasswordWrapper>
                      <ErrorMessage>{errors.password}</ErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="birthDate">
                  {({ field }) => (
                    <FormControl isInvalid={errors.birthDate && touched.birthDate}>
                      <StyledInput {...field} type="date" />
                      <ErrorMessage>{errors.birthDate}</ErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="gender">
                  {({ field }) => (
                    <FormControl isInvalid={errors.gender && touched.gender}>
                      <StyledSelect {...field}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </StyledSelect>
                      <ErrorMessage>{errors.gender}</ErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="agreedToPrivacyPolicy">
                  {({ field }) => (
                    <FormControl isInvalid={errors.agreedToPrivacyPolicy && touched.agreedToPrivacyPolicy}>
                      <Checkbox {...field}>
                        I agree to the <Link color="blue.500" href="/privacy-policy">Privacy Policy</Link>
                      </Checkbox>
                      <ErrorMessage>{errors.agreedToPrivacyPolicy}</ErrorMessage>
                    </FormControl>
                  )}
                </Field>

                {isVerificationComplete && (
                  <Text color="green.500">Face verification completed</Text>
                )}

                <StyledButton
                  mt={4}
                  isLoading={isSubmitting}
                  type="submit"
                  width="full"
                >
                  Register
                </StyledButton>
              </VStack>
            </Form>
          )}
        </Formik>
        <LinkText to="/login">Already have an account? Login</LinkText>
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