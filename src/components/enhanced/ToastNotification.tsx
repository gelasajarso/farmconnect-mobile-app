import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBorderRadius, getShadow } from '../../utils/responsiveDesign';

const { width: screenWidth } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  isVisible: boolean;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const COLORS = {
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  text: '#FFFFFF',
  sub: 'rgba(255, 255, 255, 0.8)',
};

const TOAST_CONFIG = {
  success: {
    icon: 'checkmark-circle' as const,
    backgroundColor: COLORS.success,
  },
  error: {
    icon: 'close-circle' as const,
    backgroundColor: COLORS.error,
  },
  warning: {
    icon: 'warning' as const,
    backgroundColor: COLORS.warning,
  },
  info: {
    icon: 'information-circle' as const,
    backgroundColor: COLORS.info,
  },
};

export default function ToastNotification({
  message,
  type = 'info',
  duration = 3000,
  isVisible,
  onHide,
  action,
}: ToastProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isVisible) {
      showToast();
      
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, duration]);

  const showToast = () => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const config = TOAST_CONFIG[type];

  const getToastStyle = () => {
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    });

    return {
      transform: [{ translateY }],
      opacity: opacityValue,
      backgroundColor: config.backgroundColor,
      marginHorizontal: 16,
      maxWidth: screenWidth - 32,
      ...getShadow('lg'),
    };
  };

  return (
    <Animated.View style={[styles.toast, getToastStyle()]}>
      <View style={styles.toastContent}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={config.icon}
            size={24}
            color={COLORS.text}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
        </View>

        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons
            name="close"
            size={20}
            color={COLORS.sub}
          />
        </TouchableOpacity>
      </View>

      {action && (
        <TouchableOpacity
          onPress={() => {
            action.onPress();
            hideToast();
          }}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// Toast container component for managing multiple toasts
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          isVisible={true}
          onHide={() => onRemoveToast(toast.id)}
          action={toast.action}
        />
      ))}
    </View>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = React.useCallback((
    message: string,
    type: ToastType = 'info',
    options?: {
      duration?: number;
      action?: {
        label: string;
        onPress: () => void;
      };
    }
  ) => {
    const id = Date.now().toString();
    const newToast: ToastItem = {
      id,
      message,
      type,
      duration: options?.duration,
      action: options?.action,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = React.useCallback((message: string, options?: any) => {
    addToast(message, 'success', options);
  }, [addToast]);

  const error = React.useCallback((message: string, options?: any) => {
    addToast(message, 'error', options);
  }, [addToast]);

  const warning = React.useCallback((message: string, options?: any) => {
    addToast(message, 'warning', options);
  }, [addToast]);

  const info = React.useCallback((message: string, options?: any) => {
    addToast(message, 'info', options);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    borderRadius: getBorderRadius('md'),
    padding: 16,
    marginBottom: 8,
    minHeight: 60,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 22,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  actionButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: getBorderRadius('sm'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
});
