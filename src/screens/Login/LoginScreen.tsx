import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { useColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { saveUserProfile, markOnboardingDone } from '../../services/storageService';
import {
  signInWithEmail,
  Google,
  GOOGLE_CONFIG,
  signInWithGoogleIdToken,
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

  // ── Google Sign-In via expo-auth-session ─────────────────────────────────
  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest(GOOGLE_CONFIG);

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = googleResponse.params?.id_token;
    if (!idToken) return;
    setLoading(true);
    signInWithGoogleIdToken(idToken)
      .then(async (user) => {
        const name = user.displayName ?? user.email?.split('@')[0] ?? 'Friend';
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
        setOnboardingDone(true);
      })
      .catch((e) => setError(friendlyAuthError(e)))
      .finally(() => setLoading(false));
  }, [googleResponse]);

  // ── Email / Password Sign-In ──────────────────────────────────────────────
  async function handleLogin() {
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
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
            source={require('../../../assets/logotransparent.png')}
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
          onPress={() => { void promptGoogleAsync(); }}
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
