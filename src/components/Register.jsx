import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  VStack,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  useToast,
  useDisclosure,
  Box,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FaceVerification from './FaceVerification';
import {getUserLocation} from '../utils'

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
  fullName: Yup.string()
    .required('Full name is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Please select a valid gender')
    .required('Gender is required'),
});

function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);

  const handleSubmit = async (values, actions) => {
    const latlon = await getUserLocation()
    
    if (!uploadedImage || !capturedImage) {
      toast({
        title: 'Face Verification Required',
        description: 'Please complete face verification before registering.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('fullName', values.fullName);
      formData.append('location', latlon)
      formData.append('gender', values.gender)
      
      // Convert base64 to Blob and append to FormData
      const uploadedPhotoBlob = await fetch(uploadedImage).then(r => r.blob());
      const capturedPhotoBlob = await fetch(capturedImage).then(r => r.blob());
      
      formData.append('uploadedPhoto', uploadedPhotoBlob, 'uploadedPhoto.jpg');
      formData.append('capturedPhoto', capturedPhotoBlob, 'capturedPhoto.jpg');
  
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
      
      let errorTitle = 'Registration Failed';
      let errorMessage = 'An error occurred during registration.';
      
      if (error.response?.data?.message) {
        errorTitle = error.response.data.message;
      }
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
    
      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleVerificationComplete = (uploadedImg, capturedImg) => {
    setUploadedImage(uploadedImg);
    setCapturedImage(capturedImg);
    onClose();
    toast({
      title: "Images captured",
      description: "Please click 'Register' to complete the process.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="2xl" boxShadow="2xl" bg="white">
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center" color="teal.600">Register</Heading>
        <Formik
          initialValues={{ username: '', password: '', email: '', fullName: '', gender: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <VStack spacing={6}>
                <Field name="username">
                  {({ field }) => (
                    <FormControl isInvalid={errors.username && touched.username}>
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <Input {...field} id="username" placeholder="Enter your username" />
                      <FormErrorMessage>{errors.username}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="password">
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.password && form.touched.password}>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <InputGroup>
                        <Input
                          {...field}
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          onBlur={(e) => {
                            field.onBlur(e);
                            setPasswordTouched(true);
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordValid(RegisterSchema.fields.password.isValidSync(e.target.value));
                          }}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                      {passwordTouched && !passwordValid && (
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&.).
                        </Text>
                      )}
                    </FormControl>
                  )}
                </Field>

                <Field name="email">
                  {({ field }) => (
                    <FormControl isInvalid={errors.email && touched.email}>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input {...field} id="email" type="email" placeholder="Enter your email" />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="fullName">
                  {({ field }) => (
                    <FormControl isInvalid={errors.fullName && touched.fullName}>
                      <FormLabel htmlFor="fullName">Full Name</FormLabel>
                      <Input {...field} id="fullName" placeholder="Enter your full name" />
                      <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="gender">
                  {({ field }) => (
                    <FormControl isInvalid={errors.gender && touched.gender}>
                      <FormLabel htmlFor="gender">Gender</FormLabel>
                      <Select {...field} id="gender" placeholder="Select your gender">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Select>
                      <FormErrorMessage>{errors.gender}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Button onClick={onOpen} colorScheme="teal" width="full">
                  {uploadedImage && capturedImage ? 'Retake Face Verification' : 'Start Face Verification'}
                </Button>

                {uploadedImage && capturedImage && (
                  <Text color="blue.500" fontWeight="bold">
                    Images captured. Click 'Register' to complete the process.
                   </Text>
                  )}

                <Button
                  mt={4}
                  colorScheme="teal"
                  isLoading={isSubmitting}
                  type="submit"
                  width="full"
                  size="lg"
                  boxShadow="md"
                  _hover={{ boxShadow: 'lg' }}
                  isDisabled={!uploadedImage || !capturedImage}
                >
                  Register
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </VStack>

      {isOpen && (
        <FaceVerification
          onVerificationComplete={handleVerificationComplete}
          onClose={onClose}
        />
      )}
    </Box>
  );
}

export default Register;