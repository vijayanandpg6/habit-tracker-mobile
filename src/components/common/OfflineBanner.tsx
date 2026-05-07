import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { useNetworkStatus } from '@/sync';
import { useSyncState } from '@/sync/useSyncEngine';

export function OfflineBanner() {
  const { colors, spacing } = useTheme();
  const isOnline = useNetworkStatus();
  const { isSyncing, pendingCount } = useSyncState();

  if (!isOnline) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.warning, paddingVertical: spacing[2] }]}>
        <Text variant="caption" weight="medium" color="#fff" align="center">
          You are offline. Changes will sync when connected.
        </Text>
      </View>
    );
  }

  if (isSyncing || pendingCount > 0) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.primary, paddingVertical: spacing[2] }]}>
        <Text variant="caption" weight="medium" color="#fff" align="center">
          {isSyncing ? 'Syncing changes...' : `${pendingCount} change${pendingCount > 1 ? 's' : ''} pending sync`}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
  },
});
