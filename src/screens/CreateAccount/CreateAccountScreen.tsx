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
import { useColors } from '../../theme';
import { saveUserProfile } from '../../services/storageService';
import { setActiveUid } from '../../services/storageService';
import { createUserWithEmail, friendlyAuthError } from '../../services/authService';
import { useAppStore } from '../../store/useAppStore';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './CreateAccount.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateAccount'>;

function getStrength(p: string): { label: string; pct: number; color: string } {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/[^a-zA-Z0-9]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (score <= 1) return { label: 'Weak',   pct: 0.25, color: '#ef4444' };
  if (score === 2) return { label: 'Fair',   pct: 0.50, color: '#f97316' };
  if (score === 3) return { label: 'Good',   pct: 0.75, color: '#eab308' };
  return               { label: 'Strong', pct: 1.00, color: '#22c55e' };
}

export default function CreateAccountScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    password: '',
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const setProfile = useAppStore((s) => s.setProfile);
  const strength   = getStrength(form.password);

  async function handleCreate() {
    if (!form.fullName || !form.email || !form.password || !form.agreedToTerms) return;
    setError(null);
    setLoading(true);
    try {
      const user = await createUserWithEmail(form.email, form.password, form.fullName);
      // Scope storage to this new user before writing profile
      setActiveUid(user.uid);
      const profile = {
        name: form.fullName,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        level: 1,
        levelTitle: 'Faith Seeker',
        completedCount: 0,
        dayStreak: 0,
      };
      await saveUserProfile(profile);
      setProfile(profile);
      navigation.navigate('AllSet', { name: form.fullName });
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof RegisterForm) {
    return (value: string) => setForm((f) => ({ ...f, [field]: value }));
  }

  const canSubmit = !!(form.fullName && form.email && form.password && form.agreedToTerms);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon source="chevron-left" size={28} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerBadge}>
          <Icon source="account-plus" size={14} color={colors.primary} />
          <Text style={styles.headerBadgeText}>NEW ACCOUNT</Text>
        </View>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join the community and begin your devotional journey.</Text>

        {/* Fields */}
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
          label="Password"
          value={form.password}
          onChangeText={update('password')}
          placeholder="Create a strong password"
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Strength bar */}
        {form.password.length > 0 && (
          <View style={styles.strengthRow}>
            <View style={styles.strengthTrack}>
              <View
                style={[
                  styles.strengthFill,
                  { width: `${strength.pct * 100}%` as unknown as number, backgroundColor: strength.color },
                ]}
              />
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
        )}

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setForm((f) => ({ ...f, agreedToTerms: !f.agreedToTerms }))}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, form.agreedToTerms && styles.checkboxActive]}>
            {form.agreedToTerms && <Icon source="check" size={12} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Error */}
        {error ? (
          <View style={styles.errorRow}>
            <Icon source="alert-circle-outline" size={15} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* CTA */}
        <PrimaryButton
          label="Create My Account"
          rightIcon="arrow-right"
          onPress={handleCreate}
          loading={loading}
          disabled={!canSubmit}
          style={styles.cta}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Already have an account?</Text>
          <View style={styles.dividerLine} />
        </View>

        <PrimaryButton
          label="Sign In"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={styles.signInBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
