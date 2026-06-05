// 柯基配色主题 - 基于oklch色彩空间
// 原型中使用的颜色值，转换为React Native可用的格式

export const Colors = {
  // 背景色
  bg: '#FDFBF7',           // oklch(97% 0.008 80)
  bgDeep: '#F8F4ED',       // oklch(95% 0.012 80)
  surface: '#FFFFFF',      // oklch(100% 0 0)
  surfaceRaised: '#F5F1E8',// oklch(96% 0.01 80)
  surfaceCard: '#FFFFFF',  // oklch(100% 0 0)

  // 前景色
  fg: '#2A2520',           // oklch(12% 0.02 60)
  fg2: '#4A4540',          // oklch(30% 0.015 60)
  muted: '#7A7570',        // oklch(50% 0.015 60)
  mutedLight: '#9A9590',   // oklch(65% 0.01 60)

  // 边框色
  border: '#E0DCD5',       // oklch(88% 0.01 80)
  borderLight: '#EBE8E2',  // oklch(92% 0.008 80)

  // 强调色（柯基橙）
  accent: '#D4A853',       // oklch(72% 0.18 80)
  accentDim: '#B8903A',    // oklch(60% 0.16 75)
  accentGlow: 'rgba(212, 168, 83, 0.15)',

  // 状态色
  success: '#5AA85A',      // oklch(55% 0.16 150)
  successDim: '#3D8A3D',   // oklch(42% 0.12 150)
  warn: '#D4A853',         // oklch(70% 0.18 75)
  warnDim: '#B8903A',      // oklch(55% 0.14 75)
  danger: '#CC4444',       // oklch(55% 0.22 25)
  dangerDim: '#AA3333',    // oklch(42% 0.16 25)

  // 特色色
  coral: '#CC6644',        // oklch(58% 0.18 35)
  teal: '#4488AA',         // oklch(52% 0.14 185)
  purple: '#8855CC',       // oklch(55% 0.20 300)
  pink: '#CC5577',         // oklch(60% 0.20 350)
  gold: '#D4A853',         // oklch(70% 0.16 80)
  goldDim: '#B8903A',      // oklch(55% 0.12 75)

  // 柯基特色色
  corgiBrown: '#8B6914',   // oklch(45% 0.12 55)
  corgiCream: '#F0E8D0',   // oklch(92% 0.04 80)
};
