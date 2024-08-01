import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Image, 
  Text, 
  VStack, 
  Heading, 
  Progress, 
  useToast, 
  Flex,
  IconButton
} from '@chakra-ui/react';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';

const FaceVerification = ({ onVerificationComplete }) => {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError('Error accessing the camera: ' + err.message);
      toast({
        title: 'Camera Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const stopVideo = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  }, []);

  useEffect(() => {
    if (step === 3) {
      startVideo();
    } else {
      stopVideo();
    }
    return () => stopVideo();
  }, [step, startVideo, stopVideo]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setStep(2);
      };
      reader.onerror = () => {
        setError('Error reading file');
        toast({
          title: 'File Error',
          description: 'Error reading the uploaded file',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const capturedImageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(capturedImageData);
      setStep(4);
    }
  };

  const verifyFaces = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Simulating API call for face verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      onVerificationComplete(uploadedImage, capturedImage);
      toast({
        title: 'Verification Successful',
        description: 'Face verification completed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError('Verification failed: ' + err.message);
      toast({
        title: 'Verification Failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetProcess = () => {
    setStep(1);
    setUploadedImage(null);
    setCapturedImage(null);
    setError('');
  };

  return (
    <VStack spacing={6} align="stretch" w="100%" maxW="md" mx="auto">
      <Heading size="lg" textAlign="center">Face Verification</Heading>
      <Progress value={(step / 4) * 100} size="sm" colorScheme="blue" />
      
      {step === 1 && (
        <Box>
          <Heading size="md" mb={4}>Step 1: Upload Photo</Heading>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <Button 
            leftIcon={<FaUpload />} 
            onClick={() => fileInputRef.current.click()}
            colorScheme="blue"
            w="100%"
          >
            Choose File
          </Button>
        </Box>
      )}

      {step === 2 && (
        <Box>
          <Heading size="md" mb={4}>Step 2: Confirm Uploaded Photo</Heading>
          <Image src={uploadedImage} alt="Uploaded" borderRadius="md" mb={4} />
          <Button 
            onClick={() => setStep(3)} 
            colorScheme="blue" 
            w="100%"
            leftIcon={<FaCamera />}
          >
            Take a Photo
          </Button>
        </Box>
      )}

      {step === 3 && (
        <Box>
          <Heading size="md" mb={4}>Step 3: Capture Photo</Heading>
          <Box position="relative" mb={4}>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              style={{ width: '100%', borderRadius: '0.375rem' }} 
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
          <Button 
            onClick={captureImage} 
            colorScheme="blue" 
            w="100%"
            leftIcon={<FaCamera />}
          >
            Capture
          </Button>
        </Box>
      )}

      {step === 4 && (
        <Box>
          <Heading size="md" mb={4}>Step 4: Confirm Captured Photo</Heading>
          <Image src={capturedImage} alt="Captured" borderRadius="md" mb={4} />
          <Flex justifyContent="space-between">
            <Button 
              onClick={verifyFaces} 
              colorScheme="green" 
              isLoading={isLoading}
              loadingText="Verifying"
              flex={1}
              mr={2}
            >
              Verify Photos
            </Button>
            <IconButton
              icon={<FaRedo />}
              onClick={resetProcess}
              colorScheme="gray"
              aria-label="Reset process"
            />
          </Flex>
        </Box>
      )}

      {error && <Text color="red.500" textAlign="center">{error}</Text>}
    </VStack>
  );
};

export default FaceVerification;