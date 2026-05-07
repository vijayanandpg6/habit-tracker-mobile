import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Colors } from './colors';
import { typography } from './typography';
import { spacing, radius } from './spacing';
import { shadows } from './shadows';

export { lightColors, darkColors, typography, spacing, radius, shadows };
export type { Colors };

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors: Colors = isDark ? darkColors : lightColors;
  return { colors, typography, spacing, radius, shadows, isDark };
}
