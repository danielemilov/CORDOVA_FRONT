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
  CloseButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { readAndCompressImage } from 'browser-image-resizer';


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
      // RESIZE HEREEE BEFORE SENDING TO SERVER !!!!!!!!!!!!!! uploadedPhoto and capturedPhoto ... - example in register - component....
      const config = {
        quality: 0.5,
        maxWidth: 800,
        maxHeight: 600,
        debug: true
      };
      let resizedUploadedImage = await readAndCompressImage(dataURItoBlob(uploadedImage), config);
      let resizedCapturedImage = await readAndCompressImage(dataURItoBlob(capturedImage), config);
      
      formData.append('uploadedPhoto', resizedUploadedImage, 'uploadedPhoto.jpg');
      formData.append('capturedPhoto', resizedCapturedImage, 'capturedPhoto.jpg');


      const response = await axios.post(
        `${import.meta.env.VITE_FACE_VERIFICATION_SERVICE_URL}/verify-face`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: false, // Changed to false to align with server CORS config
        }
      );
  
      if (response.data.isMatch) {
        onVerificationComplete(resizedUploadedImage);
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
      toast({
        title: 'Error',
        description: 'An error occurred during verification. Please try again.',
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
          position="relative"
        >
          <CloseButton 
            position="absolute" 
            right="4" 
            top="4" 
            onClick={onClose}
          />
          <Heading size="lg" textAlign="center" color="#b766ce">Face Verification</Heading>
          <Progress value={(step / 3) * 100} colorScheme="purple" borderRadius="full" />
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
                bg="#b766ce"
                color="white"
                size="lg"
                w="full"
                boxShadow="md"
                _hover={{ bg: "#9a4cad", boxShadow: 'lg' }}
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
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <Text textAlign="center" fontWeight="bold" color="#b766ce">
                Move closer and center your face
              </Text>
              <Flex justify="space-between">
                <Button
                  onClick={() => setStep(1)}
                  bg="gray.200"
                  color="black"
                  boxShadow="md"
                  _hover={{ bg: "gray.300", boxShadow: 'lg' }}
                >
                  Back
                </Button>
                <Button
                  onClick={captureImage}
                  bg="#b766ce"
                  color="white"
                  boxShadow="md"
                  _hover={{ bg: "#9a4cad", boxShadow: 'lg' }}
                >
                  Capture
                </Button>
              </Flex>
            </>
          )}
          {step === 3 && (
            <>
              <Flex justify="space-between" align="center">
                <Box width="78%" overflow="hidden" borderRadius="md">
                  <AspectRatio ratio={1}>
                    <Image src={uploadedImage} alt="Uploaded" objectFit="cover" />
                  </AspectRatio>
                </Box>
                <Box width="78%" overflow="hidden" borderRadius="md">
                  <AspectRatio ratio={1}>
                    <Image src={capturedImage} alt="Captured" objectFit="cover" />
                  </AspectRatio>
                </Box>
              </Flex>
              <Button 
                onClick={verifyFaces} 
                bg="#b766ce"
                color="white"
                _hover={{ bg: "#9a4cad" }}
              >
                Verify Faces
              </Button>
            </>
          )}
        </VStack>
      </motion.div>
    </Box>
  );
};

export default FaceVerification;