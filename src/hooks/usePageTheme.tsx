import { useTheme } from '@/contexts/ThemeContext';

/**
 * usePageTheme
 * Reads isDark from the top-level ThemeContext.
 * Returns semantic colour tokens every page needs.
 */
export const usePageTheme = () => {
  const { isDark } = useTheme();

  return {
    isDark,
    heading:  isDark ? '#ffffff'                   : '#0f0f0f',
    subtext:  isDark ? '#9ca3af'                   : '#6b7280',
    muted:    isDark ? '#6b7280'                   : '#9ca3af',
    cardBg:   isDark ? 'rgba(255,255,255,0.04)'    : 'rgba(255,255,255,0.65)',
    cardBdr:  isDark ? 'rgba(255,255,255,0.10)'    : 'rgba(255,255,255,0.80)',
    rowBdr:   isDark ? 'rgba(93,0,242,0.10)'       : 'rgba(0,0,0,0.07)',
    rowHover: isDark ? 'rgba(255,255,255,0.03)'    : 'rgba(0,0,0,0.03)',
    inputBg:  isDark ? 'rgba(255,255,255,0.05)'    : 'rgba(0,0,0,0.05)',
    inputBdr: isDark ? 'rgba(255,255,255,0.10)'    : 'rgba(0,0,0,0.10)',
  };
};