import React, { useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaMapMarkerAlt } from 'react-icons/fa';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Card = styled.div`
  background: rgb(255, 255, 255);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 3px 10px rgba(7, 7, 7, 0.17);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 120px;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 50px;
  border-top-left-radius: 0px;
  border-top-right-radius:60px;

  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      #f3e7e9, #e3eeff, #e9e4f0, #d3cce3
    );
    background-size: 400% 400%;
    opacity: 0.1;
    z-index: -1;
    animation: ${gradientAnimation} 15s ease infinite;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-3px);
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
  flex-shrink: 0;

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
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`;

const UsernameLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const Username = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  margin-right: 8px;
`;

const AgeTag = styled.span`
  background-color: rgb(255, 255, 255);
  color: #6011bb;
  padding: 2px 6px;
  border-radius: 50px;
  position: absolute;
  top: 20px;
  left: 85px;
  font-size: 12px;
  font-weight: bold;
`;

const StatusDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$online ? '#4CAF50' : '#9E9E9E'};
  position: absolute;
  top: 25px;
  right: 35px;
  box-shadow: 0 0 0 2px #fff;
`;

const Description = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Detail = styled.span`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #888;
  
  svg {
    margin-right: 5px;
    font-size: 16px;
  }
`;

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'Unknown distance';
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  if (distance < 10) return `${distance.toFixed(1)} km`;
  return `${Math.round(distance)} km`;
};

const UserCard = ({ user, onUserClick }) => {
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
      <StatusDot $online={user.isOnline} />
      <Avatar>
        <img src={user.photo || 'https://via.placeholder.com/80'} alt={user.username} />
      </Avatar>
      <UserInfo>
        <UsernameLine>
          <Username>{user.username}</Username>
          {user.age && <AgeTag>{user.age}</AgeTag>}
        </UsernameLine>
        <Description>{user.description}</Description>
        <Detail>
          <FaMapMarkerAlt />
          {formatDistance(user.distance)}
        </Detail>
      </UserInfo>
    </Card>
  );
};

export default UserCard;