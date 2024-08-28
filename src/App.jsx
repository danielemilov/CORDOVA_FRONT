import React, { useState, useEffect, useCallback } from "react";
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react";

import MainPage from "./components/MainPage";
import Login from "./components/Login";
import Register from "./components/Register";
import EmailVerification from "./components/EmailVerification";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ReportManagement from "./components/ReportManagement";
import { theme, GlobalStyle } from "./SharedStyles";
import { SocketProvider } from './contexts/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <IonApp>
      <ErrorBoundary>
        <ChakraProvider theme={theme}>
          <GlobalStyle />
          <SocketProvider>
            <IonReactRouter>
              <IonRouterOutlet>
                <Route 
                  path="/" 
                  render={() => user ? <MainPage user={user} setUser={setUser} onLogout={handleLogout} /> : <Redirect to="/login" />} 
                  exact={true}
                />
                <Route 
                  path="/login" 
                  render={() => user ? <Redirect to="/" /> : <Login onLogin={handleLogin} />} 
                  exact={true}
                />
                <Route 
                  path="/register" 
                  render={() => user ? <Redirect to="/" /> : <Register />} 
                  exact={true}
                />
                <Route path="/verify-email/:token" component={EmailVerification} exact={true} />
                <Route path="/forgot-password" component={ForgotPassword} exact={true} />
                <Route path="/reset-password/:token" component={ResetPassword} exact={true} />
                <Route 
                  path="/report-management" 
                  render={() => user && user.isAdmin ? <ReportManagement /> : <Redirect to="/" />} 
                  exact={true}
                />
                <Route render={() => <Redirect to={user ? "/" : "/login"} />} />
              </IonRouterOutlet>
            </IonReactRouter>
          </SocketProvider>
        </ChakraProvider>
      </ErrorBoundary>
    </IonApp>
  );
}

export default App;