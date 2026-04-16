import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RootNavigator />
      </NotificationProvider>
    </AuthProvider>
  );
}
