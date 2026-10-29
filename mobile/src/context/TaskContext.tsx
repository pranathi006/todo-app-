import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import api from '../api/client';
import { NewTaskInput, Task } from '../types';

// ---- State + reducer -------------------------------------------------------
// useReducer keeps all the ways tasks can change in one readable place.

interface TaskState {
  tasks: Task[];
  loading: boolean;
}

type Action =
  | { type: 'LOADING' }
  | { type: 'SET_TASKS'; tasks: Task[] }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'REPLACE_TASK'; task: Task }
  | { type: 'REMOVE_TASK'; id: string }
  | { type: 'CLEAR' };

const initialState: TaskState = { tasks: [], loading: false };

function reducer(state: TaskState, action: Action): TaskState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'SET_TASKS':
      return { tasks: action.tasks, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'REPLACE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t._id === action.task._id ? action.task : t)),
      };
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t._id !== action.id) };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

// ---- Context ---------------------------------------------------------------

interface TaskContextValue extends TaskState {
  fetchTasks: () => Promise<void>;
  addTask: (input: NewTaskInput) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearTasks: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await api.get<Task[]>('/tasks');
      dispatch({ type: 'SET_TASKS', tasks: data });
    } catch (err) {
      // Stop the spinner, then let the screen show its own error
      dispatch({ type: 'SET_TASKS', tasks: [] });
      throw err;
    }
  }, []);

  const addTask = useCallback(async (input: NewTaskInput) => {
    const { data } = await api.post<Task>('/tasks', input);
    dispatch({ type: 'ADD_TASK', task: data });
  }, []);

  // Optimistic update: flip the checkbox instantly, roll back if the server says no.
  // Feels much snappier than waiting for the network.
  const toggleTask = useCallback(
    async (id: string) => {
      const current = state.tasks.find((t) => t._id === id);
      if (!current) return;

      dispatch({ type: 'REPLACE_TASK', task: { ...current, completed: !current.completed } });
      try {
        const { data } = await api.patch<Task>(`/tasks/${id}/toggle`);
        dispatch({ type: 'REPLACE_TASK', task: data });
      } catch (err) {
        dispatch({ type: 'REPLACE_TASK', task: current });
        throw err;
      }
    },
    [state.tasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const current = state.tasks.find((t) => t._id === id);
      dispatch({ type: 'REMOVE_TASK', id });
      try {
        await api.delete(`/tasks/${id}`);
      } catch (err) {
        // Put it back if the delete failed
        if (current) dispatch({ type: 'ADD_TASK', task: current });
        throw err;
      }
    },
    [state.tasks]
  );

  const clearTasks = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const value = useMemo(
    () => ({ ...state, fetchTasks, addTask, toggleTask, deleteTask, clearTasks }),
    [state, fetchTasks, addTask, toggleTask, deleteTask, clearTasks]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used inside <TaskProvider>');
  return ctx;
}
