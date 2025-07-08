import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../utils/constants';

const { width: screenWidth } = Dimensions.get('window');

interface BentoGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}

interface BentoCardProps {
  children: React.ReactNode;
  span?: 1 | 2 | 3; // How many columns this card should span
  height?: 'small' | 'medium' | 'large' | 'auto';
  backgroundColor?: string;
  style?: any;
}

// Main Bento Grid Container
export const BentoGrid: React.FC<BentoGridProps> = ({ 
  children, 
  columns = 2, 
  gap = SIZES.md 
}) => {
  return (
    <View style={styles.grid}>
      {children}
    </View>
  );
};

// Individual Bento Card
export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  span = 1,
  height = 'medium',
  backgroundColor = COLORS.white,
  style,
}) => {
  const gap = SIZES.md;
  const cardWidth = (screenWidth - SIZES.screenPadding * 2 - gap) / 2;
  const spanWidth = span === 2 ? cardWidth * 2 + gap : 
                    span === 3 ? screenWidth - SIZES.screenPadding * 2 : cardWidth;
  
  const heightMap = {
    small: 120,
    medium: 160,
    large: 200,
    auto: undefined,
  };

  return (
    <View
      style={[
        styles.card,
        {
          width: spanWidth,
          height: heightMap[height],
          backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Specialized Bento Cards for common patterns
interface StatsBentoProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color?: string;
}

export const StatsBento: React.FC<StatsBentoProps> = ({
  icon,
  value,
  label,
  color = COLORS.primary,
}) => {
  return (
    <BentoCard height="medium">
      <View style={styles.statsContent}>
        <View style={[styles.statsIcon, { backgroundColor: COLORS.lightGray }]}>
          {icon}
        </View>
        <View style={styles.statsText}>
          <View style={styles.statsValue}>
            {/* Value will be passed as formatted text */}
          </View>
          <View style={styles.statsLabel}>
            {/* Label will be passed as text */}
          </View>
        </View>
      </View>
    </BentoCard>
  );
};

interface ActionBentoProps {
  children: React.ReactNode;
  onPress?: () => void;
  gradient?: boolean;
  disabled?: boolean;
}

export const ActionBento: React.FC<ActionBentoProps> = ({
  children,
  onPress,
  gradient = false,
  disabled = false,
}) => {
  return (
    <BentoCard height="large" style={styles.actionCard}>
      <View style={[styles.actionContent, disabled && styles.disabled]}>
        {children}
      </View>
    </BentoCard>
  );
};

interface InfoBentoProps {
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const InfoBento: React.FC<InfoBentoProps> = ({
  title,
  children,
  headerAction,
}) => {
  return (
    <BentoCard height="auto" style={styles.infoBento}>
      <View style={styles.infoHeader}>
        <View style={styles.infoTitle}>
          {/* Title will be passed as text component */}
        </View>
        {headerAction && (
          <View style={styles.infoAction}>
            {headerAction}
          </View>
        )}
      </View>
      <View style={styles.infoContent}>
        {children}
      </View>
    </BentoCard>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.screenPadding,
  },
  card: {
    borderRadius: SIZES.buttonRadius || 12,
    padding: SIZES.cardPadding,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: COLORS.white,
    marginBottom: SIZES.xs || 4,
  },
  
  // Stats Bento Styles
  statsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm || 8,
  },
  statsText: {
    alignItems: 'center',
  },
  statsValue: {
    marginBottom: SIZES.xs || 4,
  },
  statsLabel: {
    // Style will be applied via Typography
  },
  
  // Action Bento Styles
  actionCard: {
    overflow: 'hidden',
  },
  actionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  
  // Info Bento Styles
  infoBento: {
    minHeight: 120,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md || 16,
  },
  infoTitle: {
    flex: 1,
  },
  infoAction: {
    // Action button styles
  },
  infoContent: {
    flex: 1,
  },
});

export default BentoGrid;