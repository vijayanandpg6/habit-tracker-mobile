import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { tasksApi } from '@/api';
import { tasksStorage, syncQueueStorage } from '@/storage';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types';
import { QUERY_KEYS } from '@/constants';
import { useNetworkStatus } from '@/sync';

export function useTasks() {
  const isOnline = useNetworkStatus();
  const query = useQuery({
    queryKey: QUERY_KEYS.tasks,
    queryFn: async () => {
      try {
        const res = await tasksApi.list();
        const apiTasks = res.data.data ?? [];
        // Preserve pending local tasks not yet flushed by the sync queue
        const pending = tasksStorage.getAll().filter(
          (t) => t.syncStatus === 'pending' && !apiTasks.find((a) => a._id === t._id),
        );
        tasksStorage.saveAll([...pending, ...apiTasks]);
        tasksStorage.setLastSynced(new Date().toISOString());
        return tasksStorage.getAll();
      } catch {
        return tasksStorage.getAll();
      }
    },
    initialData: () => tasksStorage.getAll(),
    initialDataUpdatedAt: () => {
      const last = tasksStorage.getLastSynced();
      return last ? new Date(last).getTime() : 0;
    },
  });

  // Trigger a fresh fetch when the device comes back online
  React.useEffect(() => {
    if (isOnline) query.refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return query;
}

export function useCreateTask() {
  const qc = useQueryClient();
  const isOnline = useNetworkStatus();

  return useMutation({
    mutationFn: async (payload: Omit<CreateTaskPayload, 'clientUpdatedAt'>) => {
      const clientUpdatedAt = new Date().toISOString();
      const fullPayload: CreateTaskPayload = { ...payload, clientUpdatedAt };

      if (!isOnline) {
        const tempId = `temp_${uuidv4()}`;
        const optimistic: Task = {
          _id: tempId,
          userId: '',
          completed: false,
          createdAt: clientUpdatedAt,
          updatedAt: clientUpdatedAt,
          syncStatus: 'pending',
          ...fullPayload,
        };
        syncQueueStorage.enqueue({
          id: uuidv4(),
          type: 'task:create',
          entity: 'task',
          payload: fullPayload as unknown as Record<string, unknown>,
          createdAt: clientUpdatedAt,
          retryCount: 0,
        });
        return optimistic;
      }

      const res = await tasksApi.create(fullPayload);
      const task = res.data.data!;
      tasksStorage.upsert(task);
      return task;
    },
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previous = qc.getQueryData<Task[]>(QUERY_KEYS.tasks) ?? [];

      const optimistic: Task = {
        _id: `temp_${uuidv4()}`,
        userId: '',
        title: variables.title,
        description: variables.description,
        dueDate: variables.dueDate,
        completed: variables.completed ?? false,
        clientUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      };

      qc.setQueryData<Task[]>(QUERY_KEYS.tasks, [optimistic, ...previous]);
      return { previous, optimisticId: optimistic._id };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.tasks, context.previous);
      }
    },
    onSuccess: (task, _vars, context) => {
      qc.setQueryData<Task[]>(QUERY_KEYS.tasks, (old) =>
        old?.map((t) => (t._id === context?.optimisticId ? task : t)) ?? [task],
      );
      tasksStorage.upsert(task);
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const isOnline = useNetworkStatus();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTaskPayload & { id: string }) => {
      const clientUpdatedAt = new Date().toISOString();
      const fullPayload: UpdateTaskPayload = { ...payload, clientUpdatedAt };

      if (!isOnline) {
        syncQueueStorage.enqueue({
          id: uuidv4(),
          type: 'task:update',
          entity: 'task',
          payload: { id, ...fullPayload } as unknown as Record<string, unknown>,
          createdAt: clientUpdatedAt,
          retryCount: 0,
        });
        const existing = tasksStorage.getAll().find((t) => t._id === id);
        if (existing) {
          const updated = { ...existing, ...fullPayload, syncStatus: 'pending' as const };
          tasksStorage.upsert(updated);
          return updated;
        }
        throw new Error('Task not found');
      }

      const res = await tasksApi.update(id, fullPayload);
      const task = res.data.data!;
      tasksStorage.upsert(task);
      return task;
    },
    onMutate: async ({ id, ...payload }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previous = qc.getQueryData<Task[]>(QUERY_KEYS.tasks) ?? [];
      qc.setQueryData<Task[]>(QUERY_KEYS.tasks, (old) =>
        old?.map((t) =>
          t._id === id ? { ...t, ...payload, syncStatus: 'pending' as const } : t,
        ) ?? previous,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.tasks, context.previous);
      }
    },
    onSuccess: (task) => {
      qc.setQueryData<Task[]>(QUERY_KEYS.tasks, (old) =>
        old?.map((t) => (t._id === task._id ? task : t)) ?? [],
      );
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const isOnline = useNetworkStatus();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isOnline) {
        syncQueueStorage.enqueue({
          id: uuidv4(),
          type: 'task:delete',
          entity: 'task',
          payload: { id },
          createdAt: new Date().toISOString(),
          retryCount: 0,
        });
        tasksStorage.remove(id);
        return id;
      }
      await tasksApi.delete(id);
      tasksStorage.remove(id);
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previous = qc.getQueryData<Task[]>(QUERY_KEYS.tasks) ?? [];
      qc.setQueryData<Task[]>(QUERY_KEYS.tasks, (old) => old?.filter((t) => t._id !== id) ?? []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.tasks, context.previous);
      }
    },
  });
}
