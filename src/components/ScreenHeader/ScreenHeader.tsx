import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Appbar, Icon } from 'react-native-paper';
import { useColors } from '../../theme';

interface Props {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  rightIcon?: string;
  prominentTitle?: boolean;
}

export default function ScreenHeader({ title, onBack, rightLabel, onRightPress, rightIcon, prominentTitle }: Props) {
  const colors = useColors();
  const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 0,
  },
  title: {
    fontSize: prominentTitle ? 20 : 17,
    fontWeight: prominentTitle ? '700' : '600',
    color: colors.textPrimary,
  },
  rightBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rightText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
  },
});
  return (
    <Appbar.Header style={styles.header}>
      {onBack && <Appbar.BackAction onPress={onBack} color={colors.textPrimary} />}
      <Appbar.Content title={title} titleStyle={styles.title} />
      {(rightLabel || rightIcon) && onRightPress && (
        <TouchableOpacity onPress={onRightPress} style={styles.rightBtn}>
          {rightIcon
            ? <Icon source={rightIcon} size={22} color={colors.primary} />
            : <Text style={styles.rightText}>{rightLabel}</Text>
          }
        </TouchableOpacity>
      )}
    </Appbar.Header>
  );
}

