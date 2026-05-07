import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function ScreenHeader({ title, subtitle, rightAction, style }: Props) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing[5], paddingVertical: spacing[4] }, style]}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text variant="h3" weight="bold" color={colors.text}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodySmall" color={colors.textSecondary} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} activeOpacity={0.7} style={styles.action}>
            <Text variant="label" weight="semibold" color={colors.primary}>
              {rightAction.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  action: {
    paddingLeft: 16,
    paddingTop: 4,
  },
});
