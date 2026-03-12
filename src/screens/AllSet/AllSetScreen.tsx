import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from 'react-native-paper';

import type { AuthStackParamList } from '../../navigation/types';
import { useColors } from '../../theme';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles, SLIDE_COUNT } from './AllSet.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'AllSet'>;

const { width: W } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    key: 'bible',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lottie: require('../../../assets/animation/Reading3.json'),
    title:    "Read God's Word",
    subtitle: 'Browse all 66 books chapter by chapter — highlight verses and journal your insights as you read.',
    verse:    null as string | null,
    verseRef: null as string | null,
  },
  {
    key: 'journal',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lottie: require('../../../assets/animation/notes.json'),
    title:    'Journal Your Journey',
    subtitle: 'Deepen your walk with SOAP, MCPWA, SWORD, PRAY, ACTS or Sermon Notes — guided formats for real reflection.',
    verse:    null as string | null,
    verseRef: null as string | null,
  },
  {
    key: 'growth',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lottie: require('../../../assets/animation/progress.json'),
    title:    "You're All Set!",
    subtitle: 'Build a daily streak and watch your faith story unfold — one devotion at a time.',
    verse:    '"Your word is a lamp to my feet and a light to my path."' as string | null,
    verseRef: '— Psalm 119:105' as string | null,
  },
] satisfies { key: string; lottie: object; title: string; subtitle: string; verse: string | null; verseRef: string | null }[];

if (SLIDES.length !== SLIDE_COUNT) {
  // Guard to keep styles.rail width in sync
  throw new Error('SLIDE_COUNT in AllSet.styles.ts must match SLIDES.length');
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AllSetScreen({ navigation, route }: Props) {
  const colors         = useColors();
  const styles         = makeStyles(colors);
  const name           = route.params?.name;

  const [currentPage,  setCurrentPage]  = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const celebFired = useRef(false);

  // Horizontal slide rail
  const railX   = useRef(new Animated.Value(0)).current;
  // Notification slides down from above the screen
  const notifY  = useRef(new Animated.Value(-180)).current;

  // One Animated.Value per dot; index 0 starts at pill width (24), rest at 8
  const dotWidths = useRef(
    SLIDES.map((_, i) => new Animated.Value(i === 0 ? 24 : 8)),
  ).current;

  // ── Navigate to a page ───────────────────────────────────────────
  function goToPage(next: number) {
    const prev = currentPage;
    if (next === prev || next < 0 || next >= SLIDES.length) return;

    setCurrentPage(next);

    // Slide the rail
    Animated.timing(railX, {
      toValue:        -next * W,
      duration:       420,
      easing:         Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Spring the dots
    Animated.parallel([
      Animated.spring(dotWidths[prev], {
        toValue:              8,
        useNativeDriver:      false,
        overshootClamping:    true,
        restSpeedThreshold:   0.1,
        restDisplacementThreshold: 0.1,
      }),
      Animated.spring(dotWidths[next], {
        toValue:              24,
        useNativeDriver:      false,
        overshootClamping:    true,
        restSpeedThreshold:   0.1,
        restDisplacementThreshold: 0.1,
      }),
    ]).start();
  }

  // ── Advance to MethodSelection ─────────────────────────────────────────
  function handleEnter() {
    navigation.navigate('MethodSelection');
  }
  // ── Celebration ─────────────────────────────────────────────────
  function dismissNotif() {
    Animated.timing(notifY, {
      toValue:  -180,
      duration: 280,
      easing:   Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => setShowNotif(false));
  }

  useEffect(() => {
    if (currentPage === SLIDES.length - 1 && !celebFired.current) {
      celebFired.current = true;
      setShowCelebration(true);
      setShowNotif(true);
      Animated.spring(notifY, {
        toValue:          0,
        useNativeDriver:  true,
        tension:          68,
        friction:         10,
      }).start();
      // Auto-dismiss after 5 s
      setTimeout(() => dismissNotif(), 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);
  const isLast = currentPage === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* ── Top bar: name chip (left) + Skip (right) ─────────────────────── */}
      <View style={styles.topBar}>
        <View>
          {name ? <Text style={styles.nameTag}>👋 {name}</Text> : null}
        </View>
        <View>
          {!isLast && (
            <TouchableOpacity onPress={() => goToPage(SLIDES.length - 1)} hitSlop={12}>
              <Text style={styles.skipLabel}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Slide rail ───────────────────────────────────────────────────── */}
      <View style={styles.railClip}>
        <Animated.View style={[styles.rail, { transform: [{ translateX: railX }] }]}>
          {SLIDES.map((slide, index) => (
            <View key={slide.key} style={styles.slide}>

              {/* Lottie animation */}
              <LottieView
                source={slide.lottie}
                autoPlay
                loop
                style={styles.lottie}
              />

              {/* Title */}
              <Text style={styles.slideTitle}>{slide.title}</Text>

              {/* Name greeting on last slide */}
              {index === SLIDES.length - 1 && name ? (
                <Text style={styles.greetingText}>Welcome, {name}! 🎉</Text>
              ) : null}

              {/* Subtitle */}
              <Text style={styles.slideSub}>{slide.subtitle}</Text>

              {/* Verse card — last slide only */}
              {slide.verse ? (
                <View style={styles.verseCard}>
                  <Text style={styles.verseText}>{slide.verse}</Text>
                  {slide.verseRef ? (
                    <Text style={styles.verseRef}>{slide.verseRef}</Text>
                  ) : null}
                </View>
              ) : null}

            </View>
          ))}
        </Animated.View>
      </View>

      {/* ── Animated page dots ───────────────────────────────────────────── */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              i === currentPage ? styles.dotActive : styles.dotInactive,
              { width: dotWidths[i] },
            ]}
          />
        ))}
      </View>

      {/* ── CTA button ───────────────────────────────────────────────────── */}
      <View style={styles.ctaWrap}>
        {isLast ? (
          <PrimaryButton
            label="Begin My Journey"
            rightIcon="arrow-right"
            onPress={handleEnter}
          />
        ) : (
          <PrimaryButton
            label="Next"
            rightIcon="arrow-right"
            onPress={() => goToPage(currentPage + 1)}
          />
        )}
      </View>

      {/* ── Celebration Lottie — plays once on last slide ────────────────── */}
      {showCelebration && (
        <LottieView
          source={{ uri: 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json' }}
          autoPlay
          loop={false}
          style={StyleSheet.absoluteFillObject}
          onAnimationFinish={() => setShowCelebration(false)}
        />
      )}

      {/* ── Congratulations notification card — slides down from top ────── */}
      {showNotif && (
        <Animated.View
          style={[styles.celebNotif, { transform: [{ translateY: notifY }] }]}
        >
          <View style={styles.celebGlow}>
            <Text style={styles.celebEmoji}>🎉</Text>
          </View>
          <View style={styles.celebBody}>
            <Text style={styles.celebTitle}>Congratulations!</Text>
            <Text style={styles.celebSub}>
              Your devotional journey starts now.{'\n'}God has great things ahead for you!
            </Text>
          </View>
          <TouchableOpacity
            style={styles.celebDismiss}
            onPress={dismissNotif}
            activeOpacity={0.7}
          >
            <Icon source="close" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      )}

    </SafeAreaView>
  );
}
