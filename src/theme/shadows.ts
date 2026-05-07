import { Platform } from 'react-native';

const shadowStyle = (
  elevation: number,
  opacity: number,
  radius: number,
  offsetY: number,
) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {},
  });

export const shadows = {
  none: {},
  sm: shadowStyle(2, 0.04, 2, 1),
  md: shadowStyle(4, 0.06, 6, 2),
  lg: shadowStyle(8, 0.08, 12, 4),
} as const;
