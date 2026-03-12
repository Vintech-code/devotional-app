/**
 * AppToast — top-sliding notification card that mirrors the AllSet celebration card.
 *
 * Usage:
 *   <AppToast
 *     visible={toastVisible}
 *     emoji="📖"
 *     title="Devotional saved!"
 *     message="Your entry has been saved to Journal History."
 *     onDismiss={() => setToastVisible(false)}
 *   />
 *
 * Place it as the LAST child inside your screen's SafeAreaView so it renders on top.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import { useColors } from '../../theme';
import { Spacing, Radius, Typography } from '../../theme';
import type { ColorScheme } from '../../theme';

type Props = {
  visible:   boolean;
  emoji?:    string;
  title:     string;
  message:   string;
  onDismiss: () => void;
  duration?: number;   // ms before auto-dismiss (default 3 000)
};

export default function AppToast({
  visible,
  emoji    = '✅',
  title,
  message,
  onDismiss,
  duration = 3000,
}: Props) {
  const colors     = useColors();
  const styles     = makeStyles(colors);
  const translateY = useRef(new Animated.Value(-160)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function slideOut(callback?: () => void) {
    clearTimer();
    Animated.timing(translateY, {
      toValue:         -160,
      duration:        260,
      easing:          Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => callback?.());
  }

  useEffect(() => {
    if (visible) {
      // Reset position before spring-in (handles repeated shows)
      translateY.setValue(-160);
      Animated.spring(translateY, {
        toValue:         0,
        useNativeDriver: true,
        tension:         68,
        friction:        10,
      }).start();
      clearTimer();
      timerRef.current = setTimeout(() => slideOut(onDismiss), duration);
    } else {
      slideOut();
    }
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Animated.View
      // @ts-ignore — pointerEvents is valid on Animated.View in RN
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.wrap, { transform: [{ translateY }] }]}
    >
      {/* Left emoji circle */}
      <View style={styles.glow}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </View>

      {/* Close button */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => slideOut(onDismiss)}
        activeOpacity={0.7}
        hitSlop={8}
      >
        <Icon source="close" size={14} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    wrap: {
      position:        'absolute',
      top:             Spacing.md,
      left:            Spacing.lg,
      right:           Spacing.lg,
      backgroundColor: c.surface,
      borderRadius:    Radius.xl,
      padding:         Spacing.md,
      flexDirection:   'row',
      alignItems:      'center',
      gap:             Spacing.md,
      shadowColor:     c.primary,
      shadowOffset:    { width: 0, height: 6 },
      shadowOpacity:   0.28,
      shadowRadius:    18,
      elevation:       14,
      borderWidth:     1,
      borderColor:     c.border,
      zIndex:          999,
    },
    glow: {
      width:           48,
      height:          48,
      borderRadius:    24,
      backgroundColor: 'rgba(66,138,155,0.14)',
      borderWidth:     1,
      borderColor:     'rgba(66,138,155,0.35)',
      alignItems:      'center',
      justifyContent:  'center',
    },
    emojiText: { fontSize: 22 },
    body:      { flex: 1 },
    title: {
      fontSize:    Typography.size.md,
      fontWeight:  Typography.weight.bold,
      color:       c.textPrimary,
      letterSpacing: 0.2,
    },
    message: {
      fontSize:   Typography.size.xs,
      color:      c.textSecondary,
      marginTop:  3,
      lineHeight: Typography.size.xs * 1.5,
    },
    closeBtn: {
      width:           26,
      height:          26,
      borderRadius:    13,
      backgroundColor: c.surfaceAlt,
      alignItems:      'center',
      justifyContent:  'center',
    },
  });
