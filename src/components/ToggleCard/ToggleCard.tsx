import React from 'react';
import { View, Text, Switch, StyleSheet, ViewStyle } from 'react-native';
import { List, Icon } from 'react-native-paper';
import { Colors, Typography, Spacing, Radius } from '../../theme';

interface Props {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  style?: ViewStyle;
}

export default function ToggleCard({ icon, title, description, value, onValueChange, style }: Props) {
  return (
    <List.Item
      title={title}
      description={description}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      style={[styles.card, style]}
      left={() => (
        <View style={styles.iconWrap}>
          <Icon source={icon} size={22} color={Colors.textOnPrimary} />
        </View>
      )}
      right={() => (
        <Switch
          value={Boolean(value)}
          onValueChange={onValueChange}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.surface}
          style={styles.switch}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switch: { alignSelf: 'center' },
});
