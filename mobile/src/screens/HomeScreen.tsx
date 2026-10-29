import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TaskCard from '../components/TaskCard';
import Chips from '../components/Chips';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { getErrorMessage } from '../api/client';
import { FilterMode, RootStackParamList, SortMode } from '../types';
import { filterTasks, isOverdue, sortTasks } from '../utils/taskUtils';
import { colors, radius, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const FILTERS: { label: string; value: FilterMode }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Done', value: 'done' },
  { label: 'Overdue', value: 'overdue' },
];

const SORTS: { label: string; value: SortMode }[] = [
  { label: '✦ Smart', value: 'smart' },
  { label: 'Deadline', value: 'deadline' },
  { label: 'Priority', value: 'priority' },
];

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { tasks, loading, fetchTasks, toggleTask, deleteTask, clearTasks } = useTasks();

  const [filter, setFilter] = useState<FilterMode>('all');
  const [sort, setSort] = useState<SortMode>('smart');
  const [category, setCategory] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      await fetchTasks();
    } catch (err) {
      Alert.alert('Oops', getErrorMessage(err));
    }
  }, [fetchTasks]);

  useEffect(() => {
    load();
  }, [load]);

  // Categories are built from whatever the user has actually used
  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(tasks.map((t) => t.category)));
    return [{ label: 'Any tag', value: null as string | null }, ...unique.map((c) => ({ label: c, value: c as string | null }))];
  }, [tasks]);

  const visible = useMemo(
    () => sortTasks(filterTasks(tasks, filter, category), sort),
    [tasks, filter, category, sort]
  );

  // Small stats for the header
  const doneCount = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;
  const progress = tasks.length ? doneCount / tasks.length : 0;

  const safely = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err) {
      Alert.alert('Oops', getErrorMessage(err));
    }
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert('Delete task?', `"${title}" will be removed for good.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => safely(() => deleteTask(id)) },
    ]);
  };

  const handleLogout = async () => {
    clearTasks(); // don't leave one user's tasks in memory for the next login
    await logout();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={visible}
        keyExtractor={(t) => t._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            {/* Greeting + logout */}
            <View style={styles.topRow}>
              <View>
                <Text style={styles.hello}>Hey {user?.name || user?.email.split('@')[0]} 👋</Text>
                <Text style={styles.sub}>
                  {tasks.length === 0
                    ? 'Nothing on your plate yet.'
                    : `${doneCount} of ${tasks.length} done${overdueCount ? ` • ${overdueCount} overdue` : ''}`}
                </Text>
              </View>
              <Pressable onPress={handleLogout} style={styles.logout}>
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </View>

            {/* Progress bar */}
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>

            <Chips options={FILTERS} selected={filter} onSelect={setFilter} />
            <View style={{ height: spacing.xs }} />
            <Chips options={SORTS} selected={sort} onSelect={setSort} />
            {categoryOptions.length > 2 && (
              <>
                <View style={{ height: spacing.xs }} />
                <Chips options={categoryOptions} selected={category} onSelect={setCategory} />
              </>
            )}
            <View style={{ height: spacing.md }} />
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => safely(() => toggleTask(item._id))}
            onDelete={() => confirmDelete(item._id, item.title)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌙</Text>
              <Text style={styles.emptyText}>
                {tasks.length === 0 ? 'Tap + to add your first task' : 'No tasks match these filters'}
              </Text>
            </View>
          )
        }
      />

      {/* Floating add button */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.md, paddingBottom: 110 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { color: colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.textMuted, marginTop: 2 },
  logout: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
  track: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    marginVertical: spacing.md,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 8 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: colors.textMuted, marginTop: spacing.sm },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 62,
    height: 62,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  fabText: { color: '#fff', fontSize: 32, marginTop: -2, fontWeight: '300' },
});
