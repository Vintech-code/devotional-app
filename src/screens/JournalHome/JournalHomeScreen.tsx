import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { makeStyles } from './JournalHome.styles';

type Nav = NativeStackNavigationProp<JournalStackParamList>;

interface JournalOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  screen: keyof JournalStackParamList;
}

const OPTIONS: JournalOption[] = [
  {
    id: 'soap',
    title: 'SOAP Journal',
    subtitle: 'Scripture, Observation, Application, Prayer',
    icon: 'pencil',
    screen: 'SoapJournal',
  },
  {
    id: 'mcpwa',
    title: 'MCPWA Journal',
    subtitle: 'Message, Command, Promise, Warning, Application',
    icon: 'shield',
    screen: 'McpwaJournal',
  },
  {
    id: 'sword',
    title: 'SWORD Journal',
    subtitle: 'Scripture, Word, Observation, Response, Daily Living',
    icon: 'sword',
    screen: 'SwordJournal',
  },
  {
    id: 'sermon',
    title: 'Sermon Notes',
    subtitle: 'Capture key takeaways from Sunday messages',
    icon: 'microphone',
    screen: 'SermonNotes',
  },
];

export default function JournalHomeScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const soapEntries = useAppStore((s) => s.soapEntries);
  const mcpwaEntries = useAppStore((s) => s.mcpwaEntries);
  const swordEntries = useAppStore((s) => s.swordEntries);
  const sermonNotes = useAppStore((s) => s.sermonNotes);
  const profile = useAppStore((s) => s.profile);

  const totalEntries = soapEntries.length + mcpwaEntries.length + swordEntries.length + sermonNotes.length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Journal</Text>
        <Text style={styles.subtitle}>Record your spiritual journey</Text>

        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate(opt.screen as 'SoapJournal', {})}
          >
            <View style={styles.iconWrap}>
              <Icon source={opt.icon} size={22} color={colors.textPrimary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{opt.title}</Text>
              <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
            </View>
            <Icon source="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Quick stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>This Month</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{totalEntries}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{profile?.dayStreak ?? 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
