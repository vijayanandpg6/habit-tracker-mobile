import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from './types';
import { TasksStack } from './TasksStack';
import { HabitsStack } from './HabitsStack';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { useTheme } from '@/theme';
import { Text } from '@/components/common';

const Tab = createBottomTabNavigator<AppTabParamList>();

interface Props {
  onLogout: () => void;
}

export function AppTabs({ onLogout }: Props) {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={TasksStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Text
              variant="caption"
              weight={focused ? 'semibold' : 'regular'}
              color={color}
            >
              Tasks
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Text
              variant="caption"
              weight={focused ? 'semibold' : 'regular'}
              color={color}
            >
              Habits
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Text
              variant="caption"
              weight={focused ? 'semibold' : 'regular'}
              color={color}
            >
              Settings
            </Text>
          ),
        }}
      >
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
