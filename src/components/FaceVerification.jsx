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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const FaceVerification = ({ onVerificationComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
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
      toast({
        title: 'Camera Error',
        description: err.message,
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
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 640;
          canvas.height = 480;
          ctx.drawImage(img, 0, 0, 640, 480);
          const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
          setUploadedImage(resizedImage);
          setStep(2);
        };
        img.src = e.target.result;
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
      onVerificationComplete(uploadedImage, capturedImageData);
      console.log(captureImage, "YYYYYYY")
      console.log('XXXXXXXXXX',uploadedImage)
      onClose();
    }
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
          <Progress value={(step / 2) * 100} colorScheme="teal" borderRadius="full" />
          {step === 1 ? (
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
          ) : (
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
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <Text textAlign="center" fontWeight="bold" color="teal.600">
                Move closer and center your face
              </Text>
              <Flex justify="space-between">
                <Button
                  onClick={() => setStep(1)}
                  colorScheme="gray"
                  boxShadow="md"
                  _hover={{ boxShadow: 'lg' }}
                >
                  Back
                </Button>
                <Button
                  onClick={captureImage}
                  colorScheme="teal"
                  boxShadow="md"
                  _hover={{ boxShadow: 'lg' }}
                >
                  Capture
                </Button>
              </Flex>
            </>
          )}
        </VStack>
      </motion.div>
    </Box>
  );
};

export default FaceVerification;