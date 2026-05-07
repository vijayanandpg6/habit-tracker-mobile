import { Task, Habit } from '@/types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string; token?: string };
};

export type AppTabParamList = {
  Tasks: undefined;
  Habits: undefined;
  Settings: undefined;
};

export type TasksStackParamList = {
  TaskList: undefined;
  TaskForm: { task?: Task };
};

export type HabitsStackParamList = {
  HabitList: undefined;
  HabitForm: { habit?: Habit };
};
