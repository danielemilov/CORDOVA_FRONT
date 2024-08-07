import React from 'react';
import { Box, Flex, Heading, Menu, MenuButton, MenuList, MenuItem, IconButton, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import Settings from './Settings';

const Header = ({ user, onLogout }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg="black" color="white" py={4} px={6}>
        <Flex justify="space-between" align="center">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
              color="white"
            />
            <MenuList>
              <MenuItem onClick={onOpen}>Settings</MenuItem>
              <MenuItem onClick={onLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
          <Heading as={Link} to="/" fontSize="xl">
            MXY
          </Heading>
        </Flex>
      </Box>
      {isOpen && <Settings user={user} isOpen={isOpen} onClose={onClose} />}
    </>
  );
};

export default Header;