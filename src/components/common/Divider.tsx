import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface Props {
  indent?: number;
}

export function Divider({ indent = 0 }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.base, { backgroundColor: colors.border, marginLeft: indent }]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
