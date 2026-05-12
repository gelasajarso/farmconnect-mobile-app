import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBorderRadius, getShadow } from '../../utils/responsiveDesign';

export type InputVariant = 'default' | 'outlined' | 'filled';
export type InputSize = 'sm' | 'md' | 'lg';
export type TextInputType = 'text' | 'email' | 'phone' | 'password' | 'number';

interface EnhancedInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: InputSize;
  type?: TextInputType;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go' | 'search' | 'send';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  editable?: boolean;
}

const COLORS = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#FFFFFF',
  error: '#F44336',
  errorBg: '#FFEBEE',
  warning: '#FF9800',
  warningBg: '#FFF3E0',
  success: '#4CAF50',
  successBg: '#E8F5E8',
  disabled: '#E0E0E0',
  focus: '#1A7A35',
};

export default function EnhancedInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  type = 'text',
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onBlur,
  onFocus,
  onSubmitEditing,
  returnKeyType = 'done',
  style,
  inputStyle,
  editable = true,
}: EnhancedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const animatedBorder = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(animatedBorder, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    setShowPassword(!showPassword);
  };

  const getInputStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: getBorderRadius('md'),
      borderWidth: 1,
      ...getShadow('sm'),
    };

    const variantStyles: Record<InputVariant, ViewStyle> = {
      default: {
        backgroundColor: COLORS.white,
        borderColor: error ? COLORS.error : isFocused ? COLORS.focus : COLORS.border,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: error ? COLORS.error : isFocused ? COLORS.focus : COLORS.border,
        borderWidth: 2,
      },
      filled: {
        backgroundColor: COLORS.surface,
        borderColor: 'transparent',
        borderWidth: 0,
      },
    };

    const sizeStyles: Record<InputSize, ViewStyle> = {
      sm: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 40,
      },
      md: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
      },
      lg: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        minHeight: 56,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };
  };

  const getInputTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      color: disabled ? COLORS.disabled : COLORS.text,
    };

    return {
      ...baseStyle,
      ...inputStyle,
    };
  };

  const getLabelStyles = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: '600',
      color: error ? COLORS.error : COLORS.text,
      marginBottom: 8,
    };
  };

  const getHelperStyles = (): TextStyle => {
    return {
      fontSize: 12,
      color: error ? COLORS.error : COLORS.sub,
      marginTop: 4,
    };
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    return (
      <Ionicons
        name={leftIcon}
        size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
        color={error ? COLORS.error : isFocused ? COLORS.focus : COLORS.sub}
        style={{ marginRight: 12 }}
      />
    );
  };

  const renderRightIcon = () => {
    if (type === 'password') {
      return (
        <TouchableOpacity onPress={togglePasswordVisibility} style={{ marginLeft: 12 }}>
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
            color={COLORS.sub}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon && onRightIconPress) {
      return (
        <TouchableOpacity onPress={onRightIconPress} style={{ marginLeft: 12 }}>
          <Ionicons
            name={rightIcon}
            size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
            color={COLORS.sub}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'number':
        return 'numeric';
      default:
        return keyboardType;
    }
  };

  const getAutoCapitalize = () => {
    switch (type) {
      case 'email':
        return 'none';
      case 'password':
        return 'none';
      default:
        return autoCapitalize;
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={getLabelStyles()}>
          {label}
          {required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
      )}
      
      <View style={getInputStyles()}>
        {renderLeftIcon()}
        
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.sub}
          secureTextEntry={type === 'password' ? !isPasswordVisible : secureTextEntry}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          editable={!disabled && editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={getInputTextStyles()}
        />
        
        {renderRightIcon()}
      </View>

      {(error || helperText) && (
        <Text style={getHelperStyles()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
