import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card, Icon } from 'react-native-paper';
import { useColors, Typography, Spacing, Radius } from '../../theme';

interface Props {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export default function MethodCard({ icon, title, description, badge, onPress, style }: Props) {
  const colors = useColors();
  const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  body: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: colors.textPrimary,
  },
  badge: {
    fontSize: Typography.size.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  description: {
    fontSize: Typography.size.sm,
    color: colors.textSecondary,
    lineHeight: Typography.size.sm * 1.5,
  },
});
  return (
    <Card style={[styles.card, style]} onPress={onPress} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.iconWrap}>
          <Icon source={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badge ? <Text style={styles.badge}>{badge}</Text> : null}
          </View>
          <Text style={styles.description}>{description}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

