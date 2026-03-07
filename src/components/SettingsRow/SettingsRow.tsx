import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { List, Icon } from 'react-native-paper';
import { Colors, Spacing, Radius } from '../../theme';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  iconBg?: string;
}

export default function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  style,
  iconBg = Colors.surfaceAlt,
}: Props) {
  return (
    <List.Item
      title={title}
      description={subtitle ?? undefined}
      onPress={onPress}
      style={[styles.row, style]}
      titleStyle={styles.title}
      descriptionStyle={styles.subtitle}
      left={() => (
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Icon source={icon} size={20} color={Colors.textPrimary} />
        </View>
      )}
      right={
        rightElement
          ? () => <>{rightElement}</>
          : onPress
          ? () => <List.Icon icon="chevron-right" color={Colors.textMuted} />
          : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: Spacing.md,
  },
  title: { color: Colors.textPrimary },
  subtitle: { color: Colors.textSecondary },
});
