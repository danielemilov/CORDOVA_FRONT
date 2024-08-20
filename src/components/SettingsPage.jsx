import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import api from '../api';

const SettingsWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
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
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const Title = styled.h2`
  font-size: 24px;
  color: #fff;
  margin: 0;
`;

const Content = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
`;

const FormControl = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #fff;
  font-size: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #b766ce;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #9a4eb1;
  }

  &:disabled {
    background-color: rgba(183, 102, 206, 0.5);
    cursor: not-allowed;
  }
`;

const SettingsPage = ({ user, setUser, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    description: '',
    age: '',
    gender: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        title: user.title || '',
        description: user.description || '',
        age: user.age || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.put(`/api/users/${user._id}`, formData);
      setUser(response.data);
      onClose();
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <SettingsWrapper>
      <Header>
        <BackButton onClick={onClose}><FaArrowLeft /></BackButton>
        <Title>Edit Profile</Title>
        <div style={{ width: '40px' }}></div>
      </Header>
      <Content>
        <Form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel>Full Name</FormLabel>
            <Input name="fullName" value={formData.fullName} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input name="title" value={formData.title} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input name="description" value={formData.description} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Age</FormLabel>
            <Input name="age" type="number" value={formData.age} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Gender</FormLabel>
            <Input name="gender" value={formData.gender} onChange={handleChange} />
          </FormControl>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>
        </Form>
      </Content>
    </SettingsWrapper>
  );
};

export default SettingsPage;