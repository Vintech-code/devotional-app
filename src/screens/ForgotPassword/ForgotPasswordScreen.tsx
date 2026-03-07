import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './ForgotPassword.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!email) return;
    setSent(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon source="chevron-left" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Lock icon */}
        <View style={styles.iconWrap}>
          <Icon source="lock-alert" size={40} color={colors.textPrimary} />
        </View>

        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>
          Enter the email associated with your account and we'll send instructions to reset it.
        </Text>

        <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
        <FormInput
          label=""
          value={email}
          onChangeText={setEmail}
          placeholder="clark@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.inputFull}
        />

        {sent && (
          <View style={styles.sentBanner}>
            <Icon source="check-circle" size={20} color={colors.success} />
            <Text style={styles.sentText}>Instructions sent! Check your inbox.</Text>
          </View>
        )}

        <PrimaryButton
          label="Send Instructions"
          onPress={handleSend}
          disabled={!email}
          style={styles.sendBtn}
        />

        {/* Tip */}
        <View style={styles.tipCard}>
          <Icon source="information" size={16} color={colors.textSecondary} />
          <Text style={styles.tipText}>
            Can't find the email? Check your spam folder or wait a few minutes before trying again.
          </Text>
        </View>

        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Back to Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpLink}>
          <Text style={styles.helpText}>Need more help? Contact support</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
