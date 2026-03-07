import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Appbar, Icon } from 'react-native-paper';
import { Colors } from '../../theme';

interface Props {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  rightIcon?: string;
}

export default function ScreenHeader({ title, onBack, rightLabel, onRightPress, rightIcon }: Props) {
  return (
    <Appbar.Header style={styles.header}>
      {onBack && <Appbar.BackAction onPress={onBack} color={Colors.textPrimary} />}
      <Appbar.Content title={title} titleStyle={styles.title} />
      {(rightLabel || rightIcon) && onRightPress && (
        <TouchableOpacity onPress={onRightPress} style={styles.rightBtn}>
          {rightIcon
            ? <Icon source={rightIcon} size={22} color={Colors.primary} />
            : <Text style={styles.rightText}>{rightLabel}</Text>
          }
        </TouchableOpacity>
      )}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rightBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rightText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
  },
});
