import { Search, X, Menu, LayoutList, LayoutGrid } from 'lucide-react';
import AppIcon from '../ui/AppIcon';

export default function Header({ search, onSearch, onMenuToggle, listView, onListViewToggle }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#F5F0E8] border-b border-[#E8E0D4] h-14 flex items-center px-4 gap-3">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl hover:bg-[#EDE8DF] text-[#78716C] lg:hidden transition"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 min-w-max">
        <AppIcon size={28} />
        <span className="text-base font-semibold text-[#1C1917] hidden sm:block">My Keep</span>
      </div>

      <div className="flex-1 max-w-xl mx-auto relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
        <input
          type="text"
          placeholder="Поиск заметок..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-[#EDE8DF] hover:bg-[#E8E0D4] focus:bg-white focus:shadow-md
                     rounded-xl pl-9 pr-8 py-2 text-sm outline-none transition
                     focus:ring-1 focus:ring-[#D4763B] placeholder-[#A8A29E]"
        />
        {search && (
          <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#D4763B]">
            <X size={14} />
          </button>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onPointerDown={(e) => { e.preventDefault(); onListViewToggle(); }}
        className="p-2 rounded-xl bg-transparent text-[#78716C] cursor-pointer select-none active:bg-[#EDE8DF]"
        title={listView ? 'Показать сетку' : 'Показать список'}
      >
        {listView ? <LayoutList size={18} /> : <LayoutGrid size={18} />}
      </div>
    </header>
  );
}
