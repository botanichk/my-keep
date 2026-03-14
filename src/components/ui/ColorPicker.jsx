import { NOTE_COLORS } from '../../theme';
import { Check } from 'lucide-react';

export default function ColorPicker({ current, onChange }) {
  return (
    <div
      style={{ width: '280px' }}
      className="flex flex-row items-center gap-2 px-3 py-3 overflow-x-auto"
    >
      {NOTE_COLORS.map((c) => (
        <button
          key={c.hex}
          title={c.label}
          onClick={() => onChange(c.hex)}
          style={{
            backgroundColor: c.hex,
            minWidth: '28px',
            minHeight: '28px',
            flexShrink: 0,
          }}
          className={`relative rounded-full border-2 transition-transform hover:scale-110
            ${current === c.hex
              ? 'border-[#D4763B] scale-110'
              : c.hex === '#1C1917' ? 'border-[#78716C]' : 'border-[#E8E0D4]'
            }`}
        >
          {current === c.hex && (
            <Check
              size={12}
              className={`absolute inset-0 m-auto
                ${c.hex === '#1C1917' ? 'text-white' : 'text-[#D4763B]'}`}
            />
          )}
        </button>
      ))}
    </div>
  );
}
