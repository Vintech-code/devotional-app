import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { List, Icon } from 'react-native-paper';
import { useColors, Spacing, Radius } from '../../theme';

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
  iconBg,
}: Props) {
  const colors = useColors();
  const bg = iconBg ?? colors.surfaceAlt;
  const styles = StyleSheet.create({
    row: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
  });
  return (
    <List.Item
      title={title}
      description={subtitle ?? undefined}
      onPress={onPress}
      style={[styles.row, style]}
      titleStyle={styles.title}
      descriptionStyle={styles.subtitle}
      left={() => (
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Icon source={icon} size={20} color={colors.textPrimary} />
        </View>
      )}
      right={
        rightElement
          ? () => <>{rightElement}</>
          : onPress
          ? () => <List.Icon icon="chevron-right" color={colors.textMuted} />
          : undefined
      }
    />
  );
}

