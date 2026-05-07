import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing[8] }]}>
      <Text variant="title" weight="semibold" align="center" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text variant="body" color={undefined} align="center" style={styles.description}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    opacity: 0.6,
    lineHeight: 22,
  },
  action: {
    marginTop: 16,
  },
});
