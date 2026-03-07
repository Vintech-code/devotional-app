import React, { useRef } from 'react'; // ? import useRef
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './Welcome.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  // ? useRef must be here, inside the component
  const animationRef = useRef<LottieView>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Icon
              source="book-open-variant"
              size={36}
              color={colors.textPrimary}
            />
          </View>
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

        <View style={styles.spacer} />

        {/* CTA */}
        <PrimaryButton
          label="Start My Journey"
          rightIcon="chevron-right"
          onPress={() => navigation.navigate('MethodSelection')}
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
      </ScrollView>
    </SafeAreaView>
  );
}