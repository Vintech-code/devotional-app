import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { DevotionalMethod, DevotionalMethodId } from '../../types';
import { saveSelectedMethod, markOnboardingDone } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import MethodCard from '../../components/MethodCard/MethodCard';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './MethodSelection.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'MethodSelection'>;

const METHODS: DevotionalMethod[] = [
  {
    id: 'SOAP',
    name: 'SOAP Method',
    acronym: 'S.O.A.P',
    description:
      'Scripture, Observation, Application, and Prayer. A simple, effective way to journal your daily walk.',
    steps: ['Scripture', 'Observation', 'Application', 'Prayer'],
  },
  {
    id: 'MCPWA',
    name: 'MCPWA Method',
    acronym: 'M.C.P.W.A',
    description:
      'Message, Command, Promise, Warning, Application. Dive deeper into the character and instructions of God.',
    steps: ['Message', 'Command', 'Promise', 'Warning', 'Application'],
  },
  {
    id: 'SWORD',
    name: 'SWORD Method',
    acronym: 'S.W.O.R.D',
    description:
      'Scripture, Observation, Application, Response, Daily Living. Sharpen your faith through active response.',
    steps: ['Scripture', 'Word', 'Observation', 'Response', 'Daily Living'],
  },
];

const ICON_MAP: Record<DevotionalMethodId, string> = {
  SOAP: 'pencil',
  MCPWA: 'shield',
  SWORD: 'sword',
};

export default function MethodSelectionScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [selected, setSelected] = useState<DevotionalMethodId>('SOAP');
  const [loading, setLoading] = useState(false);
  const setSelectedMethod = useAppStore((s) => s.setSelectedMethod);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);

  async function handleStart() {
    setLoading(true);
    await saveSelectedMethod(selected);
    await markOnboardingDone();
    setSelectedMethod(selected);
    setOnboardingDone(true);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Badge */}
        <View style={styles.badge}>
          <Icon source="auto-fix" size={14} color={colors.textPrimary} />
          <Text style={styles.badgeText}>METHODS</Text>
        </View>

        <Text style={styles.title}>Deepen Your Faith</Text>
        <Text style={styles.subtitle}>
          Proven methods to sharpen your focus, understand, and apply God's Word daily.
        </Text>

        <Text style={styles.sectionLabel}>AVAILABLE METHODS</Text>

        {METHODS.map((method) => (
          <MethodCard
            key={method.id}
            icon={ICON_MAP[method.id]}
            title={method.name}
            badge={method.acronym}
            description={method.description}
            onPress={() => setSelected(method.id)}
            style={selected === method.id ? styles.selectedCard : undefined}
          />
        ))}

        {/* Hint */}
        <View style={styles.hintCard}>
          <Icon source="lightbulb-on" size={18} color={colors.textPrimary} />
          <Text style={styles.hintText}>
            You can switch between these methods anytime in your settings.
          </Text>
        </View>

        <PrimaryButton
          label="Start My Journey"
          rightIcon="chevron-right"
          onPress={handleStart}
          loading={loading}
          style={styles.cta}
        />

        <View style={styles.signInRow}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
