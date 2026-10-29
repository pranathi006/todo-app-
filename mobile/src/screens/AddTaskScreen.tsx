import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import PriorityPicker from '../components/PriorityPicker';
import Chips from '../components/Chips';
import { useTasks } from '../context/TaskContext';
import { getErrorMessage } from '../api/client';
import { Priority, RootStackParamList } from '../types';
import { formatDateTime } from '../utils/taskUtils';
import { colors, radius, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

// Quick-pick tags; users can also type their own below
const SUGGESTED_TAGS = ['General', 'Work', 'Study', 'Personal', 'Health'];

type PickerTarget = 'start' | 'deadline';

export default function AddTaskScreen({ navigation }: Props) {
  const { addTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('General');
  const [startAt, setStartAt] = useState(new Date());
  // Default deadline: one hour from now, so it's never in the past by accident
  const [deadline, setDeadline] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [titleError, setTitleError] = useState('');
  const [saving, setSaving] = useState(false);

  // Android's picker is two steps: first a date dialog, then a time dialog.
  const [picker, setPicker] = useState<{ target: PickerTarget; mode: 'date' | 'time' } | null>(null);

  const openPicker = (target: PickerTarget) => setPicker({ target, mode: 'date' });

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed' || !selected || !picker) {
      setPicker(null);
      return;
    }

    const setter = picker.target === 'start' ? setStartAt : setDeadline;
    const current = picker.target === 'start' ? startAt : deadline;

    if (picker.mode === 'date') {
      // Keep the old time, swap in the new day, then ask for the time
      const merged = new Date(current);
      merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setter(merged);
      setPicker({ target: picker.target, mode: 'time' });
    } else {
      const merged = new Date(current);
      merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setter(merged);
      setPicker(null);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Give your task a title');
      return;
    }
    if (deadline.getTime() < startAt.getTime()) {
      Alert.alert('Check your dates', 'The deadline can\'t be before the start time.');
      return;
    }

    setSaving(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        dateTime: startAt.toISOString(),
        deadline: deadline.toISOString(),
        priority,
        category: category.trim() || 'General',
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const tagOptions = SUGGESTED_TAGS.includes(category)
    ? SUGGESTED_TAGS
    : [...SUGGESTED_TAGS, category]; // keep a custom tag visible once typed

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.heading}>New task</Text>
        </View>

        <AppInput
          label="Title"
          placeholder="e.g. Submit assignment"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (titleError) setTitleError('');
          }}
          error={titleError}
          maxLength={120}
        />
        <AppInput
          label="Description"
          placeholder="Any details worth remembering?"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ minHeight: 90, textAlignVertical: 'top' }}
        />

        <Text style={styles.label}>Priority</Text>
        <PriorityPicker value={priority} onChange={setPriority} />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Tag</Text>
        <Chips options={tagOptions.map((t) => ({ label: t, value: t }))} selected={category} onSelect={setCategory} />
        <AppInput
          label=""
          placeholder="…or type your own tag"
          value={SUGGESTED_TAGS.includes(category) ? '' : category}
          onChangeText={setCategory}
          maxLength={20}
          style={{ marginTop: spacing.sm }}
        />

        <Text style={styles.label}>Starts</Text>
        <Pressable style={styles.dateBox} onPress={() => openPicker('start')}>
          <Text style={styles.dateText}>🗓  {formatDateTime(startAt.toISOString())}</Text>
        </Pressable>

        <Text style={[styles.label, { marginTop: spacing.md }]}>Deadline</Text>
        <Pressable style={styles.dateBox} onPress={() => openPicker('deadline')}>
          <Text style={styles.dateText}>⏰  {formatDateTime(deadline.toISOString())}</Text>
        </Pressable>

        {picker && (
          <DateTimePicker
            value={picker.target === 'start' ? startAt : deadline}
            mode={picker.mode}
            minimumDate={picker.mode === 'date' ? new Date() : undefined}
            onChange={onPickerChange}
          />
        )}

        <AppButton title="Save task" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  header: { marginBottom: spacing.lg },
  back: { color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  dateBox: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
  },
  dateText: { color: colors.text, fontSize: 15 },
});
