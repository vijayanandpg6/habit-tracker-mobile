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
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TasksStackParamList } from '@/navigation/types';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/common';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskForm'>;

const today = new Date();
today.setHours(0, 0, 0, 0);

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function TaskFormScreen({ route, navigation }: Props) {
  const { task } = route.params ?? {};
  const { colors, spacing } = useTheme();
  const isEdit = !!task;

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [dueDate, setDueDate] = useState<Date | null>(
    task?.dueDate ? new Date(task.dueDate) : null,
  );
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const isSubmitting = createTask.isPending || updateTask.isPending;

  function validate() {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleDateChange(_event: unknown, selected?: Date) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDueDate(selected);
  }

  function clearDueDate() {
    setDueDate(null);
    setShowPicker(false);
  }

  async function handleSubmit() {
    if (!validate()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
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

          {/* Due date picker */}
          <View style={styles.fieldGap}>
            <Text variant="bodySmall" weight="medium" color={colors.textSecondary} style={styles.label}>
              Due date
            </Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Text
                variant="body"
                color={dueDate ? colors.text : colors.placeholder}
              >
                {dueDate ? formatDisplayDate(dueDate) : 'Select a due date'}
              </Text>
              {dueDate && (
                <TouchableOpacity
                  onPress={clearDueDate}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text variant="bodySmall" color={colors.textSecondary}>Clear</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={dueDate ?? today}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={today}
                onValueChange={handleDateChange}
                accentColor={colors.primary}
                themeVariant="light"
              />
            )}

            {showPicker && Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                style={[styles.doneButton, { backgroundColor: colors.primary }]}
              >
                <Text variant="body" weight="semibold" color="#fff">Done</Text>
              </TouchableOpacity>
            )}
          </View>

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
  label: {
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
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
