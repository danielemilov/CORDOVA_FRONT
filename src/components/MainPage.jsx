// MainPage.jsx
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
  IconButton,
  Flex,
  Avatar,
  Select,
  Input,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Stack,
  Checkbox,
} from "@chakra-ui/react";
import { HamburgerIcon, SettingsIcon, SearchIcon } from "@chakra-ui/icons";
import api from "../api";
import UserCard from "./UserCard";
import { getUserLocation } from '../utils';

const UserProfile = lazy(() => import("./UserProfile"));
const Chat = lazy(() => import("./Chat"));

const MainPage = ({ user, setUser, socket, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 100,
    gender: '',
    country: '',
    city: '',
    lastOnline: false
  });

  const fetchUsers = useCallback(async () => {
    if (!hasMore) return;
    setIsLoading(true);
    try {
      const location = await getUserLocation();
      await api.post('/api/users/updateLocation', location);

      const response = await api.get('/api/users', {
        params: {
          page,
          limit: 15,
          ...filters,
          latitude: location.latitude,
          longitude: location.longitude
        }
      });

      const newUsers = response.data || [];
      console.log('Fetched users:', newUsers);
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers, ...newUsers];
        console.log('Updated users state:', updatedUsers);
        return updatedUsers;
      });
      setHasMore(newUsers.length === 15);
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
  }, [page, hasMore, filters, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (socket) {
      socket.on('user status', ({ userId, isOnline }) => {
        console.log('User status update received:', userId, isOnline);
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

  const handleDeleteAccount = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await api.delete(`/api/users/${user._id}`);
        onLogout();
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
  }, [user._id, onLogout, toast]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAgeRangeChange = (values) => {
    setFilters(prev => ({
      ...prev,
      minAge: values[0],
      maxAge: values[1]
    }));
  };

  const resetFilters = () => {
    setFilters({
      minAge: 18,
      maxAge: 100,
      gender: '',
      country: '',
      city: '',
      lastOnline: false
    });
  };

  const applyFilters = () => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    fetchUsers();
    onFilterClose();
  };

  return (
    <Box>
      <Box position="fixed" top={0} left={0} right={0} p={4} bg="black" boxShadow="md" zIndex={10}>
        <Flex justify="space-between" align="center" >
          <IconButton
            bg='black'
            icon={<HamburgerIcon color="white"/>}
            onClick={onDrawerOpen}
            aria-label="Open menu"
          />
          <Heading fontSize="xl" color="white">MXY</Heading>
          <Flex>
            <IconButton
              icon={<SearchIcon color="white" />}
              onClick={onFilterOpen}
              aria-label="Open filters"
              mr={2}
              bg='black'
            />
            <Avatar src={user.photo} name={user.username} size="sm" />
          </Flex>
        </Flex>
      </Box>

      <VStack spacing={4} align="stretch" mt={20} pb={20} px={4}>
        {users.map((u) => (
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
              <Button leftIcon={<SettingsIcon />} onClick={() => {/* Implement settings functionality */}}>Settings</Button>
              <Button onClick={onLogout}>Logout</Button>
              <Button onClick={handleDeleteAccount} colorScheme="red">Delete Account</Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer isOpen={isFilterOpen} placement="right" onClose={onFilterClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filters</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={2}>Age Range: {filters.minAge} - {filters.maxAge}</Text>
                <RangeSlider
                  min={18}
                  max={100}
                  step={1}
                  value={[filters.minAge, filters.maxAge]}
                  onChange={handleAgeRangeChange}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
              </Box>
              <Select name="gender" value={filters.gender} onChange={handleFilterChange}>
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input 
                name="country" 
                placeholder="Country" 
                value={filters.country} 
                onChange={handleFilterChange} 
              />
              <Input 
                name="city" 
                placeholder="City" 
                value={filters.city} 
                onChange={handleFilterChange} 
              />
              <Checkbox 
                name="lastOnline" 
                isChecked={filters.lastOnline} 
                onChange={handleFilterChange}
              >
                Last Online
              </Checkbox>
              <Flex justify="space-between">
                <Button onClick={resetFilters}>Reset</Button>
                <Button colorScheme="teal" onClick={applyFilters}>Apply</Button>
              </Flex>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Suspense fallback={<Spinner />}>
        {selectedUser && (
          <>
            <UserProfile 
              user={selectedUser}
              isOpen={isProfileOpen}
              onClose={onProfileClose}
            />
            <Chat 
              currentUser={user}
              otherUser={selectedUser}
              isOpen={isChatOpen}
              onClose={onChatClose}
              socket={socket}
            />
          </>
        )}
      </Suspense>
    </Box>
  );
};

export default MainPage;