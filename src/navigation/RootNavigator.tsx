import React from 'react';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';
import { useAuth } from '@/services/AuthContext';
import { useSyncEngine } from '@/sync';
import { AuthStackParamList } from './types';

const linking: LinkingOptions<AuthStackParamList> = {
  prefixes: ['tasks://'],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      VerifyEmail: 'verify-email',
    },
  },
};

export function RootNavigator() {
  const { isAuthenticated, logout } = useAuth();

  useSyncEngine();

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <AppTabs onLogout={logout} /> : <AuthStack />}
    </NavigationContainer>
  );
}
