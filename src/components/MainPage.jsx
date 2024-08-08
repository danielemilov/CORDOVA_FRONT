import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Box,
  VStack,
  Button,
  useToast,
  Spinner,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Avatar,
  Heading,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";
import api from "../api";
import UserCard from "./UserCard";
import { getUserLocation } from '../utils';
const UserProfile = lazy(() => import("./UserProfile"));
const Chat = lazy(() => import("./Chat"));
const Settings = lazy(() => import("./Settings"));

const MainPage = ({ user, setUser, socket, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('');
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const toast = useToast();

  const updateUserLocation = useCallback(async () => {
    try {
      const { latitude, longitude } = await getUserLocation();
      await api.post('/api/users/updateLocation', { latitude, longitude });
      console.log("Location updated successfully");
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, []);

  useEffect(() => {
    updateUserLocation();
    const intervalId = setInterval(updateUserLocation, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(intervalId);
  }, [updateUserLocation]);


  const fetchUsers = useCallback(async () => {
    if (!hasMore) return;
    setIsLoading(true);
    try {
      const { latitude, longitude } = await getUserLocation();
      console.log('Fetching users with params:', { page, limit: 20, latitude, longitude });
      const response = await api.get('/api/users/nearby', {
        params: { 
          page, 
          limit: 20, 
          latitude,
          longitude
        },
      });
      console.log("Fetched users response:", response.data);
      const newUsers = response.data.users.filter(u => u._id !== user._id);

      setUsers(prevUsers => {
        const uniqueUsers = [...prevUsers, ...newUsers].reduce((acc, current) => {
          const x = acc.find(item => item._id === current._id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        return uniqueUsers;
      });
      setHasMore(newUsers.length === 20);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast({
          title: "Error",
          description: `Failed to fetch users: ${errorMessages}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user._id, toast, page, hasMore]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  useEffect(() => {
    if (socket) {
      socket.on('user status', ({ userId, isOnline }) => {
        setUsers(prevUsers => 
          prevUsers.map(u => u._id === userId ? { ...u, isOnline } : u)
        );
      });

      return () => {
        socket.off('user status');
      };
    }
  }, [socket]);

  const handleUserClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
    onProfileOpen();
  }, [onProfileOpen]);

  const handleChatClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
    onChatOpen();
  }, [onChatOpen]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(filter.toLowerCase()) ||
    (u.title && u.title.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <Box>
      <Box position="fixed" top={0} left={0} right={0} p={4} bg="black" boxShadow="md" zIndex={10}>
        <Flex justify="space-between" align="center">
          <IconButton
            icon={<HamburgerIcon />}
            onClick={onDrawerOpen}
            variant="outline"
            color="white"
            aria-label="Menu"
          />
          <Heading fontSize="xl" color="white">MXY</Heading>
          <Avatar 
            src={user.photo} 
            name={user.username} 
            size="sm" 
          />
        </Flex>
      </Box>

      <VStack spacing={4} align="stretch" mt={20} pb={20} px={4}>
        <Input
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          mb={4}
        />
        {filteredUsers.map((u) => (
          <UserCard 
            key={u._id}
            user={u} 
            onUserClick={handleUserClick}
            onChatClick={handleChatClick}
          />
        ))}
        {isLoading && <Spinner />}
        {!isLoading && hasMore && (
          <Button onClick={fetchUsers} colorScheme="teal">
            Load More
          </Button>
        )}
      </VStack>

      <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Button leftIcon={<SettingsIcon />} onClick={() => {
                onDrawerClose();
                onSettingsOpen();
              }}>
                Settings
              </Button>
              <Button onClick={onLogout}>Logout</Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Suspense fallback={<Spinner />}>
        {selectedUser && (
          <UserProfile 
            user={selectedUser} 
            isOpen={isProfileOpen} 
            onClose={onProfileClose}
            onChatClick={handleChatClick}
          />
        )}

        {selectedUser && (
          <Chat
            currentUser={user}
            otherUser={selectedUser}
            isOpen={isChatOpen}
            onClose={onChatClose}
            socket={socket}
          />
        )}

        <Settings
          user={user}
          setUser={setUser}
          isOpen={isSettingsOpen}
          onClose={onSettingsClose}
        />
      </Suspense>
    </Box>
  );
};

export default MainPage;