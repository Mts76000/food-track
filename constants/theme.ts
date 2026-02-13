export const colors = {
  primary: "#4caf50",
  danger: "#f44336",
  warning: "#ff9800",
  background: "#f5f5f5",
  card: "#fff",
  text: "#333",
  textSecondary: "#666",
  textMuted: "#999",
  border: "#e0e0e0",
  divider: "#eaeaea",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  full: 999,
} as const;

export const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
} as const;
