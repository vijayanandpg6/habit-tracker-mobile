import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { isSameDay } from 'date-fns';
import { Habit } from '@/types';
import { useTheme } from '@/theme';
import { Text } from '../common/Text';

interface Props {
  habit: Habit;
  onCheckIn: (id: string) => void;
  onPress: (habit: Habit) => void;
}

export function HabitItem({ habit, onCheckIn, onPress }: Props) {
  const { colors, radius, spacing } = useTheme();
  const isPending = habit.syncStatus === 'pending';

  const checkedToday =
    !!habit.lastCompletedAt && isSameDay(new Date(habit.lastCompletedAt), new Date());

  return (
    <TouchableOpacity onPress={() => onPress(habit)} activeOpacity={0.7} style={styles.container}>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text variant="body" weight="medium" color={colors.text} numberOfLines={1} style={styles.title}>
            {habit.title}
          </Text>
          {isPending && (
            <View style={[styles.pendingDot, { backgroundColor: colors.warning }]} />
          )}
        </View>

        {habit.description ? (
          <Text
            variant="bodySmall"
            color={colors.textSecondary}
            numberOfLines={1}
            style={styles.description}
          >
            {habit.description}
          </Text>
        ) : null}

        <View style={styles.streakRow}>
          <Text variant="caption" color={colors.textTertiary}>
            {habit.streakCount === 0
              ? 'No streak yet'
              : `${habit.streakCount} day streak`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => !checkedToday && onCheckIn(habit._id)}
        activeOpacity={checkedToday ? 1 : 0.7}
        style={[
          styles.checkInButton,
          {
            backgroundColor: checkedToday ? colors.successSurface : colors.primarySurface,
            borderRadius: radius.md,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[2],
          },
        ]}
      >
        <Text
          variant="caption"
          weight="semibold"
          color={checkedToday ? colors.success : colors.primary}
        >
          {checkedToday ? 'Done' : 'Check in'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  streakRow: {
    marginTop: 4,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  checkInButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
});
