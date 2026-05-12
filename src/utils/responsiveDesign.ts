import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Breakpoint definitions
export const BREAKPOINTS = {
  XS: 320,   // Small phones
  SM: 375,   // iPhone SE, iPhone 12 mini
  MD: 414,   // iPhone 12, iPhone 13
  LG: 768,   // Tablets portrait
  XL: 1024,  // Tablets landscape
  XXL: 1440, // Large tablets
} as const;

// Device type detection
export const getDeviceType = () => {
  if (screenWidth >= BREAKPOINTS.XL) return 'tablet-landscape';
  if (screenWidth >= BREAKPOINTS.LG) return 'tablet-portrait';
  return 'phone';
};

export const isPhone = getDeviceType() === 'phone';
export const isTablet = getDeviceType().includes('tablet');
export const isSmallScreen = screenWidth < BREAKPOINTS.SM;
export const isLargeScreen = screenWidth >= BREAKPOINTS.LG;

// Responsive sizing functions
export const responsiveSize = (
  phoneSize: number,
  tabletSize?: number,
  largeTabletSize?: number
) => {
  if (screenWidth >= BREAKPOINTS.XL && largeTabletSize) return largeTabletSize;
  if (screenWidth >= BREAKPOINTS.LG && tabletSize) return tabletSize;
  return phoneSize;
};

export const responsivePadding = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const sizes = {
    xs: responsiveSize(8, 12, 16),
    sm: responsiveSize(12, 16, 20),
    md: responsiveSize(16, 20, 24),
    lg: responsiveSize(20, 24, 32),
    xl: responsiveSize(24, 32, 40),
  };
  return sizes[size];
};

export const responsiveMargin = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const sizes = {
    xs: responsiveSize(4, 8, 12),
    sm: responsiveSize(8, 12, 16),
    md: responsiveSize(12, 16, 20),
    lg: responsiveSize(16, 20, 24),
    xl: responsiveSize(20, 24, 32),
  };
  return sizes[size];
};

export const responsiveFontSize = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl') => {
  const sizes = {
    xs: responsiveSize(10, 12, 14),
    sm: responsiveSize(12, 14, 16),
    md: responsiveSize(14, 16, 18),
    lg: responsiveSize(16, 18, 20),
    xl: responsiveSize(18, 20, 22),
    '2xl': responsiveSize(20, 22, 24),
    '3xl': responsiveSize(24, 28, 32),
  };
  return sizes[size];
};

export const responsiveIconSize = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const sizes = {
    xs: responsiveSize(12, 14, 16),
    sm: responsiveSize(16, 18, 20),
    md: responsiveSize(20, 22, 24),
    lg: responsiveSize(24, 28, 32),
    xl: responsiveSize(28, 32, 36),
  };
  return sizes[size];
};

// Layout helpers
export const getColumns = (maxColumns: number = 2) => {
  if (screenWidth >= BREAKPOINTS.XL) return Math.min(maxColumns, 4);
  if (screenWidth >= BREAKPOINTS.LG) return Math.min(maxColumns, 3);
  if (screenWidth >= BREAKPOINTS.MD) return Math.min(maxColumns, 2);
  return 1;
};

export const getCardWidth = (maxColumns: number = 2, spacing: number = 16) => {
  const columns = getColumns(maxColumns);
  const totalSpacing = spacing * (columns - 1);
  return (screenWidth - (spacing * 2) - totalSpacing) / columns;
};

// Touch target sizes (following Apple and Google guidelines)
export const getTouchTargetSize = () => {
  return Platform.select({
    ios: responsiveSize(44, 48, 52),
    android: responsiveSize(48, 52, 56),
    default: responsiveSize(44, 48, 52),
  });
};

// Safe area considerations
export const getSafeAreaInsets = () => {
  // This would typically use react-native-safe-area-context
  // For now, return reasonable defaults
  return {
    top: Platform.select({ ios: 44, android: 24, default: 0 }),
    bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
    left: 0,
    right: 0,
  };
};

// Animation timing based on device capabilities
export const getAnimationDuration = (duration: 'fast' | 'normal' | 'slow') => {
  const durations = {
    fast: responsiveSize(150, 200, 250),
    normal: responsiveSize(300, 350, 400),
    slow: responsiveSize(500, 600, 700),
  };
  return durations[duration];
};

// Grid system
export const createResponsiveGrid = (columns: number, spacing: number = 16) => {
  const deviceColumns = getColumns(columns);
  const itemWidth = getCardWidth(columns, spacing);
  
  return {
    columns: deviceColumns,
    itemWidth,
    spacing,
    containerWidth: screenWidth - (spacing * 2),
  };
};

// Responsive breakpoints hook (would be used in components)
export const useResponsiveBreakpoint = () => {
  const currentWidth = screenWidth;
  
  if (currentWidth >= BREAKPOINTS.XL) return 'xl';
  if (currentWidth >= BREAKPOINTS.LG) return 'lg';
  if (currentWidth >= BREAKPOINTS.MD) return 'md';
  if (currentWidth >= BREAKPOINTS.SM) return 'sm';
  return 'xs';
};

// Device orientation
export const getOrientation = () => {
  return screenWidth > screenHeight ? 'landscape' : 'portrait';
};

// Platform-specific adjustments
export const getPlatformSpecificStyles = () => {
  return {
    statusBarHeight: Platform.select({
      ios: getSafeAreaInsets().top,
      android: 24,
      default: 0,
    }),
    tabBarHeight: Platform.select({
      ios: 83,
      android: 56,
      default: 60,
    }),
    headerHeight: Platform.select({
      ios: 44,
      android: 56,
      default: 50,
    }),
  };
};

// Responsive spacing scale
export const SPACING_SCALE = {
  xs: responsiveSize(4, 6, 8),
  sm: responsiveSize(8, 12, 16),
  md: responsiveSize(16, 20, 24),
  lg: responsiveSize(24, 32, 40),
  xl: responsiveSize(32, 40, 48),
  '2xl': responsiveSize(40, 48, 56),
  '3xl': responsiveSize(48, 56, 64),
};

// Responsive border radius
export const getBorderRadius = (size: 'sm' | 'md' | 'lg' | 'xl') => {
  const sizes = {
    sm: responsiveSize(4, 6, 8),
    md: responsiveSize(8, 10, 12),
    lg: responsiveSize(12, 16, 20),
    xl: responsiveSize(16, 20, 24),
  };
  return sizes[size];
};

// Responsive shadow
export const getShadow = (level: 'sm' | 'md' | 'lg') => {
  const shadows = {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
  };
  return shadows[level];
};
