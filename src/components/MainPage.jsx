import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
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
  IconButton
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import api from "../api";
import UserCard from "./UserCard";

const UserProfile = lazy(() => import("./UserProfile"));
const Chat = lazy(() => import("./Chat"));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const MainPage = ({ user, setUser, socket }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  const fetchUsers = useCallback(async () => {
    if (!hasMore) return;
    setIsLoading(true);
    try {
      const response = await api.get('/api/users', {
        params: { page, limit: 20 }
      });
      console.log('Fetched users:', response.data);
      const newUsers = response.data.filter(u => u._id !== user._id);
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
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user._id, toast, page, hasMore]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
    onProfileOpen();
  }, [onProfileOpen]);

  const handleChatClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
    onChatOpen();
  }, [onChatOpen]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (socket) {
      socket.disconnect();
    }
  }, [setUser, socket]);

  const handleDeleteAccount = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await api.delete(`/api/users/${user._id}`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        if (socket) {
          socket.disconnect();
        }
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [user._id, setUser, toast, socket]);

  return (
    <Box>
      <Box position="fixed" top={0} left={0} right={0} p={4} bg="white" boxShadow="md" zIndex={10}>
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onDrawerOpen}
          aria-label="Open menu"
          position="absolute"
          left={4}
          top={4}
        />
        <Heading textAlign="center" fontSize="xl" color="teal.600">User Directory</Heading>
      </Box>

      <VStack spacing={4} align="stretch" mt={20} pb={20}>
  {users.map((u, index) => (
    <UserCard 
    key={u._id}
    user={{
      ...u,
      photo: u.photo || '/path/to/default/image.jpg'
    }}
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
              <Button onClick={handleLogout}>Logout</Button>
              <Button onClick={handleDeleteAccount} colorScheme="red">Delete Account</Button>
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
      </Suspense>
    </Box>
  );
};

export default MainPage;