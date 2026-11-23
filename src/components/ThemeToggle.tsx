import { Moon, Sun } from 'lucide-react';

export type ThemeMode = 'light' | 'dark';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: (next: ThemeMode) => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Farbschema wählen"
      className="inline-flex items-center gap-1 rounded-lg border border-[#EAD2D8] bg-[#F7E8EC] p-1 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <button
        type="button"
        onClick={() => onToggle('light')}
        aria-pressed={theme === 'light'}
        className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F3A58] ${
          theme === 'light'
            ? 'bg-[#FFFDFD] text-black shadow-xs'
            : 'text-black/75 hover:text-black dark:text-[#B96C80] dark:hover:text-[#D9859B]'
        }`}
      >
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Hell</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle('dark')}
        aria-pressed={theme === 'dark'}
        className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F3A58] ${
          theme === 'dark'
            ? 'bg-zinc-800 text-[#D9859B] shadow-xs'
            : 'text-black/75 hover:text-black dark:text-[#B96C80] dark:hover:text-[#D9859B]'
        }`}
      >
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Dunkel</span>
      </button>
    </div>
  );
}
