import React, { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { Box, VStack, useToast, Spinner, useDisclosure, Flex, Heading, IconButton, Input, Text, Button } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import api from "../api";
import UserCard from "./UserCard";
import styled from 'styled-components';
import { FaSearch, FaBars, FaUser, FaTimes } from 'react-icons/fa';
import { Card, Avatar, Username, Description, StatusDot, Distance, GlobalStyle } from '../SharedStyles';
import { useSocket } from '../contexts/SocketContext';
import Fluid from 'webgl-fluid';

const UserProfile = lazy(() => import("./UserProfile"));
const Chat = lazy(() => import("./Chat"));
const Settings = lazy(() => import("./Settings"));
const Conversations = lazy(() => import("./Conversations"));

const MainWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  font-family: 'SF Pro Text', 'Roboto', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 rgb(255, 255, 255);
  z-index: 1000;
`;

const LogoWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 40px;
  overflow: hidden;
`;

const Logo = styled.h1`
  font-size: 34px;
  font-weight: 900;
  color: #b766ce;
  position: relative;
  z-index: 2;
`;

const FluidCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #000;
  cursor: pointer;
`;

const CloseMenuButton = styled(MenuButton)`
  position: absolute;
  top: 15px;
  right: 15px;
`;

const SearchWrapper = styled.div`
  position: relative;
  margin-top: 70px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px;
  padding-left: 40px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  background-color: rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const LoadMoreButton = styled.button`
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #333;
  }
`;

const Menu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100%;
  background-color: #fff;
  color: #000;
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  z-index: 1001;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const MenuHeader = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
`;

const ProfilePic = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
`;

const MenuItems = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const MenuItem = styled.li`
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const UnreadBadge = styled.span`
  background-color: #ff3b30;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  margin-left: 8px;
  font-weight: 600;
`;

const ToggleButton = styled(Button)`
  margin-bottom: 20px;
  width: 100%;
  background-color: #000000;
  color: #ffffff;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background-color: #333;
  }
