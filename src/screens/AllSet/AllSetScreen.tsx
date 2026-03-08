import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { useColors, Spacing } from '../../theme';
import { markOnboardingDone } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './AllSet.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'AllSet'>;

const FEATURES = [
  { icon: 'book-open-variant', text: 'Read the Bible chapter by chapter with highlights and verse journaling' },
  { icon: 'notebook-edit-outline', text: 'Record devotionals using SOAP, MCPWA, SWORD or Sermon Notes' },
  { icon: 'fire', text: 'Build a daily streak and track your spiritual growth over time' },
];

export default function AllSetScreen({ route }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [loading, setLoading] = useState(false);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);
  const name = route.params?.name;

  async function handleEnter() {
    setLoading(true);
    await markOnboardingDone();
    setOnboardingDone(true);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>

        {/* Check icon */}
        <View style={styles.iconRing}>
          <Icon source="check-circle-outline" size={52} color={colors.primary} />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>You're All Set!</Text>
        {name ? (
          <Text style={styles.nameText}>Welcome, {name}</Text>
        ) : null}
        <Text style={styles.subtitle}>
          Your devotional journey begins today. Each day is a new opportunity to know God more deeply.
        </Text>

        {/* Feature rows */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.icon} style={styles.featureRow}>
              <Icon source={f.icon} size={22} color={colors.primary} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Verse callout */}
        <View style={styles.verseCard}>
          <Text style={styles.verseText}>
            "Your word is a lamp to my feet and a light to my path."
          </Text>
          <Text style={styles.verseRef}>— Psalm 119:105</Text>
        </View>

        <View style={styles.spacer} />

        {/* CTA */}
        <PrimaryButton
          label="Open My Bible"
          rightIcon="arrow-right"
          onPress={handleEnter}
          loading={loading}
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
