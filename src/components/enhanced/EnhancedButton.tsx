import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTouchTargetSize, getBorderRadius, getShadow } from '../../utils/responsiveDesign';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface EnhancedButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

const COLORS = {
  primary: '#1A7A35',
  secondary: '#6B8F71',
  outline: '#C8E6C9',
  ghost: 'transparent',
  danger: '#F44336',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#FFFFFF',
  disabled: '#E0E0E0',
};

export default function EnhancedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  children,
}: EnhancedButtonProps) {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.spring(animatedValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: getBorderRadius('md'),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: getTouchTargetSize(),
      minWidth: fullWidth ? '100%' : getTouchTargetSize() * 2,
      ...getShadow('md'),
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? COLORS.disabled : COLORS.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: disabled ? COLORS.disabled : COLORS.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? COLORS.disabled : COLORS.outline,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      danger: {
        backgroundColor: disabled ? COLORS.disabled : COLORS.danger,
        borderWidth: 0,
      },
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      sm: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: getTouchTargetSize() * 0.8,
      },
      md: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: getTouchTargetSize(),
      },
      lg: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        minHeight: getTouchTargetSize() * 1.2,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const variantStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: disabled ? COLORS.sub : COLORS.white },
      secondary: { color: disabled ? COLORS.sub : COLORS.white },
      outline: { color: disabled ? COLORS.sub : COLORS.primary },
      ghost: { color: disabled ? COLORS.sub : COLORS.primary },
      danger: { color: disabled ? COLORS.sub : COLORS.white },
    };

    const sizeStyles: Record<ButtonSize, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...textStyle,
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'sm' ? 'small' : 'large'}
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
        />
      );
    }

    const iconComponent = icon ? (
      <Ionicons
        name={icon}
        size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
        color={getTextStyles().color}
        style={iconPosition === 'right' ? { marginLeft: 8 } : { marginRight: 8 }}
      />
    ) : null;

    const textComponent = title || children ? (
      <Text style={getTextStyles()}>
        {title || children}
      </Text>
    ) : null;

    if (iconPosition === 'right') {
      return (
        <>
          {textComponent}
          {iconComponent}
        </>
      );
    }

    return (
      <>
        {iconComponent}
        {textComponent}
      </>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <TouchableOpacity
        style={getButtonStyles()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}
