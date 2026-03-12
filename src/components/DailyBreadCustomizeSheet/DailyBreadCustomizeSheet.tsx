/**
 * DailyBreadCustomizeSheet
 * Bottom-sheet modal that lets the user personalise the Daily Bread card:
 *   • Background – prebuilt presets, solid colour or a photo from their gallery
 *   • Text       – font family and font size for the verse
 */
import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  Image, Platform, Alert, StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from 'react-native-paper';

import { useColors, Spacing, Radius, Typography } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { DailyBreadCustomization, VerseFontKey } from '../../types';

// ─── Assets (must match HomeScreen's list) ───────────────────────────────────
export const PRESET_IMAGES = [
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../assets/dailybread/Create_a_serene_minimal_and_cinematic_landscape_background_for_a_devotional_ap_20260308075354_01.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../assets/dailybread/Create_a_serene_minimal_and_cinematic_landscape_background_for_a_devotional_ap_20260308075354_02.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../assets/dailybread/Create_a_serene_minimal_and_cinematic_landscape_background_for_a_devotional_ap_20260308075356_03.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../assets/dailybread/Create_a_serene_minimal_landscape_background_for_a_devotional_app_called_Daily_20260308075100_01.png') as number,
];

// ─── Colour swatches ─────────────────────────────────────────────────────────
const COLOR_SWATCHES = [
  '#0a0a0f', '#1a1a2e', '#16213e', '#0f3460',
  '#1a3a2a', '#0d4d3a', '#1e3a5f', '#2d1b69',
  '#1b1b2f', '#3d1a5e', '#4a1942', '#2e1a0a',
  '#1c1c1e', '#000000', '#2c2f33', '#37251a',
  '#fefcf3', '#f5f0e8', '#e8f5e9', '#e3f2fd',
];

