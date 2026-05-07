import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

type Variant = 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodySmall' | 'caption' | 'label';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

interface Props extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

const variantStyles: Record<Variant, { fontSize: number; lineHeight: number }> = {
  h1: { fontSize: 34, lineHeight: 41 },
  h2: { fontSize: 28, lineHeight: 34 },
  h3: { fontSize: 24, lineHeight: 29 },
  title: { fontSize: 20, lineHeight: 25 },
  body: { fontSize: 15, lineHeight: 22 },
  bodySmall: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 11, lineHeight: 16 },
  label: { fontSize: 13, lineHeight: 18 },
};

export function Text({
  variant = 'body',
  weight = 'regular',
  color,
  align = 'left',
  style,
  ...props
}: Props) {
  const { colors, typography } = useTheme();

  return (
    <RNText
      style={[
        variantStyles[variant],
        {
          fontWeight: typography.weights[weight],
          color: color ?? colors.text,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    />
  );
}
