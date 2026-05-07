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
import { HabitsStackParamList } from '@/navigation/types';
import { useCreateHabit, useUpdateHabit, useDeleteHabit } from '@/hooks';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/common';

type Props = NativeStackScreenProps<HabitsStackParamList, 'HabitForm'>;

export function HabitFormScreen({ route, navigation }: Props) {
  const { habit } = route.params ?? {};
  const { colors, spacing } = useTheme();
  const isEdit = !!habit;

  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  const [title, setTitle] = useState(habit?.title ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [errors, setErrors] = useState<{ title?: string }>({});

  const isSubmitting = createHabit.isPending || updateHabit.isPending;

  function validate() {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updateHabit.mutateAsync({ id: habit!._id, ...payload });
      } else {
        await createHabit.mutateAsync(payload);
      }
      navigation.goBack();
    } catch {
      // handled via mutation state
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete habit',
      'Your streak and history will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit.mutateAsync(habit!._id);
            navigation.goBack();
          },
        },
      ],
    );
  }

  const mutationError = (createHabit.error ?? updateHabit.error) as { message?: string } | null;

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
            label="Habit name"
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: undefined })); }}
            error={errors.title}
            autoFocus={!isEdit}
            returnKeyType="next"
            placeholder="e.g., Morning run"
            maxLength={200}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            placeholder="Optional notes or intention"
            maxLength={1000}
            style={styles.multiline}
            containerStyle={styles.fieldGap}
          />

          {isEdit && habit && (
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderRadius: 12, borderColor: colors.border }]}>
              <View style={styles.stat}>
                <Text variant="h3" weight="bold" color={colors.primary}>
                  {habit.streakCount}
                </Text>
                <Text variant="caption" color={colors.textSecondary}>
                  Day streak
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}>
                <Text variant="h3" weight="bold" color={colors.text}>
                  {habit.completionHistory.length}
                </Text>
                <Text variant="caption" color={colors.textSecondary}>
                  Total check-ins
                </Text>
              </View>
            </View>
          )}

          {mutationError && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerSurface, borderRadius: 10 }]}>
              <Text variant="bodySmall" color={colors.danger}>
                {mutationError.message ?? 'Something went wrong'}
              </Text>
            </View>
          )}

          <Button
            label={isEdit ? 'Save changes' : 'Create habit'}
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
              disabled={deleteHabit.isPending}
            >
              <Text variant="body" weight="medium" color={colors.danger} align="center">
                Delete habit
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
  statBox: {
    flexDirection: 'row',
    marginTop: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  statDivider: {
    width: 1,
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
