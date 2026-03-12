import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Icon } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { useColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import AppToast from '../../components/AppToast/AppToast';
import { makeStyles } from './Welcome.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const animationRef = useRef<LottieView>(null);
  const pendingAuthToast      = useAppStore((s) => s.pendingAuthToast);
  const clearPendingAuthToast = useAppStore((s) => s.clearPendingAuthToast);
  const [authSnackVisible, setAuthSnackVisible] = useState(false);

  useEffect(() => {
    if (pendingAuthToast) setAuthSnackVisible(true);
  }, [pendingAuthToast]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
          <Image
            source={require('../../../assets/logotransparent1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Grow daily in</Text>
        <Text style={styles.headlineAccent}>God's Word</Text>
        <Text style={styles.subtitle}>
          Experience peace through structured devotionals{'\n'}and biblical meditation.
        </Text>

        {/* Lottie illustration */}
        <LottieView
          ref={animationRef}
          source={require('../../../assets/animation/Reading2.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
          onAnimationFinish={() => {
            setTimeout(() => {
              animationRef.current?.play(); // loops after 5 seconds
            }, 5000);
          }}
        />

        {/* Page indicator */}
        <View style={styles.pageIndicator}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* CTA */}
        <PrimaryButton
          label="Start My Journey"
          rightIcon="chevron-right"
          onPress={() => navigation.navigate('CreateAccount')}
          style={styles.cta}
        />

        <Text style={styles.signInText}>
          Already have an account?{' '}
          <Text
            style={styles.signInLink}
            onPress={() => navigation.navigate('Login')}
          >
            Log in
          </Text>
        </Text>

        {/* Credits */}
        <Text style={styles.credits}>Made with ♥ by Clark Vincent Cabatuan</Text>

        {/* Social icon buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}
            onPress={() => void Linking.openURL('https://www.facebook.com/search/top?q=Clark%20Vincent%20Cabatuan')}
            activeOpacity={0.8}
          >
            <Icon source="facebook" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: '#EA4335' }]}
            onPress={() => void Linking.openURL('mailto:clarkcabatuan09@gmail.com')}
            activeOpacity={0.8}
          >
            <Icon source="gmail" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: '#E1306C' }]}
            onPress={() => void Linking.openURL('https://instagram.com/it_vinceee')}
            activeOpacity={0.8}
          >
            <Icon source="instagram" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppToast
        visible={authSnackVisible}
        emoji="👋"
        title="Signed out"
        message={pendingAuthToast ?? ''}
        onDismiss={() => {
          setAuthSnackVisible(false);
          clearPendingAuthToast();
        }}
      />
    </SafeAreaView>
  );
}