import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { getBorderRadius } from '../../utils/responsiveDesign';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  variant?: 'rectangular' | 'circular' | 'text';
  style?: any;
  animationDuration?: number;
}

const COLORS = {
  background: '#F5F5F5',
  highlight: '#E0E0E0',
};

export default function SkeletonLoader({
  width = '100%',
  height = 40,
  variant = 'rectangular',
  style,
  animationDuration = 1000,
}: SkeletonLoaderProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue, animationDuration]);

  const getStyle = () => {
    const baseStyle = {
      width,
      height,
      backgroundColor: COLORS.background,
      overflow: 'hidden' as const,
    };

    const variantStyles = {
      rectangular: {
        borderRadius: getBorderRadius('md'),
      },
      circular: {
        borderRadius: height / 2,
      },
      text: {
        borderRadius: getBorderRadius('sm'),
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...style,
    };
  };

  const shimmerStyle = {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.highlight,
    opacity: animatedValue,
  };

  return (
    <View style={getStyle()}>
      <Animated.View style={shimmerStyle} />
    </View>
  );
}

// Skeleton card component
export const SkeletonCard = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <SkeletonLoader width={40} height={40} variant="circular" />
      <View style={styles.cardHeaderText}>
        <SkeletonLoader width={120} height={16} style={styles.titleSkeleton} />
        <SkeletonLoader width={80} height={12} style={styles.subtitleSkeleton} />
      </View>
    </View>
    <View style={styles.cardContent}>
      <SkeletonLoader width="100%" height={12} style={styles.contentSkeleton} />
      <SkeletonLoader width="80%" height={12} style={styles.contentSkeleton} />
      <SkeletonLoader width="60%" height={12} style={styles.contentSkeleton} />
    </View>
  </View>
);

// Skeleton list component
export const SkeletonList = ({ items = 3 }: { items?: number }) => (
  <View style={styles.list}>
    {Array.from({ length: items }).map((_, index) => (
      <View key={index} style={styles.listItem}>
        <SkeletonLoader width={50} height={50} variant="circular" />
        <View style={styles.listContent}>
          <SkeletonLoader width={150} height={16} style={styles.listTitle} />
          <SkeletonLoader width={100} height={12} style={styles.listSubtitle} />
        </View>
      </View>
    ))}
  </View>
);

// Skeleton stats component
export const SkeletonStats = ({ stats = 4 }: { stats?: number }) => (
  <View style={styles.statsContainer}>
    {Array.from({ length: stats }).map((_, index) => (
      <View key={index} style={styles.statCard}>
        <SkeletonLoader width="100%" height={24} style={styles.statValue} />
        <SkeletonLoader width="80%" height={12} style={styles.statLabel} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: getBorderRadius('md'),
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  titleSkeleton: {
    marginBottom: 4,
  },
  subtitleSkeleton: {
    alignSelf: 'flex-start',
  },
  cardContent: {
    gap: 4,
  },
  contentSkeleton: {
    marginBottom: 2,
  },
  list: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listContent: {
    flex: 1,
    marginLeft: 16,
  },
  listTitle: {
    marginBottom: 4,
  },
  listSubtitle: {
    alignSelf: 'flex-start',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getBorderRadius('md'),
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    marginBottom: 8,
  },
  statLabel: {
    alignSelf: 'center',
  },
});
