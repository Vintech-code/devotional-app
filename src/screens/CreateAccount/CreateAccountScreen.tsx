import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { RegisterForm } from '../../types';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { saveUserProfile, markOnboardingDone } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { styles } from './CreateAccount.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateAccount'>;

const PASSWORD_RULES = [
  { key: '8chars', label: '8+ Characters', test: (p: string) => p.length >= 8 },
  { key: 'mixed', label: 'Mixed cases', test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { key: 'symbol', label: 'One symbol', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
  { key: 'number', label: 'Numbers', test: (p: string) => /[0-9]/.test(p) },
];

function getStrength(password: string): string {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return 'Weak';
  if (passed === 2) return 'Fair';
  if (passed === 3) return 'Good';
  return 'Strong';
}

export default function CreateAccountScreen({ navigation }: Props) {
  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    password: '',
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);

  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);
  const setProfile = useAppStore((s) => s.setProfile);

  const strength = getStrength(form.password);

  async function handleCreate() {
    if (!form.fullName || !form.email || !form.password || !form.agreedToTerms) return;
    setLoading(true);
    const profile = {
      name: form.fullName,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      level: 1,
      levelTitle: 'Faith Seeker',
      completedCount: 0,
      dayStreak: 0,
    };
    await saveUserProfile(profile);
    await markOnboardingDone();
    setProfile(profile);
    setOnboardingDone(true);
    setLoading(false);
  }

  function update(field: keyof RegisterForm) {
    return (value: string) => setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon source="chevron-left" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Join the Abide Community</Text>
        <Text style={styles.subtitle}>
          Begin your journey of daily devotion and spiritual growth today.
        </Text>

        <FormInput
          label="Full Name"
          value={form.fullName}
          onChangeText={update('fullName')}
          placeholder="Enter your full name"
          autoCapitalize="words"
        />

        <FormInput
          label="Email Address"
          value={form.email}
          onChangeText={update('email')}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormInput
          label="Secure Password"
          value={form.password}
          onChangeText={update('password')}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Strength */}
        {form.password.length > 0 && (
          <View style={styles.strengthWrap}>
            <Text style={styles.strengthLabel}>Security Strength</Text>
            <Text style={styles.strengthValue}>{strength}</Text>
          </View>
        )}

        {/* Rules */}
        <View style={styles.rulesGrid}>
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(form.password);
            return (
              <View key={rule.key} style={styles.ruleItem}>
                <Icon source={passed ? 'check-circle' : 'circle-outline'} size={16} color={passed ? Colors.success : Colors.textMuted} />
                <Text style={[styles.ruleText, passed && styles.ruleTextPassed]}>
                  {rule.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setForm((f) => ({ ...f, agreedToTerms: !f.agreedToTerms }))}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, form.agreedToTerms && styles.checkboxActive]}>
              {form.agreedToTerms && <Icon source="check" size={14} color={Colors.textOnPrimary} />}
          </View>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' and '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
            {'.'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.termsNote}>We value your privacy and spiritual journey.</Text>

        <PrimaryButton
          label="Create My Account"
          rightIcon="arrow-right"
          onPress={handleCreate}
          loading={loading}
          disabled={!form.fullName || !form.email || !form.password || !form.agreedToTerms}
          style={styles.cta}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ALREADY HAVE AN ACCOUNT?</Text>
          <View style={styles.dividerLine} />
        </View>

        <PrimaryButton
          label="Sign In to Abide"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={styles.signInBtn}
        />

        <View style={styles.secureRow}>
          <Icon source="lock" size={14} color={Colors.textMuted} />
          <Text style={styles.secureText}>ENCRYPTED & SECURE</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
