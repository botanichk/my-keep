import { Tag, Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function LabelPicker({ labels, selectedIds, onChange, onCreateLabel, onDeleteLabel }) {
  const [newLabel, setNewLabel] = useState('');

  const toggle = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  const handleCreate = () => {
    if (!newLabel.trim()) return;
    onCreateLabel(newLabel.trim());
    setNewLabel('');
  };

  return (
    <div className="p-3 min-w-52">
      <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">Метки</p>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {labels.map((label) => (
          <div key={label.id} className="flex items-center group">
            <button
              onClick={() => toggle(label.id)}
              className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded-lg hover:bg-[#FAE8D8] transition text-left"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: label.color }}
              />
              <span className="text-sm text-[#1C1917] flex-1">{label.name}</span>
              {selectedIds.includes(label.id) && (
                <span className="text-[#D4763B] text-xs font-bold">✓</span>
              )}
            </button>
            <button
              onClick={() => onDeleteLabel?.(label.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-[#A8A29E] hover:text-red-500 transition"
              title="Удалить метку"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {labels.length === 0 && (
          <p className="text-xs text-[#A8A29E] px-2">Меток пока нет</p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-3 border-t border-[#E8E0D4] pt-3">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Новая метка..."
          className="flex-1 text-xs bg-[#EDE8DF] rounded-lg px-2 py-1.5 outline-none
                     focus:ring-1 focus:ring-[#D4763B] placeholder-[#A8A29E]"
        />
        <button
          onClick={handleCreate}
          className="p-1.5 rounded-lg bg-[#D4763B] text-white hover:bg-[#C2662B] transition"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
