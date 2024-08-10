import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Box, VStack, useToast, Spinner, useDisclosure, Flex, Heading, IconButton, Input,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import api from "../api";
import UserCard from "./UserCard";
import { getUserLocation } from '../utils';
import styled from 'styled-components';
import { FaSearch, FaBars, FaUser, FaTimes } from 'react-icons/fa';
import { Card, Avatar, Username, Description, StatusDot, Distance, Button, GlobalStyle } from '../SharedStyles';
import { useSocket } from '../contexts/SocketContext';

const UserProfile = lazy(() => import("./UserProfile"));
const Chat = lazy(() => import("./Chat"));
const Settings = lazy(() => import("./Settings"));
const Conversations = lazy(() => import("./Conversations"));

const MainWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f7f7;
  font-family: 'Roboto', sans-serif;
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
  background-color: #000000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const Logo = styled.h1`
  font-size: 34px;
  font-weight: 100;
  color: #d1ffd1;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #ffffff;
  cursor: pointer;
`;

const CloseMenuButton = styled(MenuButton)`
  position: absolute;
  top: 10px;
  right: 10px;
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
  border-radius: 25px;
  font-size: 16px;
  background-color: #f0f0f0;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #333;
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
  background-color: #333;
  color: #27b600;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #555;
  }
`;

const Menu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100%;
  background-color: #000000;
  color: white;
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  z-index: 1001;
  overflow-y: auto;
`;

const MenuHeader = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #333;
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
  
  const toast = useToast();
  const socket = useSocket();

  const updateUserLocation = useCallback(async () => {
    try {
      const { latitude, longitude } = await getUserLocation();
      await api.post('/api/users/updateLocation', { latitude, longitude });
      console.log("Location updated successfully");
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, []);

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
    const fetchData = async () => {
      await updateUserLocation();
      fetchUsers();
    };
    fetchData();
  }, [updateUserLocation, fetchUsers]);

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
    setIsProfileOpen(true);
  }, []);

  const handleChatClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
    setIsChatOpen(true);
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
    u.username.toLowerCase().includes(filter.toLowerCase()) ||
    (u.description && u.description.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleConversationSelect = useCallback((user) => {
    setSelectedUser(user);
    setShowConversations(false);
    setIsChatOpen(true);
  }, []);

  return (
    <>
      <GlobalStyle />
      <MainWrapper>
        <Header>
          <MenuButton onClick={() => setIsMenuOpen(true)}>
            <FaBars />
          </MenuButton>
          <Logo>FE!N</Logo>
          <div style={{width: '24px'}} />
        </Header>
        <SearchWrapper>
          <SearchIcon />
          <SearchInput
            placeholder="Search users..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </SearchWrapper>

        <Button onClick={() => setShowConversations(!showConversations)} width="100%" mb={4}>
          {showConversations ? 'Show Users' : 'Show Conversations'}
        </Button>

        {showConversations ? (
          <Suspense fallback={<Spinner />}>
            <Conversations onSelectConversation={handleConversationSelect} />
          </Suspense>
        ) : (
          <UserList>
            {filteredUsers.map((u) => (
              <UserCard 
                key={u._id}
                user={u} 
                onUserClick={() => handleUserClick(u)}
                onChatClick={() => handleChatClick(u)}
              />
            ))}
          </UserList>
        )}
        
        {isLoading && <Spinner />}
        {!isLoading && hasMore && (
          <LoadMoreButton onClick={fetchUsers}>
            Load More
          </LoadMoreButton>
        )}
      </MainWrapper>

      <Menu $isOpen={isMenuOpen} className="menu">
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
            }}
          />
        )}

        {selectedUser && (
         <Chat
         currentUser={user}
         otherUser={selectedUser}
         isOpen={isChatOpen}
         onClose={() => setIsChatOpen(false)}
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