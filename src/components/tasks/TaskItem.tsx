import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Task } from '@/types';
import { useTheme } from '@/theme';
import { Text } from '../common/Text';
import { Divider } from '../common/Divider';

interface Props {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onPress: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onPress }: Props) {
  const { colors, spacing, radius } = useTheme();
  const isPending = task.syncStatus === 'pending';

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      activeOpacity={0.7}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={() => onToggle(task._id, !task.completed)}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.checkbox,
          {
            borderColor: task.completed ? colors.primary : colors.border,
            backgroundColor: task.completed ? colors.primary : 'transparent',
            borderRadius: radius.sm,
          },
        ]}
      >
        {task.completed && (
          <View style={[styles.checkmark, { borderColor: colors.textInverse }]} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            variant="body"
            weight="medium"
            color={task.completed ? colors.textTertiary : colors.text}
            style={[task.completed && styles.strikethrough, styles.title]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {isPending && (
            <View style={[styles.pendingDot, { backgroundColor: colors.warning }]} />
          )}
        </View>

        {task.description ? (
          <Text
            variant="bodySmall"
            color={colors.textSecondary}
            numberOfLines={1}
            style={styles.description}
          >
            {task.description}
          </Text>
        ) : null}

        {task.dueDate ? (
          <Text
            variant="caption"
            color={
              new Date(task.dueDate) < new Date() && !task.completed
                ? colors.danger
                : colors.textTertiary
            }
            style={styles.dueDate}
          >
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 5,
    height: 9,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
  },
  content: {
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
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  description: {
    marginTop: 2,
  },
  dueDate: {
    marginTop: 4,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
