import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { useColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { saveUserProfile, markOnboardingDone, setActiveUid } from '../../services/storageService';
import {
  signInWithEmail,
  signInWithGoogle,
  friendlyAuthError,
} from '../../services/authService';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './Login.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);
  const setProfile = useAppStore((s) => s.setProfile);
  const setPendingAuthToast = useAppStore((s) => s.setPendingAuthToast);

  // ── Native Google Sign-In ────────────────────────────────────────────────
  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result) return; // user cancelled — do nothing
      const { user, isNewUser } = result;

      if (isNewUser) {
        // New account created via the login screen: walk through onboarding
        setActiveUid(user.uid);
        const name = user.displayName ?? user.email?.split('@')[0] ?? 'Friend';
        const profile = {
          name,
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          level: 1,
          levelTitle: 'Faith Seeker',
          completedCount: 0,
          dayStreak: 0,
          avatarUri: user.photoURL ?? undefined,
        };
        await saveUserProfile(profile);
        setProfile(profile);
        navigation.navigate('AllSet', { name });
      } else {
        // Existing account: show welcome toast; routing handled by hydrateForUser
        const name = user.displayName ?? user.email?.split('@')[0] ?? 'Friend';
        setPendingAuthToast(`Welcome back, ${name}! 👋`);
      }
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  // ── Email / Password Sign-In ──────────────────────────────────────────────
  async function handleLogin() {
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      // Scope storage to this user before any writes
      setActiveUid(user.uid);
      const name = user.displayName ?? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const profile = {
        name,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        level: 1,
        levelTitle: 'Faith Seeker',
        completedCount: 0,
        dayStreak: 0,
      };
      await saveUserProfile(profile);
      await markOnboardingDone();
      setProfile(profile);
      setPendingAuthToast(`Welcome back, ${name}! 👋`);
      setOnboardingDone(true);
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            source={require('../../../assets/logotransparent1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Continue your spiritual journey today</Text>

        {/* Email */}
        <FormInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password */}
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Remember me + Forgot */}
        <View style={styles.rememberRow}>
          <TouchableOpacity
            style={styles.rememberLeft}
            onPress={() => setRememberMe((v) => !v)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Icon source="check" size={14} color="#fff" />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          label="Log In"
          rightIcon="chevron-right"
          onPress={handleLogin}
          loading={loading}
          disabled={!email || !password}
        />

        {/* Error message */}
        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
            <Icon source="alert-circle-outline" size={16} color={colors.error ?? '#ef4444'} />
            <Text style={{ color: colors.error ?? '#ef4444', fontSize: 13, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity
          style={styles.googleBtn}
          activeOpacity={0.8}
          onPress={() => { void handleGoogleSignIn(); }}
          disabled={loading}
        >
          <Icon source="google" size={20} color={colors.textPrimary} />
          <Text style={styles.googleText}>Sign in with Google</Text>
        </TouchableOpacity>

        <View style={styles.secureRow}>
          <Icon source="lock" size={14} color={colors.textSecondary} />
          <Text style={styles.secureText}>Safe and secure authentication</Text>
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
