export default function EmptyState({ view }) {
  const states = {
    notes:   { emoji: '📝', text: 'Заметок пока нет', sub: 'Нажмите на поле выше, чтобы создать первую' },
    archive: { emoji: '🗄️', text: 'Архив пуст',      sub: 'Архивируйте заметки — они сохранятся здесь' },
    folder:  { emoji: '📁', text: 'Папка пуста',      sub: 'Создайте заметку и переместите её сюда' },
    search:  { emoji: '🔍', text: 'Ничего не найдено', sub: 'Попробуйте другой запрос' },
    label:   { emoji: '🏷️', text: 'Нет заметок с этой меткой', sub: 'Добавьте метку к заметке' },
  };

  const s = states[view] || states.notes;
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4">{s.emoji}</span>
      <p className="text-[#1C1917] font-medium">{s.text}</p>
      <p className="text-sm text-[#A8A29E] mt-1">{s.sub}</p>
    </div>
  );
}
