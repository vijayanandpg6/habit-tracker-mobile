import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HabitsStackParamList } from '@/navigation/types';
import { useHabits, useCheckInHabit } from '@/hooks';
import { useTheme } from '@/theme';
import { Habit } from '@/types';
import { HabitItem } from '@/components/habits';
import {
  ScreenHeader,
  EmptyState,
  LoadingOverlay,
  Divider,
  OfflineBanner,
  Text,
} from '@/components/common';
import { isSameDay } from 'date-fns';

type Props = NativeStackScreenProps<HabitsStackParamList, 'HabitList'>;

export function HabitListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { data: habits = [], isLoading, refetch, isRefetching } = useHabits();
  const checkIn = useCheckInHabit();

  const activeHabits = habits.filter((h) => !h.deletedAt);
  const checkedToday = activeHabits.filter(
    (h) => h.lastCompletedAt && isSameDay(new Date(h.lastCompletedAt), new Date()),
  ).length;

  const handleCheckIn = useCallback(
    (id: string) => {
      checkIn.mutate(id);
    },
    [checkIn],
  );

  const handlePress = useCallback(
    (habit: Habit) => {
      navigation.navigate('HabitForm', { habit });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Habit>) => (
      <View>
        <HabitItem habit={item} onCheckIn={handleCheckIn} onPress={handlePress} />
        {index < activeHabits.length - 1 && <Divider indent={20} />}
      </View>
    ),
    [handleCheckIn, handlePress, activeHabits.length],
  );

  if (isLoading && activeHabits.length === 0) {
    return <LoadingOverlay />;
  }

  const subtitle =
    activeHabits.length > 0
      ? `${checkedToday} of ${activeHabits.length} done today`
      : undefined;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <OfflineBanner />
      <ScreenHeader
        title="Habits"
        subtitle={subtitle}
        rightAction={{
          label: '+ New',
          onPress: () => navigation.navigate('HabitForm', {}),
        }}
      />

      <FlatList
        data={activeHabits}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={activeHabits.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No habits yet"
            description="Build your first habit and start your streak"
            actionLabel="Add habit"
            onAction={() => navigation.navigate('HabitForm', {})}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
  },
});
