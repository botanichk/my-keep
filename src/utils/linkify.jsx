// Превращает текст со ссылками в JSX с кликабельными <a>
export function linkify(text) {
  if (!text) return null;

  // Регулярка для URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0; // сбрасываем регулярку
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()} // не открывать модалку
          className="text-[#D4763B] underline underline-offset-2 hover:text-[#C2662B] transition break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
