import React, { useState } from 'react';
import { TextInput, View, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, style, onFocus, onBlur, ...props }: Props) {
  const { colors, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" weight="medium" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error
              ? colors.danger
              : isFocused
                ? colors.inputBorderFocused
                : colors.inputBorder,
            borderRadius: radius.md,
            color: colors.text,
            paddingHorizontal: spacing[4],
            paddingVertical: spacing[3],
          },
          style,
        ]}
      />
      {error && (
        <Text variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  input: {
    fontSize: 15,
    borderWidth: 1,
    minHeight: 48,
  },
  error: {
    marginTop: 4,
  },
});
