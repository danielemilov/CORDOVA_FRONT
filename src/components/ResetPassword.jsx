import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import { IonContent, IonButton, IonInput, IonItem, IonLabel, IonCard, IonCardContent, IonToast } from '@ionic/react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');
  const { token } = useParams();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToastMessage('Passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password/${token}`, { password });
      setToastMessage(response.data.message);
      setToastColor('success');
      setShowToast(true);
      setTimeout(() => history.push('/login'), 2000);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'An error occurred');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonContent className="ion-padding">
      <IonCard>
        <IonCardContent>
          <form onSubmit={handleSubmit}>
            <IonItem>
              <IonLabel position="floating">New Password</IonLabel>
              <IonInput 
                type="password" 
                value={password} 
                onIonChange={(e) => setPassword(e.detail.value)} 
                required
              />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Confirm New Password</IonLabel>
              <IonInput 
                type="password" 
                value={confirmPassword} 
                onIonChange={(e) => setConfirmPassword(e.detail.value)} 
                required
              />
            </IonItem>
            <IonButton 
              expand="block" 
              type="submit" 
              disabled={isLoading}
              className="ion-margin-top"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </IonButton>
          </form>
        </IonCardContent>
      </IonCard>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={5000}
        color={toastColor}
      />
    </IonContent>
  );
};

export default ResetPassword;