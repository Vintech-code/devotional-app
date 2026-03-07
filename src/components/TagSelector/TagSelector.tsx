import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useColors, Spacing } from '../../theme';

interface Props {
  tags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagSelector({ tags, activeTags, onToggle }: Props) {
  const colors = useColors();
  const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderRadius: 99,
  },
  chipActive: {
    backgroundColor: colors.tagActive,
  },
  chipInactive: {
    backgroundColor: colors.tagInactive,
  },
  textActive: {
    color: colors.tagTextActive,
  },
  textInactive: {
    color: colors.tagTextInactive,
  },
});
  return (
    <View style={styles.container}>
      {tags.map((tag) => {
        const active = activeTags.includes(tag);
        return (
          <Chip
            key={tag}
            selected={active}
            onPress={() => onToggle(tag)}
            compact
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
            textStyle={active ? styles.textActive : styles.textInactive}
          >
            # {tag}
          </Chip>
        );
      })}
    </View>
  );
}

