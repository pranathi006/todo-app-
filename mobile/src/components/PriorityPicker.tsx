import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Priority } from '../types';
import { colors, priorityColors, radius, spacing } from '../theme/theme';

const OPTIONS: Priority[] = ['low', 'medium', 'high'];

interface Props {
  value: Priority;
  onChange: (p: Priority) => void;
}

// Three pill buttons - the selected one fills with its priority colour
export default function PriorityPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((p) => {
        const selected = p === value;
        const tint = priorityColors[p];
        return (
          <Pressable
            key={p}
            onPress={() => onChange(p)}
            style={[
              styles.pill,
              { borderColor: tint },
              selected && { backgroundColor: tint },
            ]}>
            <Text style={[styles.text, { color: selected ? colors.bg : tint }]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  text: { fontWeight: '700', fontSize: 14 },
});
