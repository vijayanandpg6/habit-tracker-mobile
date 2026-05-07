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
import { TasksStackParamList } from '@/navigation/types';
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks';
import { useTheme } from '@/theme';
import { Task } from '@/types';
import { TaskItem } from '@/components/tasks';
import {
  ScreenHeader,
  EmptyState,
  LoadingOverlay,
  Divider,
  OfflineBanner,
} from '@/components/common';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskList'>;

export function TaskListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { data: tasks = [], isLoading, refetch, isRefetching } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const activeTasks = tasks.filter((t) => !t.deletedAt);

  const handleToggle = useCallback(
    (id: string, completed: boolean) => {
      updateTask.mutate({ id, completed });
    },
    [updateTask],
  );

  const handlePress = useCallback(
    (task: Task) => {
      navigation.navigate('TaskForm', { task });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Task>) => (
      <View>
        <TaskItem task={item} onToggle={handleToggle} onPress={handlePress} />
        {index < activeTasks.length - 1 && <Divider indent={54} />}
      </View>
    ),
    [handleToggle, handlePress, activeTasks.length],
  );

  if (isLoading && activeTasks.length === 0) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <OfflineBanner />
      <ScreenHeader
        title="Tasks"
        subtitle={
          activeTasks.length > 0
            ? `${activeTasks.filter((t) => t.completed).length} of ${activeTasks.length} complete`
            : undefined
        }
        rightAction={{
          label: '+ New',
          onPress: () => navigation.navigate('TaskForm', {}),
        }}
      />

      <FlatList
        data={activeTasks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={activeTasks.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No tasks yet"
            description="Create your first task to get started"
            actionLabel="Add task"
            onAction={() => navigation.navigate('TaskForm', {})}
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
