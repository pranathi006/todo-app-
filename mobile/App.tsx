import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/theme';

// Providers wrap everything so any screen can use useAuth() / useTasks()
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AuthProvider>
        <TaskProvider>
          <RootNavigator />
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
