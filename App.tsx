import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ChatProvider } from './src/context/ChatContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <RootNavigator />
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
