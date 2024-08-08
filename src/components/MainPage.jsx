import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Box,
  VStack,
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
  Heading,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";
import api from "../api";
import UserCard from "./UserCard";
import { getUserLocation } from '../utils';
import { GlobalStyle } from '../SharedStyles';
import styled from 'styled-components';
import { FaSearch, FaBars, FaUser } from 'react-icons/fa';

const UserProfile = lazy(() => import("./UserProfile"));
const Chat = lazy(() => import("./Chat"));
const Settings = lazy(() => import("./Settings"));

const MainWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
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
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #333;
  cursor: pointer;
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
  color: white;
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
  left: ${props => props.isOpen ? '0' : '-300px'};
  width: 300px;
  height: 100%;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  transition: left 0.3s ease;
  z-index: 1001;
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
`;

const Username = styled.h2`
  font-size: 18px;
  font-weight: 600;
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

const MainPage = ({ user, setUser, socket, onLogout }) => {
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
    setIsProfileOpen(true);
  }, []);

  const handleChatClick = useCallback((clickedUser) => {
    setSelectedUser(clickedUser);
    setIsChatOpen(true);
  }, []);

  const onProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const onChatOpen = () => {
    setIsChatOpen(true);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(filter.toLowerCase()) ||
    (u.description && u.description.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <>
      <GlobalStyle />
      <MainWrapper>
        <Header>
          <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FaBars />
          </MenuButton>
          <Logo>MXY</Logo>
          <div style={{width: '24px'}} /> {/* Placeholder for balance */}
        </Header>
        <SearchWrapper>
          <SearchIcon />
          <SearchInput
            placeholder="Search users..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </SearchWrapper>
        <UserList>
          {filteredUsers.map((u) => (
            <UserCard 
              key={u._id}
              user={u} 
              onUserClick={() => {
                setSelectedUser(u);
                setIsProfileOpen(true);
              }}
              onChatClick={() => {
                setSelectedUser(u);
                setIsChatOpen(true);
              }}
            />
          ))}
        </UserList>
        {isLoading && <p>Loading...</p>}
        {!isLoading && hasMore && (
          <LoadMoreButton onClick={fetchUsers}>
            Load More
          </LoadMoreButton>
        )}
      </MainWrapper>

      <Menu isOpen={isMenuOpen}>
        <MenuHeader>
          <ProfilePic src={user.photo || 'https://via.placeholder.com/60'} alt={user.username} />
          <Username>{user.username}</Username>
        </MenuHeader>
        <MenuItems>
          <MenuItem onClick={() => setIsSettingsOpen(true)}>Edit Profile</MenuItem>
          <MenuItem onClick={onLogout}>Logout</MenuItem>
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
            socket={socket}
          />
        )}

        <Settings
          user={user}
          setUser={setUser}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </Suspense>
    </>
  );
};

export default MainPage;