import React, { useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaBirthdayCake, FaMapMarkerAlt, FaComment } from 'react-icons/fa';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      #ff9a9e, #fad0c4, #ffecd2, #fcb69f
    );
    background-size: 400% 400%;
    opacity: 0.1;
    z-index: -1;
    animation: ${gradientAnimation} 15s ease infinite;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);

    &:before {
      opacity: 0.2;
    }
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  color: #333;
`;

const StatusDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$online ? '#4CAF50' : '#9E9E9E'};
  margin-left: 10px;
  box-shadow: 0 0 0 2px #fff;
`;

const Description = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
  line-height: 1.4;
`;

const Details = styled.div`
  display: flex;
  font-size: 14px;
  color: #888;
`;

const Detail = styled.span`
  display: flex;
  align-items: center;
  margin-right: 20px;
  
  svg {
    margin-right: 5px;
    font-size: 16px;
  }
`;

const ChatButton = styled.button`
  background: ${props => props.$hasUnread ? '#4CAF50' : '#f0f0f0'};
  border: none;
  color: ${props => props.$hasUnread ? 'white' : '#333'};
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
`;

const UnreadBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
`;

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'Unknown distance';
  if (distance < 1) return `${Math.round(distance * 1000)} meters away`;
  if (distance < 10) return `${distance.toFixed(1)} km away`;
  return `${Math.round(distance)} km away`;
};

const UserCard = ({ user, onUserClick, onChatClick, unreadCount }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Card ref={cardRef} onClick={() => onUserClick(user)}>
      <Avatar>
        <img src={user.photo || 'https://via.placeholder.com/80'} alt={user.username} />
      </Avatar>
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
};

export default UserCard;