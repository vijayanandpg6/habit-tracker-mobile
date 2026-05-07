import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from './types';
import { TasksStack } from './TasksStack';
import { HabitsStack } from './HabitsStack';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { useTheme } from '@/theme';

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
        tabBarShowLabel: true,
        tabBarIcon: () => null,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '500',
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarItemStyle: {
          justifyContent: 'center',
        },
      }}
    >
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Habits" component={HabitsStack} />
      <Tab.Screen name="Settings">
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
