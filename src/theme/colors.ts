export const palette = {
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',

  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green500: '#22C55E',
  green600: '#16A34A',

  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',

  amber50: '#FFFBEB',
  amber500: '#F59E0B',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export interface Colors {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  primary: string;
  primaryHover: string;
  primarySurface: string;
  success: string;
  successSurface: string;
  danger: string;
  dangerSurface: string;
  warning: string;
  warningSurface: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  placeholder: string;
  skeleton: string;
  overlay: string;
}

export const lightColors: Colors = {
  background: palette.white,
  surface: palette.gray50,
  surfaceRaised: palette.white,

  border: palette.gray200,
  borderSubtle: palette.gray100,

  text: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  textInverse: palette.white,

  primary: palette.blue600,
  primaryHover: palette.blue700,
  primarySurface: palette.blue50,

  success: palette.green600,
  successSurface: palette.green50,

  danger: palette.red600,
  dangerSurface: palette.red50,

  warning: palette.amber500,
  warningSurface: palette.amber50,

  tabBar: palette.white,
  tabBarBorder: palette.gray200,
  tabBarActive: palette.blue600,
  tabBarInactive: palette.gray400,

  inputBackground: palette.gray50,
  inputBorder: palette.gray200,
  inputBorderFocused: palette.blue600,
  placeholder: palette.gray400,

  skeleton: palette.gray200,
  overlay: 'rgba(0,0,0,0.4)',
};

export const darkColors: Colors = {
  background: palette.gray900,
  surface: palette.gray800,
  surfaceRaised: palette.gray700,

  border: palette.gray700,
  borderSubtle: palette.gray800,

  text: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray600,
  textInverse: palette.gray900,

  primary: palette.blue500,
  primaryHover: palette.blue600,
  primarySurface: 'rgba(59,130,246,0.1)',

  success: palette.green500,
  successSurface: 'rgba(34,197,94,0.1)',

  danger: palette.red500,
  dangerSurface: 'rgba(239,68,68,0.1)',

  warning: palette.amber500,
  warningSurface: 'rgba(245,158,11,0.1)',

  tabBar: palette.gray900,
  tabBarBorder: palette.gray800,
  tabBarActive: palette.blue500,
  tabBarInactive: palette.gray600,

  inputBackground: palette.gray800,
  inputBorder: palette.gray700,
  inputBorderFocused: palette.blue500,
  placeholder: palette.gray600,

  skeleton: palette.gray700,
  overlay: 'rgba(0,0,0,0.6)',
};