// ─── Font options ─────────────────────────────────────────────────────────────
export const VERSE_FONT_OPTIONS: { key: VerseFontKey; label: string; fontFamily: string }[] = [
  { key: 'serif',   label: 'Georgia',  fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  { key: 'sans',    label: 'Clean',    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif' },
  { key: 'mono',    label: 'Mono',     fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  { key: 'elegant', label: 'Palatino', fontFamily: Platform.OS === 'ios' ? 'Palatino' : 'serif' },
];

/** Resolve the actual font-family string from a stored key. */
export function resolveFontFamily(key: VerseFontKey): string {
  return VERSE_FONT_OPTIONS.find((o) => o.key === key)?.fontFamily
    ?? (Platform.OS === 'ios' ? 'Georgia' : 'serif');
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
}

type Tab = 'background' | 'text';

const MIN_FONT = 12;
const MAX_FONT = 22;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DailyBreadCustomizeSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const custom = useAppStore((s) => s.dailyBreadCustom);
  const setDailyBreadCustom = useAppStore((s) => s.setDailyBreadCustom);

  // Local draft — only committed on "Apply"
  const [draft, setDraft] = useState<DailyBreadCustomization>(custom);
  const [tab, setTab] = useState<Tab>('background');

  // Reset draft every time the sheet opens
  React.useEffect(() => {
    if (visible) setDraft(custom);
  }, [visible]);

  function update(patch: Partial<DailyBreadCustomization>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo access in Settings to use a custom background.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.85,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets[0]?.uri) {
      update({ bgType: 'photo', bgPhotoUri: result.assets[0].uri });
    }
  }

  function apply() {
    setDailyBreadCustom(draft);
    onClose();
  }

  const s = makeStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>Customize Daily Bread</Text>

          {/* ─── Tab bar ─── */}
          <View style={s.tabBar}>
            {(['background', 'text'] as Tab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.tabBtn, tab === t && s.tabBtnActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                  {t === 'background' ? 'Background' : 'Text'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
            {tab === 'background' && (
              <>
                {/* ── Preset images ── */}
                <Text style={s.sectionLabel}>PRESET IMAGES</Text>
                <View style={s.presetRow}>
                  {/* Rotating daily option */}
                  <TouchableOpacity
                    style={[
                      s.presetThumb,
                      draft.bgType === 'preset' && draft.presetIndex === -1 && s.presetThumbActive,
                    ]}
                    onPress={() => update({ bgType: 'preset', presetIndex: -1 })}
                  >
                    <Image source={PRESET_IMAGES[0]} style={s.presetImg} resizeMode="cover" />
                    <View style={s.presetRotateBadge}>
                      <Icon source="rotate-right" size={12} color="#fff" />
                    </View>
                    <Text style={s.presetLabel}>Auto</Text>
                  </TouchableOpacity>

                  {PRESET_IMAGES.map((src, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        s.presetThumb,
                        draft.bgType === 'preset' && draft.presetIndex === i && s.presetThumbActive,
                      ]}
                      onPress={() => update({ bgType: 'preset', presetIndex: i })}
                    >
                      <Image source={src} style={s.presetImg} resizeMode="cover" />
                      {draft.bgType === 'preset' && draft.presetIndex === i && (
                        <View style={s.checkBadge}>
                          <Icon source="check" size={12} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* ── Photo from gallery ── */}
                <Text style={s.sectionLabel}>FROM GALLERY</Text>
                <TouchableOpacity
                  style={[s.galleryBtn, draft.bgType === 'photo' && s.galleryBtnActive]}
                  onPress={pickPhoto}
                  activeOpacity={0.85}
                >
                  <Icon
                    source="image-plus"
                    size={20}
                    color={draft.bgType === 'photo' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[s.galleryBtnText, draft.bgType === 'photo' && { color: colors.primary }]}>
                    {draft.bgType === 'photo' && draft.bgPhotoUri
                      ? 'Photo selected — tap to change'
                      : 'Pick a photo from your library'}
                  </Text>
                  {draft.bgType === 'photo' && draft.bgPhotoUri ? (
                    <Image source={{ uri: draft.bgPhotoUri }} style={s.galleryPreview} resizeMode="cover" />
                  ) : null}
                </TouchableOpacity>

                {/* ── Solid colours ── */}
                <Text style={s.sectionLabel}>SOLID COLOUR</Text>
                <View style={s.colorGrid}>
                  {COLOR_SWATCHES.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        s.colorSwatch,
                        { backgroundColor: color },
                        draft.bgType === 'color' && draft.bgColor === color && s.colorSwatchActive,
                      ]}
                      onPress={() => update({ bgType: 'color', bgColor: color })}
                    >
                      {draft.bgType === 'color' && draft.bgColor === color && (
                        <Icon source="check" size={14} color={color === '#fefcf3' || color === '#f5f0e8' || color === '#e8f5e9' || color === '#e3f2fd' ? '#333' : '#fff'} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {tab === 'text' && (
              <>
                {/* ── Font family ── */}
                <Text style={s.sectionLabel}>FONT FAMILY</Text>
                <View style={s.fontRow}>
                  {VERSE_FONT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[s.fontChip, draft.fontKey === opt.key && s.fontChipActive]}
                      onPress={() => update({ fontKey: opt.key })}
                    >
                      <Text
                        style={[
                          s.fontChipText,
                          { fontFamily: opt.fontFamily },
                          draft.fontKey === opt.key && s.fontChipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* ── Font size ── */}
                <Text style={s.sectionLabel}>FONT SIZE</Text>
                <View style={s.sizeRow}>
                  <TouchableOpacity
                    style={[s.sizeBtn, draft.fontSize <= MIN_FONT && s.sizeBtnDisabled]}
                    disabled={draft.fontSize <= MIN_FONT}
                    onPress={() => update({ fontSize: draft.fontSize - 1 })}
                  >
                    <Icon source="minus" size={20} color={draft.fontSize <= MIN_FONT ? colors.textMuted : colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={s.sizeValue}>{draft.fontSize}</Text>
                  <TouchableOpacity
                    style={[s.sizeBtn, draft.fontSize >= MAX_FONT && s.sizeBtnDisabled]}
                    disabled={draft.fontSize >= MAX_FONT}
                    onPress={() => update({ fontSize: draft.fontSize + 1 })}
                  >
                    <Icon source="plus" size={20} color={draft.fontSize >= MAX_FONT ? colors.textMuted : colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* ── Live preview ── */}
                <Text style={s.sectionLabel}>PREVIEW</Text>
                <View style={s.previewCard}>
                  <Text
                    style={[
                      s.previewVerse,
                      {
                        fontFamily: resolveFontFamily(draft.fontKey),
                        fontSize: draft.fontSize,
                      },
                    ]}
                  >
                    {'"For God so loved the world that he gave his one and only Son."'}
                  </Text>
                  <Text style={s.previewRef}>John 3:16</Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* ─── Action buttons ─── */}
          <View style={s.btnRow}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyBtn} onPress={apply}>
              <Text style={s.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '88%',
      paddingBottom: Spacing.xxl,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginTop: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    title: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: c.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    tabBar: {
      flexDirection: 'row',
      marginHorizontal: Spacing.md,
      backgroundColor: c.surfaceAlt,
      borderRadius: Radius.full,
      padding: 3,
      marginBottom: Spacing.sm,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: Spacing.xs + 2,
      alignItems: 'center',
      borderRadius: Radius.full,
    },
    tabBtnActive: {
      backgroundColor: c.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    tabText: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semiBold,
      color: c.textSecondary,
    },
    tabTextActive: { color: c.textPrimary, fontWeight: Typography.weight.bold },

    content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },

    sectionLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textMuted,
      letterSpacing: 1.5,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },

    // Preset image row
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    presetThumb: {
      width: 80,
      height: 52,
      borderRadius: Radius.md,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
      position: 'relative',
    },
    presetThumbActive: {
      borderColor: c.primary,
    },
    presetImg: { width: '100%', height: '100%' },
    presetRotateBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 8,
      padding: 2,
    },
    presetLabel: {
      position: 'absolute',
      bottom: 2,
      left: 4,
      fontSize: 9,
      color: '#fff',
      fontWeight: '700',
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    checkBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: c.primary,
      borderRadius: 8,
      padding: 2,
    },

    // Gallery button
    galleryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceAlt,
      borderRadius: Radius.md,
      padding: Spacing.md,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
    },
    galleryBtnActive: { borderColor: c.primary },
    galleryBtnText: {
      flex: 1,
      fontSize: Typography.size.sm,
      color: c.textSecondary,
    },
    galleryPreview: {
      width: 40,
      height: 28,
      borderRadius: 6,
    },

    // Colour swatches
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    colorSwatch: {
      width: 44,
      height: 44,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorSwatchActive: {
      borderColor: c.primary,
      borderWidth: 2.5,
    },

    // Font family row
    fontRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    fontChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
    },
    fontChipActive: { borderColor: c.primary, backgroundColor: c.primary + '1A' },
    fontChipText: {
      fontSize: Typography.size.md,
      color: c.textSecondary,
    },
    fontChipTextActive: { color: c.primary, fontWeight: Typography.weight.bold },

    // Font size
    sizeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    sizeBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    sizeBtnDisabled: { opacity: 0.4 },
    sizeValue: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: c.textPrimary,
      minWidth: 36,
      textAlign: 'center',
    },

    // Preview
    previewCard: {
      backgroundColor: c.surfaceAlt,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    previewVerse: {
      color: c.textPrimary,
      fontStyle: 'italic',
      lineHeight: 24,
      marginBottom: Spacing.sm,
    },
    previewRef: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
      color: c.primary,
    },

    // Bottom buttons
    btnRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    cancelBtn: {
      flex: 1,
      height: 48,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceAlt,
    },
    cancelBtnText: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semiBold,
      color: c.textSecondary,
    },
    applyBtn: {
      flex: 2,
      height: 48,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primary,
    },
    applyBtnText: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      color: c.textOnPrimary,
    },
  });
}
