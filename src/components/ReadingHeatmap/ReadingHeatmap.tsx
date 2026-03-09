import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useColors, Typography, Spacing, Radius } from '../../theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const GAP   = 2;
const WEEKS = 26; // last ~6 months
const DAYS  = 7;
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeatmapEntry {
  createdAt: number; // Unix ms
}

interface Props {
  entries: HeatmapEntry[];
  label?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function toDateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getReferenceGrid(weeksBack: number) {
  // Build a 2-D grid [week][dayOfWeek] of Dates
  // Sunday of the most recent completed week as anchor
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Align to Sunday
  const anchor = new Date(today);
  anchor.setDate(today.getDate() - today.getDay()); // Sunday this week

  const grid: Array<Array<Date | null>> = [];
  for (let w = weeksBack - 1; w >= 0; w--) {
    const week: Array<Date | null> = [];
    for (let d = 0; d < DAYS; d++) {
      const cell = new Date(anchor);
      cell.setDate(anchor.getDate() - w * 7 + d);
      week.push(cell <= today ? cell : null);
    }
    grid.push(week);
  }
  return { grid, anchor };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReadingHeatmap({ entries, label = 'ACTIVITY' }: Props) {
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();
  // Outer: marginHorizontal 16*2 + padding 16*2 = 64px consumed
  const availableWidth = screenWidth - 64;
  const CELL = Math.max(6, Math.floor((availableWidth - (WEEKS - 1) * GAP) / WEEKS));
  const styles = makeStyles(colors, CELL);

  const countMap = useMemo<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    for (const e of entries) {
      const k = toDateKey(e.createdAt);
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  }, [entries]);

  const { grid } = useMemo(() => getReferenceGrid(WEEKS), []);

  // Month labels: find the first week where a new month starts
  const monthCols = useMemo<Array<{ col: number; label: string }>>(() => {
    const seen = new Set<string>();
    const out: Array<{ col: number; label: string }> = [];
    grid.forEach((week, col) => {
      const firstDate = week.find((d) => d !== null);
      if (!firstDate) return;
      const key = `${firstDate.getFullYear()}-${firstDate.getMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ col, label: MONTH_LABELS[firstDate.getMonth()] });
      }
    });
    return out;
  }, [grid]);

  function cellColor(count: number): string {
    if (count === 0) return colors.border;
    if (count === 1) return colors.primary + '55';
    if (count === 2) return colors.primary + 'AA';
    return colors.primary;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View>
        {/* Month row */}
        <View style={styles.monthRow}>
            {monthCols.map(({ col, label: ml }) => (
              <Text
                key={col}
                style={[styles.monthLabel, { left: col * (CELL + GAP) }]}
              >
                {ml}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {grid.map((week, wi) => (
              <View key={wi} style={styles.col}>
                {week.map((date, di) => {
                  if (!date) return <View key={di} style={styles.cellEmpty} />;
                  const key  = toDateKey(date.getTime());
                  const count = countMap[key] ?? 0;
                  return (
                    <View
                      key={di}
                      style={[styles.cell, { backgroundColor: cellColor(count) }]}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <Text style={styles.legendText}>Less</Text>
            {[0, 1, 2, 3].map((v) => (
              <View
                key={v}
                style={[styles.cell, { backgroundColor: cellColor(v), marginHorizontal: 1 }]}
              />
            ))}
            <Text style={styles.legendText}>More</Text>
          </View>
        </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (c: ReturnType<typeof useColors>, CELL: number) =>
  StyleSheet.create({
    wrapper: {
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    label: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textMuted,
      letterSpacing: 1.5,
      marginBottom: Spacing.sm,
    },
    monthRow: {
      position: 'relative',
      height: 14,
      marginBottom: 2,
    },
    monthLabel: {
      position: 'absolute',
      fontSize: 9,
      color: c.textMuted,
      fontWeight: Typography.weight.medium,
    },
    grid: {
      flexDirection: 'row',
      gap: GAP,
    },
    col: {
      flexDirection: 'column',
      gap: GAP,
      width: CELL,
    },
    cell: {
      width: CELL,
      height: CELL,
      borderRadius: 2,
    },
    cellEmpty: {
      width: CELL,
      height: CELL,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
      gap: 2,
    },
    legendText: {
      fontSize: 9,
      color: c.textMuted,
      marginHorizontal: 2,
    },
  });
