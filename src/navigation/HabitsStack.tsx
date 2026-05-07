import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HabitsStackParamList } from './types';
import { HabitListScreen } from '@/screens/habits/HabitListScreen';
import { HabitFormScreen } from '@/screens/habits/HabitFormScreen';
import { useTheme } from '@/theme';

const Stack = createNativeStackNavigator<HabitsStackParamList>();

export function HabitsStack() {
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
        name="HabitList"
        component={HabitListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HabitForm"
        component={HabitFormScreen}
        options={({ route }) => ({
          title: route.params?.habit ? 'Edit Habit' : 'New Habit',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
}
