/**
 * src/components/VerseItem/VerseItem.tsx
 *
 * Single verse row — tap to highlight, shows verse number + text.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import type { BibleVerse } from '../../types/bible';

interface Props {
  verse: BibleVerse;
  isSelected: boolean;
  onPress: () => void;
}

export default function VerseItem({ verse, isSelected, onPress }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.row, isSelected && styles.rowSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.num, isSelected && styles.numSelected]}>
        {verse.verse}
      </Text>
      <Text style={[styles.text, isSelected && styles.textSelected]}>
        {verse.text}
      </Text>
    </TouchableOpacity>
  );
}

const makeStyles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.sm,
    marginVertical: 2,
    gap: 10,
  },
  rowSelected: {
    backgroundColor: c.primary + '18',
  },
  num: {
    width: 28,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    paddingTop: 3,
    textAlign: 'right',
    flexShrink: 0,
  },
  numSelected: { color: c.primary },
  text: {
    flex: 1,
    fontSize: Typography.size.md,
    lineHeight: 26,
    color: c.textPrimary,
  },
  textSelected: {
    color: c.textPrimary,
    fontWeight: Typography.weight.medium,
  },
});
