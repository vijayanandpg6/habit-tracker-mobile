import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TasksStackParamList } from '@/navigation/types';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/common';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskForm'>;

export function TaskFormScreen({ route, navigation }: Props) {
  const { task } = route.params ?? {};
  const { colors, spacing } = useTheme();
  const isEdit = !!task;

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  const isSubmitting = createTask.isPending || updateTask.isPending;

  function validate() {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errs.dueDate = 'Use format YYYY-MM-DD';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };

    try {
      if (isEdit) {
        await updateTask.mutateAsync({ id: task!._id, ...payload });
      } else {
        await createTask.mutateAsync(payload);
      }
      navigation.goBack();
    } catch {
      // errors are shown via mutation state
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete task',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask.mutateAsync(task!._id);
            navigation.goBack();
          },
        },
      ],
    );
  }

  const mutationError = (createTask.error ?? updateTask.error) as { message?: string } | null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing[5] }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Title"
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: undefined })); }}
            error={errors.title}
            autoFocus={!isEdit}
            returnKeyType="next"
            placeholder="Task title"
            maxLength={200}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            returnKeyType="next"
            placeholder="Optional description"
            maxLength={1000}
            style={styles.multiline}
            containerStyle={styles.fieldGap}
          />

          <Input
            label="Due date"
            value={dueDate}
            onChangeText={(t) => { setDueDate(t); setErrors((e) => ({ ...e, dueDate: undefined })); }}
            error={errors.dueDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
            maxLength={10}
            returnKeyType="done"
            containerStyle={styles.fieldGap}
          />

          {mutationError && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerSurface, borderRadius: 10 }]}>
              <Text variant="bodySmall" color={colors.danger}>
                {mutationError.message ?? 'Something went wrong'}
              </Text>
            </View>
          )}

          <Button
            label={isEdit ? 'Save changes' : 'Create task'}
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            style={styles.submitButton}
            size="lg"
          />

          {isEdit && (
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.7}
              style={styles.deleteButton}
              disabled={deleteTask.isPending}
            >
              <Text variant="body" weight="medium" color={colors.danger} align="center">
                Delete task
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  fieldGap: {
    marginTop: 16,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
  },
  submitButton: {
    marginTop: 28,
  },
  deleteButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
});
