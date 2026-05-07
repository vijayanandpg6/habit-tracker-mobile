import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { habitsApi } from '@/api';
import { habitsStorage, syncQueueStorage } from '@/storage';
import { Habit, CreateHabitPayload, UpdateHabitPayload } from '@/types';
import { QUERY_KEYS } from '@/constants';
import { useNetworkStatus } from '@/sync';
import { isSameDay } from 'date-fns';

export function useHabits() {
  const isOnline = useNetworkStatus();

  return useQuery({
    queryKey: QUERY_KEYS.habits,
    queryFn: async () => {
      if (!isOnline) {
        return habitsStorage.getAll();
      }
      const res = await habitsApi.list();
      const habits = res.data.data ?? [];
      habitsStorage.saveAll(habits);
      habitsStorage.setLastSynced(new Date().toISOString());
      return habits;
    },
    initialData: () => habitsStorage.getAll(),
    initialDataUpdatedAt: () => {
      const last = habitsStorage.getLastSynced();
      return last ? new Date(last).getTime() : 0;
    },
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  const isOnline = useNetworkStatus();

  return useMutation({
    mutationFn: async (payload: Omit<CreateHabitPayload, 'clientUpdatedAt'>) => {
      const clientUpdatedAt = new Date().toISOString();
      const fullPayload: CreateHabitPayload = { ...payload, clientUpdatedAt };

      if (!isOnline) {
        const tempId = `temp_${uuidv4()}`;
        const optimistic: Habit = {
          _id: tempId,
          userId: '',
          streakCount: 0,
          completionHistory: [],
          createdAt: clientUpdatedAt,
          updatedAt: clientUpdatedAt,
          syncStatus: 'pending',
          ...fullPayload,
        };
        syncQueueStorage.enqueue({
          id: uuidv4(),
          type: 'habit:create',
          entity: 'habit',
          payload: fullPayload as unknown as Record<string, unknown>,
          createdAt: clientUpdatedAt,
          retryCount: 0,
        });
        return optimistic;
      }

      const res = await habitsApi.create(fullPayload);
      const habit = res.data.data!;
      habitsStorage.upsert(habit);
      return habit;
    },
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.habits });
      const previous = qc.getQueryData<Habit[]>(QUERY_KEYS.habits) ?? [];

      const optimistic: Habit = {
        _id: `temp_${uuidv4()}`,
        userId: '',
        title: variables.title,
        description: variables.description,
        streakCount: 0,
        completionHistory: [],
        clientUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      };

      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, [optimistic, ...previous]);
      return { previous, optimisticId: optimistic._id };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.habits, context.previous);
      }
    },
    onSuccess: (habit, _vars, context) => {
      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) =>
        old?.map((h) => (h._id === context?.optimisticId ? habit : h)) ?? [habit],
      );
      habitsStorage.upsert(habit);
    },
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  const isOnline = useNetworkStatus();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateHabitPayload & { id: string }) => {
      const clientUpdatedAt = new Date().toISOString();
      const fullPayload: UpdateHabitPayload = { ...payload, clientUpdatedAt };

      if (!isOnline) {
        syncQueueStorage.enqueue({
          id: uuidv4(),
          type: 'habit:update',
          entity: 'habit',
          payload: { id, ...fullPayload } as unknown as Record<string, unknown>,
          createdAt: clientUpdatedAt,
          retryCount: 0,
        });
        const existing = habitsStorage.getAll().find((h) => h._id === id);
        if (existing) {
          const updated = { ...existing, ...fullPayload, syncStatus: 'pending' as const };
          habitsStorage.upsert(updated);
          return updated;
        }
        throw new Error('Habit not found');
      }

      const res = await habitsApi.update(id, fullPayload);
      const habit = res.data.data!;
      habitsStorage.upsert(habit);
      return habit;
    },
    onMutate: async ({ id, ...payload }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.habits });
      const previous = qc.getQueryData<Habit[]>(QUERY_KEYS.habits) ?? [];
      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) =>
        old?.map((h) =>
          h._id === id ? { ...h, ...payload, syncStatus: 'pending' as const } : h,
        ) ?? previous,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.habits, context.previous);
      }
    },
    onSuccess: (habit) => {
      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) =>
        old?.map((h) => (h._id === habit._id ? habit : h)) ?? [],
      );
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  const isOnline = useNetworkStatus();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isOnline) {
        syncQueueStorage.enqueue({
          id: uuidv4(),
          type: 'habit:delete',
          entity: 'habit',
          payload: { id },
          createdAt: new Date().toISOString(),
          retryCount: 0,
        });
        habitsStorage.remove(id);
        return id;
      }
      await habitsApi.delete(id);
      habitsStorage.remove(id);
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.habits });
      const previous = qc.getQueryData<Habit[]>(QUERY_KEYS.habits) ?? [];
      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) => old?.filter((h) => h._id !== id) ?? []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.habits, context.previous);
      }
    },
  });
}

export function useCheckInHabit() {
  const qc = useQueryClient();
  const isOnline = useNetworkStatus();

  return useMutation({
    mutationFn: async (id: string) => {
      const clientUpdatedAt = new Date().toISOString();

      const habit = habitsStorage.getAll().find((h) => h._id === id);
      if (habit?.lastCompletedAt && isSameDay(new Date(habit.lastCompletedAt), new Date())) {
        throw new Error('Already checked in today');
      }

      if (!isOnline) {
        syncQueueStorage.enqueue({
          id: uuidv4(),
          type: 'habit:check-in',
          entity: 'habit',
          payload: { id, clientUpdatedAt },
          createdAt: clientUpdatedAt,
          retryCount: 0,
        });

        if (habit) {
          const updated: Habit = {
            ...habit,
            streakCount: habit.streakCount + 1,
            lastCompletedAt: clientUpdatedAt,
            completionHistory: [...habit.completionHistory, clientUpdatedAt],
            clientUpdatedAt,
            syncStatus: 'pending',
          };
          habitsStorage.upsert(updated);
          return updated;
        }
        throw new Error('Habit not found');
      }

      const res = await habitsApi.checkIn(id, { clientUpdatedAt });
      const updated = res.data.data!;
      habitsStorage.upsert(updated);
      return updated;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.habits });
      const previous = qc.getQueryData<Habit[]>(QUERY_KEYS.habits) ?? [];

      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) =>
        old?.map((h) => {
          if (h._id !== id) return h;
          const now = new Date().toISOString();
          return {
            ...h,
            streakCount: h.streakCount + 1,
            lastCompletedAt: now,
            completionHistory: [...h.completionHistory, now],
            syncStatus: 'pending' as const,
          };
        }) ?? previous,
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.habits, context.previous);
      }
    },
    onSuccess: (habit) => {
      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) =>
        old?.map((h) => (h._id === habit._id ? habit : h)) ?? [],
      );
    },
  });
}
