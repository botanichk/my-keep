// Иконка: лист с загнутым углом — стиль Claude AI Mobile
export default function AppIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Фон — тёплый оранжевый круг */}
      <rect width="32" height="32" rx="9" fill="#D4763B" />

      {/* Лист бумаги */}
      <path
        d="M9 8h10l4 4v12a1 1 0 01-1 1H9a1 1 0 01-1-1V9a1 1 0 011-1z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Загнутый угол */}
      <path
        d="M19 8l4 4h-3a1 1 0 01-1-1V8z"
        fill="#C2662B"
        fillOpacity="0.6"
      />

      {/* Строчки текста */}
      <rect x="11" y="14" width="8" height="1.5" rx="0.75" fill="#D4763B" />
      <rect x="11" y="17" width="6" height="1.5" rx="0.75" fill="#D4763B" fillOpacity="0.6" />
      <rect x="11" y="20" width="7" height="1.5" rx="0.75" fill="#D4763B" fillOpacity="0.4" />
    </svg>
  );
}
