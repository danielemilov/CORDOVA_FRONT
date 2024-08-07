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
  FormErrorMessage,
  useToast,
  Box,
  Text,
  Checkbox,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  RadioGroup,
  Radio,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FaceVerification from './FaceVerification';
import { getUserLocation } from '../utils';

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
    .oneOf(['male', 'female'], 'Please select a gender')
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = async (values, actions) => {
    if (!isVerificationComplete) {
      onOpen();
      return;
    }

    try {
      const location = await getUserLocation();
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, key === 'birthDate' ? values[key].toISOString() : values[key]);
      });
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      if (uploadedPhoto) {
        formData.append('photo', uploadedPhoto);
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
    onClose();
    toast({
      title: "Face Verification Completed",
      description: "You can now proceed with registration.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Register</Heading>
        <Formik
          initialValues={{ 
            username: '', 
            password: '', 
            email: '', 
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
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <Input {...field} id="username" placeholder="Enter your username" />
                      <FormErrorMessage>{errors.username}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="password">
                  {({ field }) => (
                    <FormControl isInvalid={errors.password && touched.password}>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <Input {...field} id="password" type="password" placeholder="Enter your password" />
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
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

                <Field name="birthDate">
                  {({ field }) => (
                    <FormControl isInvalid={errors.birthDate && touched.birthDate}>
                      <FormLabel htmlFor="birthDate">Birth Date</FormLabel>
                      <Input {...field} id="birthDate" type="date" />
                      <FormErrorMessage>{errors.birthDate}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="gender">
                  {({ field }) => (
                    <FormControl isInvalid={errors.gender && touched.gender}>
                      <FormLabel htmlFor="gender">Gender</FormLabel>
                      <RadioGroup
                        {...field}
                        onChange={(value) => setFieldValue('gender', value)}
                      >
                        <HStack spacing={4}>
                          <Radio value="male">Male</Radio>
                          <Radio value="female">Female</Radio>
                        </HStack>
                      </RadioGroup>
                      <FormErrorMessage>{errors.gender}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="agreedToPrivacyPolicy">
                  {({ field }) => (
                    <FormControl isInvalid={errors.agreedToPrivacyPolicy && touched.agreedToPrivacyPolicy}>
                      <Checkbox {...field} id="agreedToPrivacyPolicy">
                        I agree to the <Link href="/privacy-policy" isExternal color="blue.500">Privacy Policy</Link>
                      </Checkbox>
                      <FormErrorMessage>{errors.agreedToPrivacyPolicy}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                {isVerificationComplete && (
                  <Text color="green.500">Face verification completed</Text>
                )}

                <Button
                  mt={4}
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                  width="full"
                >
                  Register
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Face Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FaceVerification onVerificationComplete={handleVerificationComplete} onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Register;