import React from 'react';
import styled from 'styled-components';
import { FaBirthdayCake, FaMapMarkerAlt, FaComment } from 'react-icons/fa';

const Card = styled.div`
  background: #e7e7e7;
  border-radius: 15px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 2px 10px rgb(137, 137, 137);
  }
`;

const Avatar = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
`;

const StatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.$online ? '#4CAF50' : '#9E9E9E'};
  margin-left: 10px;
`;

const Description = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
`;

const Details = styled.div`
  display: flex;
  font-size: 12px;
  color: #888;
`;

const Detail = styled.span`
  display: flex;
  align-items: center;
  margin-right: 15px;

  svg {
    margin-right: 5px;
  }
`;

const ChatButton = styled.button`
  background: ${props => props.$hasUnread ? '#ffffff' : 'none'};
  border: none;
  color: ${props => props.$hasUnread ? 'white' : '#00000033'};
  font-size: 19px;
  margin-top: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    transform: scale(1.1);
  }
`;

const UnreadBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
`;

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'Unknown distance';
  if (distance < 1) return `${Math.round(distance * 1000)} meters away`;
  if (distance < 10) return `${distance.toFixed(1)} km away`;
  return `${Math.round(distance)} km away`;
};

const UserCard = ({ user, onUserClick, onChatClick, unreadCount }) => (
  <Card onClick={() => onUserClick(user)}>
    <Avatar src={user.photo || 'https://via.placeholder.com/70'} alt={user.username} />
    <UserInfo>
      <Username>
        {user.username}
        <StatusDot $online={user.isOnline} />
      </Username>
      <Description>{user.description}</Description>
      <Details>
        {user.age && (
          <Detail>
            <FaBirthdayCake />
            {user.age} years
          </Detail>
        )}
        <Detail>
          <FaMapMarkerAlt />
          {formatDistance(user.distance)}
        </Detail>
      </Details>
    </UserInfo>
    <ChatButton 
      $hasUnread={unreadCount > 0}
      onClick={(e) => {
        e.stopPropagation();
        onChatClick(user);
      }}
    >
      <FaComment />
      {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
    </ChatButton>
  </Card>
);

export default UserCard;