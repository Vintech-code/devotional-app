import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { Colors, Spacing } from '../../theme';

interface Props {
  tags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagSelector({ tags, activeTags, onToggle }: Props) {
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
    backgroundColor: Colors.tagActive,
  },
  chipInactive: {
    backgroundColor: Colors.tagInactive,
  },
  textActive: {
    color: Colors.tagTextActive,
  },
  textInactive: {
    color: Colors.tagTextInactive,
  },
});
