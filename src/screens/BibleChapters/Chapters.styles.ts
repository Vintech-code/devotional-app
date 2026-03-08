import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    gap: 12,
  },
  backBtn:     { padding: 4 },
  headerText:  { flex: 1 },
  headerTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: c.textPrimary },
  headerSub:   { fontSize: Typography.size.sm, color: c.textMuted },

  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: c.surfaceAlt,
  },
  loadingText: { fontSize: Typography.size.sm, color: c.textMuted },

  grid: { padding: Spacing.md, gap: 10 },

  cell: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    backgroundColor: c.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCached: {
    borderColor: c.primary,
    borderWidth: 1.5,
  },
  cellNum:   { fontSize: Typography.size.md, fontWeight: Typography.weight.semiBold, color: c.textPrimary },
  cellVerse: { fontSize: 9, color: c.primary, marginTop: 2 },
});
