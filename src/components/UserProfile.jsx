import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaMapMarkerAlt, FaComment, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import { Username, Description, StatusDot, Button } from '../SharedStyles';

const ProfileWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgb(0, 0, 0);
  z-index: 1000;
  overflow-y: auto;
  
  display: flex;
  flex-direction: column;
`;

const CoverPhoto = styled.div`
  height: 60vh;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const ProfileStatusDot = styled(StatusDot)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 12px;
  height: 12px;
  box-shadow: 0 0 0 2px #fff;
`;

const ProfileUsername = styled(Username)`
  position: absolute;
  bottom: 30px;
  left: 20px;
  font-size: 32px;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
`;

const AgeDisplay = styled.div`
  position: absolute;
  bottom: 32px;
  right: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
`;

const Content = styled.div`
  padding: 20px 20px 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0000003b;
  border-top-left-radius: 0px;
  border-top-right-radius: 120px;
  margin-top: -30px;
  position: relative;
  box-shadow: 0px -5px 20px rgba(0, 0, 0, 0.1);
`;

const ProfileInfo = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  max-width: fit-content;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.861);
  border-radius: 20px;
`;

const ProfileDescriptionWrapper = styled.div`
  position: relative;
  padding: 20px;
  padding-right: 40px;
  margin-bottom: 30px;
  margin-left: 20px;
  background-color: #f0f0f0;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 2px 30px rgb(249, 249, 249);
  width: calc(100% + 10px);
  left: -10px;
  
  @media (min-width: 375px) {
    width: calc(100% + 20px);
    left: -20px;
  }

  @media (min-width: 481px) {
    width: calc(100% + 60px);
    left: -60px;
  }

  @media (min-width: 769px) {
    width: calc(100% + 150px);
    left: -150px;
  }
`;

const QuoteIcon = styled.span`
  position: absolute;
  font-size: 24px;
  color: #ddd;
`;

const LeftQuote = styled(QuoteIcon)`
  top: 10px;
  left: 10px;
`;

const RightQuote = styled(QuoteIcon)`
  bottom: 10px;
  right: 10px;
`;

const ProfileDescription = styled(Description)`
  font-size: 18px;
  line-height: 1.6;
  color: #333;
  text-align: left;
  padding-left: 10px;
  
  @media (min-width: 375px) {
    padding-left: 20px;
  }

  @media (min-width: 481px) {
    padding-left: 60px;
  }

  @media (min-width: 769px) {
    padding-left: 150px;
  }
`;

const ChatButton = styled(Button)`
  padding: 15px 30px;
  font-size: 18px;
  background-color: #00000034;
  color: #ffffff;
  border-radius: 30px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #333;
    transform: translateY(-2px);
  }
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
      <CoverPhoto src={user.photo ? user.photo.replace('http://', 'https://') : 'https://via.placeholder.com/800x600'}>
        <GradientOverlay />
        <BackButton onClick={onClose}><FaArrowLeft /></BackButton>
        <ProfileStatusDot $online={user.isOnline} />
        <ProfileUsername>{user.username}</ProfileUsername>
        <AgeDisplay>{user.age}</AgeDisplay>
      </CoverPhoto>
      <Content>
        <ProfileInfo>
          <ProfileDescriptionWrapper>
            <LeftQuote><FaQuoteLeft /></LeftQuote>
            <ProfileDescription>{user.description}</ProfileDescription>
            <RightQuote><FaQuoteRight /></RightQuote>
          </ProfileDescriptionWrapper>
          <ChatButton onClick={() => onChatClick(user)}>
            <FaComment style={{ marginRight: '10px' }} />
            Chat
          </ChatButton>
        </ProfileInfo>
        <LocationInfo>
          <FaMapMarkerAlt style={{ marginRight: '10px' }} />
          {formatDistance(user.distance)}
        </LocationInfo>
      </Content>
    </ProfileWrapper>
  );
};

export default UserProfile;