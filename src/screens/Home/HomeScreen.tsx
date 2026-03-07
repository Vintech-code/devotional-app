import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Colors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { MainTabParamList } from '../../navigation/types';
import { saveSelectedMethod } from '../../services/storageService';
import { getDailyVerse } from '../../services/dailyVerseService';
import { styles } from './Home.styles';

type Nav = BottomTabNavigationProp<MainTabParamList>;

const GUIDED_METHODS = [
  { id: 'SOAP',  icon: 'pencil',            label: 'SOAP'  },
  { id: 'MCPWA', icon: 'shield',            label: 'MCPWA' },
  { id: 'SWORD', icon: 'sword',             label: 'SWORD' },
  { id: 'BIBLE', icon: 'book-open-variant', label: 'BIBLE' },
  { id: 'SERM',  icon: 'microphone',        label: 'SERM'  },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const profile = useAppStore((s) => s.profile);
  const selectedMethod = useAppStore((s) => s.selectedMethod);
  const setSelectedMethod = useAppStore((s) => s.setSelectedMethod);
  const verse = getDailyVerse();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const nextSession = (() => {
    const hour = new Date().getHours();
    if (hour < 9)  return 'Morning Reflection';
    if (hour < 17) return 'Afternoon Devotional';
    return 'Evening Reflection';
  })();

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  async function handleMethodPress(methodId: string) {
    if (methodId === 'BIBLE') {
      navigation.navigate('Bible');
      return;
    }

    if (methodId === 'SERM') {
      navigation.navigate('Journal');
      return;
    }

    const nextMethod = methodId as 'SOAP' | 'MCPWA' | 'SWORD';
    setSelectedMethod(nextMethod);
    await saveSelectedMethod(nextMethod);
    navigation.navigate('Journal');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* â”€â”€â”€ Header â”€â”€â”€ */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingLabel}>{greeting},</Text>
          <Text style={styles.greetingName}>{profile?.name ?? 'Friend'}</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Icon source="bell" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* â”€â”€â”€ Today's Mission â”€â”€â”€ */}
        <Text style={styles.sectionLabel}>TODAY'S MISSION</Text>
        <TouchableOpacity
          style={styles.missionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Journal')}
        >
          <View style={styles.missionLeft}>
            <Text style={styles.missionTitle}>Start Daily Devotional</Text>
            <Text style={styles.missionSub}>{selectedMethod} Method {'\u00B7'} 15 min</Text>
          </View>
          <View style={styles.missionArrow}>
            <Icon source="chevron-right" size={18} color={Colors.textOnPrimary} />
          </View>
        </TouchableOpacity>

        {/* â”€â”€â”€ Guided Methods â”€â”€â”€ */}
        <Text style={styles.sectionLabel}>GUIDED METHODS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.methodsRow}
        >
          {GUIDED_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.methodItem}
              activeOpacity={0.8}
              onPress={() => {
                void handleMethodPress(m.id);
              }}
            >
              <View style={[
                styles.methodCircle,
                m.id === selectedMethod && styles.methodCircleActive,
              ]}>
                <Icon source={m.icon} size={22} color={m.id === selectedMethod ? Colors.textOnPrimary : Colors.textPrimary} />
              </View>
              <Text style={[
                styles.methodLabel,
                m.id === selectedMethod && styles.methodLabelActive,
              ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* â”€â”€â”€ Inspiration â”€â”€â”€ */}
        <Text style={styles.sectionLabel}>INSPIRATION</Text>
        <View style={styles.verseCard}>
          <View style={styles.verseMeta}>
            <Text style={styles.breadTitle}>Daily Bread</Text>
            <Text style={styles.breadDate}>{today}</Text>
          </View>
          <Text style={styles.verseText}>
            {`"${verse.text}"`}
          </Text>
          <View style={styles.verseRefRow}>
            <Text style={styles.verseRef}>{verse.reference}</Text>
            <Icon source="heart-outline" size={16} color={Colors.accent} />
          </View>
        </View>

        {/* â”€â”€â”€ My Progress â”€â”€â”€ */}
        <Text style={styles.sectionLabel}>MY PROGRESS</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <Icon source="fire" size={26} color={Colors.primary} />
            <Text style={styles.progressNum}>{profile?.dayStreak ?? 0}</Text>
            <Text style={styles.progressLabel}>DAY STREAK</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <Icon source="book-multiple" size={26} color={Colors.primary} />
            <Text style={styles.progressNum}>{profile?.completedCount ?? 0}</Text>
            <Text style={styles.progressLabel}>COMPLETED</Text>
          </View>
        </View>

        {/* â”€â”€â”€ Next Session â”€â”€â”€ */}
        <Text style={styles.sectionLabel}>NEXT SESSION</Text>
        <TouchableOpacity
          style={styles.nextCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Journal')}
        >
          <View style={styles.nextIconWrap}>
            <Icon source="moon-waning-crescent" size={24} color={Colors.primary} />
          </View>
          <View style={styles.nextBody}>
            <Text style={styles.nextTitle}>{nextSession}</Text>
            <Text style={styles.nextSub}>Keep your streak going!</Text>
          </View>
          <Icon source="chevron-right" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
