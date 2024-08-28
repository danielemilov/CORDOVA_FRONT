import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import { IonContent, IonSpinner, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';

function EmailVerification() {
  const [status, setStatus] = useState('Verifying...');
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useParams();
  const history = useHistory();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email/${token}`);
        setStatus('Email verified successfully. You can now log in.');
        setTimeout(() => history.push('/login'), 3000);
      } catch (error) {
        setStatus('Verification failed. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, history]);

  return (
    <IonContent className="ion-padding">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Email Verification</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {isLoading ? (
            <IonSpinner name="crescent" />
          ) : (
            <IonText>{status}</IonText>
          )}
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
}

export default EmailVerification;