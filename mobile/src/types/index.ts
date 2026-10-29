// Shared types used across the whole app

export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  dateTime: string; // ISO string coming from the API
  deadline: string; // ISO string coming from the API
  priority: Priority;
  category: string;
  completed: boolean;
  completedAt: string | null;
}

// What the "add task" form sends to the server
export interface NewTaskInput {
  title: string;
  description: string;
  dateTime: string;
  deadline: string;
  priority: Priority;
  category: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type SortMode = 'smart' | 'deadline' | 'priority';
export type FilterMode = 'all' | 'pending' | 'done' | 'overdue';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  AddTask: undefined;
};
