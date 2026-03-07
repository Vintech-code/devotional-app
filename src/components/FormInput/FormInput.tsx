import React, { useState } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { TextInput as PaperInput } from 'react-native-paper';
import { useColors, Spacing } from '../../theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
}

export default function FormInput({ label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  maxLength,
}: Props) {
  const colors = useColors();
  const styles = StyleSheet.create({
  input: {
    marginBottom: Spacing.md,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 120,
  },
});
  const [secure, setSecure] = useState(secureTextEntry);

  return (
    <PaperInput
      label={label || ' '}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secure}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      numberOfLines={multiline ? numberOfLines : 1}
      maxLength={maxLength}
      mode="outlined"
      outlineColor={colors.border}
      activeOutlineColor={colors.primary}
      right={
        secureTextEntry
          ? <PaperInput.Icon
              icon={secure ? 'eye-off' : 'eye'}
              onPress={() => setSecure((s) => !s)}
              color={colors.textMuted}
            />
          : undefined
      }
      style={[styles.input, multiline && styles.multiline, style]}
      contentStyle={inputStyle}
      textColor={colors.textPrimary}
      placeholderTextColor={colors.textMuted}
    />
  );
}
