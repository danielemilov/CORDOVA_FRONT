import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaBirthdayCake, FaMapMarkerAlt } from 'react-icons/fa';
import { Avatar, Username, Description, StatusDot, Button } from '../SharedStyles';

const ProfileWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  overflow-y: auto;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 20px;
  background: #000000;
  color: white;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  margin-right: 20px;
`;

const Content = styled.div`
  padding: 20px;
`;

const ProfileAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  display: block;

`;  

const ProfileInfo = styled.div`
  text-align: center;
  
`;

const AgeAndLocation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
`;

const IconWrapper = styled.span`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

const BirthdayMessage = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: #FF69B4;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChatButton = styled(Button)`
  margin-top: 20px;
  width: fit-content;
  margin-left: 10.2rem;
  background-color: #003104;
`;

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'Unknown distance';
  if (distance < 1) return 'Less than 1 km away';
  if (distance < 10) return `${distance.toFixed(1)} km away`;
  return `${Math.round(distance)} km away`;
};

const UserProfile = ({ user, isOpen, onClose, onChatClick }) => {
  if (!isOpen) return null;

  return (
    <ProfileWrapper>
      <Header>
        <BackButton onClick={onClose}><FaArrowLeft /></BackButton>
        <Username>{user.username}'s Profile</Username>
      </Header>
      <Content>
        <ProfileAvatar src={user.photo || 'https://via.placeholder.com/120'} alt={user.username} />
        <ProfileInfo>
          <Username>{user.username} <StatusDot online={user.isOnline} /></Username>
          <AgeAndLocation>
            {user.age && (
              <IconWrapper>
                {user.age} years
              </IconWrapper>
            )}
            <IconWrapper>
              <FaMapMarkerAlt />
              {formatDistance(user.distance)}
            </IconWrapper>
          </AgeAndLocation>
          {user.birthDate && (
            <BirthdayMessage>
              <FaBirthdayCake style={{ marginRight: '5px' }} />
              Birthday today!
            </BirthdayMessage>
          )}
          <Description>{user.description}</Description>
        </ProfileInfo>
        <ChatButton onClick={() => onChatClick(user)}>
          Chat with {user.username}
        </ChatButton>
      </Content>
    </ProfileWrapper>
  );
};

export default UserProfile;