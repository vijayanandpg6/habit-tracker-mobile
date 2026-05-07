import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TasksStackParamList } from './types';
import { TaskListScreen } from '@/screens/tasks/TaskListScreen';
import { TaskFormScreen } from '@/screens/tasks/TaskFormScreen';
import { useTheme } from '@/theme';

const Stack = createNativeStackNavigator<TasksStackParamList>();

export function TasksStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TaskForm"
        component={TaskFormScreen}
        options={({ route }) => ({
          title: route.params?.task ? 'Edit Task' : 'New Task',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
}
