import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../types';
import { colors, priorityColors, radius, spacing } from '../theme/theme';
import { formatDateTime, isOverdue, timeLeftLabel } from '../utils/taskUtils';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, onToggle, onDelete }: Props) {
  const overdue = isOverdue(task);
  const tint = priorityColors[task.priority];

  return (
    <View style={[styles.card, task.completed && { opacity: 0.55 }]}>
      {/* Coloured strip on the left shows priority at a glance */}
      <View style={[styles.strip, { backgroundColor: tint }]} />

      {/* Checkbox */}
      <Pressable onPress={onToggle} hitSlop={10} style={[styles.check, task.completed && styles.checkDone]}>
        {task.completed && <Text style={styles.tick}>✓</Text>}
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, task.completed && styles.strike]} numberOfLines={2}>
          {task.title}
        </Text>

        {!!task.description && (
          <Text style={styles.desc} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{task.category}</Text>
          </View>
          <Text style={[styles.meta, overdue && { color: colors.danger, fontWeight: '700' }]}>
            {timeLeftLabel(task)}
          </Text>
        </View>

        <Text style={styles.date}>
          Starts {formatDateTime(task.dateTime)}  •  Due {formatDateTime(task.deadline)}
        </Text>
      </View>

      <Pressable onPress={onDelete} hitSlop={10} style={styles.delete}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingLeft: spacing.md + 6,
    marginBottom: spacing.sm + 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  strip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkDone: { backgroundColor: colors.primary },
  tick: { color: '#fff', fontWeight: '800', fontSize: 14 },
  body: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  desc: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  meta: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  date: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  delete: { paddingLeft: spacing.sm },
  deleteText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
});
