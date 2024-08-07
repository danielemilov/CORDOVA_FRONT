import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import Webcam from 'react-webcam';
import api from '../api';

const FaceVerificationModal = ({ isOpen, onClose, onVerificationComplete }) => {
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const toast = useToast();

  const capture = async () => {
    setIsCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    try {
      const response = await api.post('/api/verify-face', { image: imageSrc });
      if (response.data.verified) {
        toast({
          title: 'Verification Successful',
          description: 'Your face has been verified.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onVerificationComplete();
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Face verification failed:', error);
      toast({
        title: 'Verification Error',
        description: 'An error occurred during verification. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Face Verification</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
            />
            <Button onClick={capture} isLoading={isCapturing} mt={4} colorScheme="blue">
              Capture
            </Button>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FaceVerificationModal;