`;

const MainPage = ({ user, setUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadConversations, setUnreadConversations] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [conversations, setConversations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  const socket = useSocket();
  const toast = useToast();
  const logoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && logoRef.current) {
      const canvas = canvasRef.current;
      const logo = logoRef.current;
      canvas.width = logo.offsetWidth;
      canvas.height = logo.offsetHeight;

      const fluidInstance = Fluid(canvas, {
        SPLAT_RADIUS: 10.6,
        DENSITY_DISSIPATION: 0.9999999999999995,
        VELOCITY_DISSIPATION: 0.999999999599995,
        PRESSURE_DISSIPATION: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 10,
        SPLAT_FORCE: 99000,
        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 2,
        PAUSED: false,
        BACK_COLOR: { r: 255, g: 255, b: 255 },
        TRANSPARENT: true,
        BLOOM: true,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.2,
        BLOOM_THRESHOLD: 100,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 0.3,
      });

      return () => {
        if (fluidInstance && fluidInstance.destroy) {
          fluidInstance.destroy();
        }
      };
    }
  }, []);

  const fetchUserLocation = useCallback(async () => {
    try {
      const response = await api.get('/api/users/current');
      if (response.data.location) {
        setUserLocation(response.data.location);
        setLocationError(null);
      } else {
        setLocationError("Location not set. Please update your location in settings.");
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
      setLocationError("Failed to fetch user location. Please try again.");
      toast({
        title: "Location Error",
        description: "Failed to fetch your location. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const updateUserLocation = useCallback(async () => {
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 60000,
            enableHighAccuracy: true
          });
        });
        
        const { latitude, longitude } = position.coords;
        const response = await api.post('/api/users/updateLocation', { latitude, longitude });
        setUserLocation(response.data.location);
        setLocationError(null);
        toast({
          title: "Location Updated",
          description: "Your location has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error updating location:', error);
        setLocationError("Failed to update location. Please try again.");
        toast({
          title: "Location Error",
          description: "Failed to update your location. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      setLocationError("Geolocation is not supported by your browser");
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    if (!hasMore) return; // Prevent fetching if no more data
    setIsLoading(true); // Start loading state
  
    try {
      const response = await api.get('/api/users/nearby', {
        params: { 
          page, 
          limit: 20,
          ...(userLocation && { 
            latitude: userLocation.coordinates[1], 
            longitude: userLocation.coordinates[0] 
          })
        },
      });
  
      // Check if the response data is in the expected format
      if (response.data && Array.isArray(response.data.users)) {
        const newUsers = response.data.users.filter(u => u && u._id !== user._id);
  
        // Update users state with unique users
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
  
        setHasMore(newUsers.length === 20); // Set hasMore based on response length
        setPage(prevPage => prevPage + 1);  // Increment page for pagination
  
        // Fetch unread message counts for each user
        const unreadCounts = await Promise.all(
          newUsers.map(async (u) => {
            try {
              const response = await api.get(`/api/messages/unread/${u._id}`);
              return { userId: u._id, count: response.data.unreadCount };
            } catch (error) {
              console.error(`Error fetching unread count for user ${u._id}:`, error);
              return { userId: u._id, count: 0 };
            }
          })
        );
  
        // Update unread messages state
        setUnreadMessages(prevUnread => {
          const newUnread = { ...prevUnread };
          unreadCounts.forEach(({ userId, count }) => {
            newUnread[userId] = count;
          });
          return newUnread;
        });
      } else {
        console.error('Unexpected response format:', response.data);
      }
  
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
      setIsLoading(false); // Stop loading state
    }
  }, [user._id, toast, page, hasMore, userLocation]);
  

  const fetchConversations = useCallback(async () => {
    try {
      console.log('Fetching conversations...');
      const response = await api.get('/api/messages/conversations');
      console.log('Conversations response:', response.data);
      if (Array.isArray(response.data)) {
        setConversations(response.data);
      } else {
        console.error('Unexpected conversations data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch conversations. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);

  useEffect(() => {
    if (userLocation) {
      fetchUsers();
    }
  }, [fetchUsers, userLocation]);

  useEffect(() => {
    if (showConversations) {
      fetchConversations();
    }
  }, [showConversations, fetchConversations]);

  useEffect(() => {
    if (socket) {
      socket.on('user status', ({ userId, isOnline }) => {
        setUsers(prevUsers => 
          prevUsers.map(u => u._id === userId ? { ...u, isOnline } : u)
        );
      });

      socket.on('private message', (message) => {
        if (activeChat !== message.sender._id) {
          setUnreadConversations(prev => prev + 1);
          setUnreadMessages(prevUnread => ({
            ...prevUnread,
            [message.sender._id]: (prevUnread[message.sender._id] || 0) + 1
          }));
        }
        fetchConversations();
      });

      socket.on('update conversation', (updatedConversation) => {
        setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv => 
            conv.user._id === updatedConversation.user._id ? updatedConversation : conv
          );
          return updatedConversations.sort((a, b) => 
            new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
          );
        });
      });
  
      return () => {
        socket.off('user status');
        socket.off('private message');
        socket.off('update conversation');
      };
    }
  }, [socket, activeChat, fetchConversations]);

  const handleUserClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
    setIsProfileOpen(true);
  }, []);

  const handleChatClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
    setIsChatOpen(true);
    setActiveChat(clickedUser._id);
    setUnreadConversations(prev => Math.max(0, prev - 1));
    setUnreadMessages(prevUnread => ({
      ...prevUnread,
      [clickedUser._id]: 0
    }));
  }, []);

  const handleSettingsClose = useCallback(async (updatedUser) => {
    if (updatedUser) {
      try {
        const response = await api.put('/api/users/profile', updatedUser);
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (socket) {
          socket.emit('user update', response.data.user);
        }
        toast({
          title: "Profile Updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
    setIsSettingsOpen(false);
  }, [setUser, socket, toast]);

  const filteredUsers = users.filter(u => 
    u && u.username && u.username.toLowerCase().includes(filter.toLowerCase()) ||
    (u && u.description && u.description.toLowerCase().includes(filter.toLowerCase()))
  );

  const filteredConversations = conversations.filter(conv =>
    conv && conv.user && conv.user.username && conv.user.username.toLowerCase().includes(filter.toLowerCase()) ||
    (conv && conv.lastMessage && conv.lastMessage.content && conv.lastMessage.content.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleConversationSelect = useCallback((user) => {
    setSelectedUser(user);
    setShowConversations(false);
    setIsChatOpen(true);
    setActiveChat(user._id);
    setUnreadConversations(prev => Math.max(0, prev - 1));
    setUnreadMessages(prevUnread => ({
      ...prevUnread,
      [user._id]: 0,
    }));
  }, []);

  const toggleView = () => {
    setShowConversations(!showConversations);
    if (!showConversations) {
      setFilter('');
      fetchConversations();
    }
  };

  return (
    <>
      <GlobalStyle />
      <MainWrapper>
        <Header>
          <MenuButton onClick={() => setIsMenuOpen(true)}>
            <FaBars />
          </MenuButton>
          <FluidCanvas ref={canvasRef} />
          <LogoWrapper ref={logoRef}>
            <Logo>BIND</Logo>
          </LogoWrapper>
          <div style={{width: '24px'}} />
        </Header>

        <SearchWrapper>
          <SearchIcon />
          <SearchInput
            placeholder={showConversations ? "Search conversations..." : "Search users..."}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </SearchWrapper>

        <ToggleButton onClick={toggleView}>
          {showConversations ? 'Show Users' : 'Show Conversations'}
          {!showConversations && unreadConversations > 0 && (
            <UnreadBadge>{unreadConversations}</UnreadBadge>
          )}
        </ToggleButton>

        {locationError && (
          <Box bg="red.100" p={4} mb={4} borderRadius="md">
            <Text color="red.500">{locationError}</Text>
            <Button mt={2} onClick={updateUserLocation}>Update Location</Button>
          </Box>
        )}

        {showConversations ? (
          <Suspense fallback={<Spinner />}>
            <Conversations 
              conversations={filteredConversations}
              onSelectConversation={handleConversationSelect}
              unreadMessages={unreadMessages}
            />
          </Suspense>
        ) : (
          <UserList>
            {filteredUsers.map((u) => (
              <UserCard 
                key={u._id}
                user={u} 
                onUserClick={() => handleUserClick(u)}
                onChatClick={() => handleChatClick(u)}
                unreadCount={unreadMessages[u._id] || 0}
              />
            ))}
          </UserList>
        )}
        
        {!showConversations && isLoading && <Spinner />}
        {!showConversations && !isLoading && hasMore && (
          <LoadMoreButton onClick={fetchUsers}>
            Load More
          </LoadMoreButton>
        )}
      </MainWrapper>

      <Menu $isOpen={isMenuOpen}>
        <CloseMenuButton onClick={() => setIsMenuOpen(false)}>
          <FaTimes />
        </CloseMenuButton>
        <MenuHeader>
          <ProfilePic src={user.photo || 'https://via.placeholder.com/60'} alt={user.username} />
          <Username>{user.username}</Username>
        </MenuHeader>
        <MenuItems>
          <MenuItem onClick={() => {
            setIsSettingsOpen(true);
            setIsMenuOpen(false);
          }}>Edit Profile</MenuItem>
          <MenuItem onClick={() => {
            onLogout();
            setIsMenuOpen(false);
          }}>Logout</MenuItem>
        </MenuItems>
      </Menu>

      <Suspense fallback={<div>Loading...</div>}>
        {selectedUser && (
          <UserProfile 
            user={selectedUser} 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)}
            onChatClick={() => {
              setIsProfileOpen(false);
              setIsChatOpen(true);
              setActiveChat(selectedUser._id);
            }}
          />
        )}

        {selectedUser && (
         <Chat
           currentUser={user}
           otherUser={selectedUser}
           isOpen={isChatOpen}
           onClose={() => {
             setIsChatOpen(false);
             setActiveChat(null);
           }}
         />
        )}

        <Settings
          user={user}
          setUser={setUser}
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
        />
      </Suspense>
    </>
  );
};

export default MainPage;