import React from 'react';
import { View, Text, Switch, StyleSheet, ViewStyle } from 'react-native';
import { List, Icon } from 'react-native-paper';
import { useColors, Typography, Spacing, Radius } from '../../theme';

interface Props {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  style?: ViewStyle;
}

export default function ToggleCard({ icon, title, description, value, onValueChange, style }: Props) {
  const colors = useColors();
  const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: colors.textPrimary,
  },
  description: {
    fontSize: Typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  switch: { alignSelf: 'center' },
});
  return (
    <List.Item
      title={title}
      description={description}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      style={[styles.card, style]}
      left={() => (
        <View style={styles.iconWrap}>
          <Icon source={icon} size={22} color={colors.textOnPrimary} />
        </View>
      )}
      right={() => (
        <Switch
          value={Boolean(value)}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
          style={styles.switch}
        />
      )}
    />
  );
}

