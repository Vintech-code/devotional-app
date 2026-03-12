import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface Props {
  onComplete: () => void;
}

// --- AnimatedSplash ---
export default function AnimatedSplash({ onComplete }: Props) {
  // --- animated values ---
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoScale        = useRef(new Animated.Value(0.45)).current;
  const logoOpacity      = useRef(new Animated.Value(0)).current;
  const logoGlow         = useRef(new Animated.Value(0)).current;
  const nameOpacity      = useRef(new Animated.Value(0)).current;
  const nameTranslateY   = useRef(new Animated.Value(12)).current;
  const lineScaleX       = useRef(new Animated.Value(0)).current;
  const taglineOpacity   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide the native splash as soon as this component is ready to paint.
    void SplashScreen.hideAsync();

    const ease = (d: number) => Easing.bezier(0.25, 0.46, 0.45, 0.94)(d);
    const easeIn = (d: number) => Easing.in(Easing.quad)(d);

    Animated.sequence([
      // Phase 1 – logo springs in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 600,
          easing: ease,
          useNativeDriver: true,
        }),
      ]),

      // Phase 2 – app name slides up and fades in
      Animated.delay(20),
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 420,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.timing(nameTranslateY, {
          toValue: 0,
          duration: 420,
          easing: ease,
          useNativeDriver: true,
        }),
      ]),

      // Phase 3 – accent line sweeps from center
      Animated.delay(100),
      Animated.timing(lineScaleX, {
        toValue: 1,
        duration: 400,
        easing: ease,
        useNativeDriver: true,
      }),

      // Phase 4 – tagline fades in
      Animated.delay(80),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        easing: ease,
        useNativeDriver: true,
      }),

      // Phase 5 – hold for readability
      Animated.delay(950),

      // Phase 6 – graceful exit
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 420,
        easing: easeIn,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, []);

  // Subtle pulsing glow ring rendered via opacity on a tinted circle
  const glowOpacity = logoGlow.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.18, 0.08],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Logo area */}
      <View style={styles.logoSection}>
        {/* Rounded-rect container clips white corners to look like an app icon */}
        <Animated.View
          style={[
            styles.logoIconWrapper,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../../assets/appicon.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* App name + accent line */}
      <Animated.View
        style={{
          opacity: nameOpacity,
          transform: [{ translateY: nameTranslateY }],
          alignItems: 'center',
        }}
      >
        <Text style={styles.appName}>DevoVerse</Text>
      </Animated.View>

      {/* Teal accent underline sweeps in */}
      <Animated.View
        style={[styles.accentLine, { transform: [{ scaleX: lineScaleX }] }]}
      />

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Your Devotional Journey Starts Here
      </Animated.Text>

      {/* Bottom wordmark */}
      <Animated.Text style={[styles.wordmark, { opacity: taglineOpacity }]}>
        powered by Scripture
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#428a9b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#F0F0F0',
    letterSpacing: 2,
    marginBottom: 6,
  },
  accentLine: {
    width: 180,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#428a9b',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888888',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  wordmark: {
    position: 'absolute',
    bottom: 48,
    fontSize: 11,
    fontWeight: '400',
    color: '#444444',
    letterSpacing: 1,
  },
});
