// src/theme.js — единый источник цветов
export const theme = {
  // Фоны
  bg:         '#F5F0E8',   // кремовый фон
  bgCard:     '#FDFAF5',   // светлее для карточек
  bgSidebar:  '#EDE8DF',   // боковая панель

  // Акценты
  accent:     '#D4763B',   // тёплый оранжевый
  accentHov:  '#C2662B',   // темнее при hover
  accentSoft: '#FAE8D8',   // светлый оранжевый

  // Текст
  textPrim:   '#1C1917',   // почти чёрный
  textSec:    '#78716C',   // серо-коричневый
  textMuted:  '#A8A29E',   // muted

  // Границы
  border:     '#E8E0D4',   // тёплая граница
  borderFoc:  '#D4763B',   // граница в фокусе

  // Статусные
  danger:     '#DC2626',
  success:    '#16A34A',
};

// Цвета карточек (тёплая палитра)
export const NOTE_COLORS = [
  { hex: '#FDFAF5', label: 'Дефолт' },
  { hex: '#FAE8D8', label: 'Персик' },
  { hex: '#FEF3C7', label: 'Ваниль' },
  { hex: '#ECFDF5', label: 'Мята' },
  { hex: '#F0F9FF', label: 'Лёд' },
  { hex: '#FDF4FF', label: 'Лаванда' },
  { hex: '#FFF1F2', label: 'Роза' },
  { hex: '#F1F5F9', label: 'Пепел' },
  { hex: '#FFFBEB', label: 'Мёд' },
  { hex: '#F7FEE7', label: 'Лайм' },
  { hex: '#EFF6FF', label: 'Сапфир' },
  { hex: '#1C1917', label: 'Ночь' },
];
