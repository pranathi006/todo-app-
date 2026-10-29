import { Priority } from '../types';

// One place for all colours and spacing so the look stays consistent
export const colors = {
  bg: '#0B0B17',
  surface: '#161629',
  surfaceAlt: '#1F1F3A',
  border: '#2B2B4D',
  text: '#F4F4FB',
  textMuted: '#9A9AB8',
  primary: '#7C5CFF',
  primarySoft: 'rgba(124, 92, 255, 0.18)',
  accent: '#2DE2C4',
  danger: '#FF5C7A',
  success: '#34D399',
};

export const priorityColors: Record<Priority, string> = {
  high: '#FF5C7A',
  medium: '#FFB84D',
  low: '#2DE2C4',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 10, md: 16, lg: 24 };
