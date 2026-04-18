export const LIGHT = {
  pageBg: 'linear-gradient(135deg, #F5F0FF 0%, #FFF8F5 40%, #F0FDF9 100%)',
  navBg: 'rgba(255,255,255,0.88)',
  navBorder: '#EDE9FE',
  cardBg: 'white',
  cardBorder: '#EDE9FE',
  cardBorderStrong: '#C4B5FD',
  text: '#1E1B4B',
  textSub: '#4B5563',
  textMuted: '#6B7280',
  // Previous #9CA3AF on white was ~2.6:1 — fails WCAG AA. #6B7280 hits 4.8:1.
  textFaint: '#6B7280',
  inputBg: '#F9F7FF',
  inputBorder: '#E0E7FF',
  clueBg: 'linear-gradient(135deg, #F9F7FF, #F0F9FF)',
  clueAreaBorder: '#E0E7FF',
  hintAreaBg: 'rgba(255,255,255,0.7)',
  shareCardBg: '#F9F7FF',
  shareCardBorder: '#C4B5FD',
  stickyNavBg: 'rgba(245,240,255,0.94)',
  tableRowHover: '#F9F7FF',
  tableHeaderBg: '#F9F7FF',
  tableRowBorder: '#F3F4F6',
  successBg: '#ECFDF5',
  successBorder: '#6EE7B7',
  wrongBg: '#FFF1F2',
  wrongBorder: '#FCA5A5',
  streakBg: '#FFF7ED',
  streakBorder: '#FED7AA',
  mobileBarBg: 'rgba(255,255,255,0.97)',
};

export const DARK = {
  pageBg: 'linear-gradient(135deg, #0D0820 0%, #180F38 50%, #08151F 100%)',
  navBg: 'rgba(13,8,32,0.94)',
  navBorder: '#2D1B69',
  cardBg: '#1A1035',
  cardBorder: '#3D2A6B',
  cardBorderStrong: '#5C3D9A',
  text: '#F0EAFF',
  textSub: '#C4B5FD',
  textMuted: '#9381CC',
  // Previous #6D5FA8 on dark bg dipped below 4.5:1. Lighter purple passes AA comfortably.
  textFaint: '#A78BFA',
  inputBg: '#261845',
  inputBorder: '#4C3580',
  clueBg: 'linear-gradient(135deg, #261845, #162038)',
  clueAreaBorder: '#4C3580',
  hintAreaBg: 'rgba(26,16,53,0.8)',
  shareCardBg: '#261845',
  shareCardBorder: '#4C3580',
  stickyNavBg: 'rgba(13,8,32,0.96)',
  tableRowHover: '#261845',
  tableHeaderBg: '#261845',
  tableRowBorder: '#2D1B69',
  successBg: '#0A2520',
  successBorder: '#10B981',
  wrongBg: '#2A0F15',
  wrongBorder: '#F87171',
  streakBg: '#2A1A08',
  streakBorder: '#92400E',
  mobileBarBg: 'rgba(13,8,32,0.97)',
};

export type Theme = typeof LIGHT;

export function getTheme(isDark: boolean): Theme {
  return isDark ? DARK : LIGHT;
}
