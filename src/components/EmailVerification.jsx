import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';

function EmailVerification() {
  const [status, setStatus] = useState('Verifying...');
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`http://localhost:4000/api/auth/verify-email/${token}`);
        setStatus('Email verified successfully. You can now log in.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('Verification failed. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <VStack spacing={4} align="center">
        <Heading as="h2" size="xl">Email Verification</Heading>
        {isLoading ? (
          <Spinner size="xl" />
        ) : (
          <Text fontSize="lg" textAlign="center">{status}</Text>
        )}
      </VStack>
    </Box>
  );
}

export default EmailVerification;