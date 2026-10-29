import { FilterMode, Priority, SortMode, Task } from '../types';

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
const HOUR = 1000 * 60 * 60;

export function isOverdue(task: Task, now = Date.now()): boolean {
  return !task.completed && new Date(task.deadline).getTime() < now;
}

/**
 * The "smart" score mixes three things:
 *   1. how close the deadline is (the closer, the more urgent)
 *   2. how important the task is (priority)
 *   3. whether its start time has already arrived
 *
 * Higher score = shown higher in the list.
 */
export function smartScore(task: Task, now = Date.now()): number {
  const hoursLeft = (new Date(task.deadline).getTime() - now) / HOUR;

  // Urgency: overdue tasks get a big flat boost, upcoming ones decay with time.
  // 48 hours is roughly where urgency starts to flatten out.
  const urgency = hoursLeft <= 0 ? 100 : 100 / (1 + hoursLeft / 48);

  const importance = PRIORITY_WEIGHT[task.priority] * 25;

  // Small nudge if the task is already "active" (its start time has passed)
  const started = new Date(task.dateTime).getTime() <= now ? 10 : 0;

  return urgency + importance + started;
}

export function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  const now = Date.now();
  const copy = [...tasks];

  copy.sort((a, b) => {
    // Finished tasks always sink to the bottom whatever the sort mode is
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    if (mode === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (mode === 'priority') {
      const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      // Same priority? Earlier deadline wins
      return diff !== 0 ? diff : new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return smartScore(b, now) - smartScore(a, now);
  });

  return copy;
}

export function filterTasks(tasks: Task[], mode: FilterMode, category: string | null): Task[] {
  return tasks.filter((t) => {
    if (category && t.category !== category) return false;
    switch (mode) {
      case 'pending':
        return !t.completed;
      case 'done':
        return t.completed;
      case 'overdue':
        return isOverdue(t);
      default:
        return true;
    }
  });
}

// "in 3h", "2d overdue" etc. - friendlier than a raw timestamp
export function timeLeftLabel(task: Task, now = Date.now()): string {
  if (task.completed) return 'Completed';

  const diff = new Date(task.deadline).getTime() - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / (1000 * 60));
  const hours = Math.round(abs / HOUR);
  const days = Math.round(abs / (HOUR * 24));

  let text: string;
  if (mins < 60) text = `${Math.max(mins, 1)}m`;
  else if (hours < 24) text = `${hours}h`;
  else text = `${days}d`;

  return diff < 0 ? `${text} overdue` : `${text} left`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
