import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  Flex,
  useToast,
  Progress,
  AspectRatio,
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const FaceVerification = ({ onVerificationComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (step === 2) {
      startVideo();
    }
    return () => stopVideo();
  }, [step]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      toast({
        title: 'Camera Error',
        description: 'Unable to access the camera. Please check your permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedImageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(capturedImageData);
      stopVideo();
      setStep(3);
    }
  };

  
  const verifyFaces = async () => {
    if (!uploadedImage || !capturedImage) {
      toast({
        title: 'Error',
        description: 'Both uploaded and captured images are required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('uploadedImage', dataURItoBlob(uploadedImage), 'uploadedImage.jpg');
      formData.append('capturedImage', dataURItoBlob(capturedImage), 'capturedImage.jpg');
  
      const token = localStorage.getItem('token'); // Get the token from localStorage
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/face-verification/verify-face`, 
        formData, 
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // Include the token in the request headers
          }
        }
      );
  
      if (response.data.isMatch) {
        onVerificationComplete(uploadedImage);
        onClose();
      } else {
        toast({
          title: 'Verification Failed',
          description: 'The captured image does not match the uploaded image.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      let errorMessage = 'An error occurred during verification. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0,0,0,0.7)"
      zIndex="1000"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <VStack
          bg="white"
          p={6}
          borderRadius="2xl"
          spacing={6}
          align="stretch"
          maxW="sm"
          w="90%"
          boxShadow="2xl"
        >
          <Heading size="lg" textAlign="center" color="teal.600">Face Verification</Heading>
          <Progress value={(step / 3) * 100} colorScheme="teal" borderRadius="full" />
          
          {step === 1 && (
            <>
              <Text textAlign="center">Please upload a clear photo of your face</Text>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <Button
                as="label"
                htmlFor="file-upload"
                colorScheme="teal"
                size="lg"
                w="full"
                boxShadow="md"
                _hover={{ boxShadow: 'lg' }}
              >
                Choose File
              </Button>
            </>
          )}
          
          {step === 2 && (
            <>
              <AspectRatio ratio={4/3} width="100%" overflow="hidden" borderRadius="xl">
                <Box position="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    width="70%"
                    height="90%"
                    border="3px solid white"
                    borderRadius="50%"
                    pointerEvents="none"
                    boxShadow="0 0 0 9999px rgba(0, 0, 0, 0.5)"
                  />
                </Box>
              </AspectRatio>
              <Text textAlign="center" fontWeight="bold" color="teal.600">
                Move closer and center your face
              </Text>
              <Button
                onClick={captureImage}
                colorScheme="teal"
                size="lg"
                w="full"
                boxShadow="md"
                _hover={{ boxShadow: 'lg' }}
              >
                Capture
              </Button>
            </>
          )}
          
          {step === 3 && (
            <>
              <Flex justify="space-between">
                <Box width="48%">
                  <Image src={uploadedImage} alt="Uploaded" objectFit="cover" borderRadius="md" />
                  <Text mt={2} textAlign="center">Uploaded Image</Text>
                </Box>
                <Box width="48%">
                  <Image src={capturedImage} alt="Captured" objectFit="cover" borderRadius="md" />
                  <Text mt={2} textAlign="center">Captured Image</Text>
                </Box>
              </Flex>
              <Button
                onClick={verifyFaces}
                colorScheme="teal"
                size="lg"
                w="full"
                boxShadow="md"
                _hover={{ boxShadow: 'lg' }}
              >
                Verify Faces
              </Button>
            </>
          )}
          
          <Button
            onClick={onClose}
            variant="outline"
            colorScheme="teal"
            size="md"
            w="full"
          >
            Cancel
          </Button>
        </VStack>
      </motion.div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default FaceVerification;