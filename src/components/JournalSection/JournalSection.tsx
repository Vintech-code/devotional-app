import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { Colors, Typography, Spacing, Radius } from '../../theme';

interface Props {
  letter: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function JournalSection({ letter, title, subtitle, children, style }: Props) {
  return (
    <Card style={[styles.card, style]} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.letterBox}>
            <Text style={styles.letter}>{letter}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.content}>{children}</View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  letterBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  letter: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  content: {
    marginTop: Spacing.xs,
  },
});
