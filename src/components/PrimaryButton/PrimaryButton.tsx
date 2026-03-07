import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { useColors } from '../../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  rightIcon?: string;
}

export default function PrimaryButton({ label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  rightIcon,
}: Props) {
  const colors = useColors();
  const mode =
    variant === 'outline' ? 'outlined' :
    variant === 'ghost'   ? 'text'     : 'contained';

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      contentStyle={{ height: 52, flexDirection: 'row-reverse' }}
      labelStyle={[{ fontSize: 15, fontWeight: '600', letterSpacing: 0.4 }, textStyle]}
      style={[{ borderRadius: 12, width: '100%' }, style]}
      buttonColor={variant === 'primary' ? colors.primary : undefined}
      textColor={variant === 'primary' ? colors.textOnPrimary : colors.primary}
      icon={rightIcon ?? undefined}
    >
      {label}
    </Button>
  );
}
