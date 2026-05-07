import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { authService } from '@/services';
import { syncQueueStorage } from '@/storage';
import { QUERY_KEYS } from '@/constants';
import { Text, Divider, OfflineBanner, ScreenHeader } from '@/components/common';
import { useNetworkStatus } from '@/sync';

interface Props {
  onLogout: () => void;
}

function SettingsRow({
  label,
  value,
  onPress,
  destructive,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const { colors, spacing } = useTheme();

  const content = (
    <View style={[styles.row, { paddingHorizontal: spacing[5], paddingVertical: spacing[4] }]}>
      <Text
        variant="body"
        weight={onPress ? 'medium' : 'regular'}
        color={destructive ? colors.danger : colors.text}
      >
        {label}
      </Text>
      {value && (
        <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={1} style={styles.rowValue}>
          {value}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function SettingsScreen({ onLogout }: Props) {
  const { colors, spacing } = useTheme();
  const { session } = useAuth();
  const isOnline = useNetworkStatus();

  const { data: me } = useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: () => authService.getMe(),
    enabled: !!session,
    staleTime: 1000 * 60 * 5,
  });

  const pendingCount = syncQueueStorage.size();

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: onLogout },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <OfflineBanner />
      <ScreenHeader title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
          <SettingsRow label="Account" value={me?.email ?? session?.user.email} />
          <Divider indent={20} />
          <SettingsRow
            label="Email verified"
            value={me?.isEmailVerified ? 'Yes' : 'No'}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, marginTop: spacing[4] }]}>
          <SettingsRow
            label="Network"
            value={isOnline ? 'Online' : 'Offline'}
          />
          <Divider indent={20} />
          <SettingsRow
            label="Pending sync actions"
            value={String(pendingCount)}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, marginTop: spacing[4] }]}>
          <SettingsRow
            label="Log out"
            onPress={handleLogout}
            destructive
          />
        </View>

        <View style={[styles.footer, { paddingHorizontal: spacing[5] }]}>
          <Text variant="caption" color={colors.textTertiary} align="center">
            Habit Tracker v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  section: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowValue: {
    maxWidth: '55%',
    textAlign: 'right',
  },
  footer: {
    paddingVertical: 32,
  },
});
