import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                    flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl
                    bg-[#1C1917] text-white text-sm font-medium
                    animate-[slideIn_0.2s_ease]">
      <CheckCircle size={16} className="text-[#D4763B]" />
      {message}
    </div>
  );
}
