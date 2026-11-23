import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigateSection: (sectionId: string) => void;
}

export function Navbar({ onNavigateSection }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'galerie', label: 'Galerie' },
    { id: 'leistungen', label: 'Leistungen' },
    { id: 'kontakt', label: 'Kontakt' },
  ];

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#EDD6DC]/90 bg-[#F9EEF1]/95 backdrop-blur-md transition-colors duration-200 dark:border-zinc-800/80 dark:bg-[#111113]/95">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-8 px-6 lg:px-10">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('top')}
          className="font-display text-xl font-semibold tracking-tight text-black dark:text-[#D9859B] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9F3A58] dark:focus-visible:outline-[#D9859B]"
        >
          Mobile Studio by Martin
        </button>

        {/* Zone 2: 3 concise single-line nav links */}
        <nav
          aria-label="Hauptnavigation"
          className="hidden md:flex items-center gap-8 font-display text-base font-medium text-black dark:text-[#C77389]"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="relative py-1 font-display text-black transition-colors duration-150 hover:text-black/70 dark:text-[#C77389] dark:hover:text-[#E59DB0] whitespace-nowrap shrink-0 cursor-pointer after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-black dark:after:bg-[#D9859B] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9F3A58] dark:focus-visible:outline-[#D9859B]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('kontakt')}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#9F3A58] px-4 py-2 font-display text-sm font-semibold tracking-wide text-white transition-colors duration-150 hover:bg-[#882F4A] dark:bg-zinc-100 dark:text-[#7D2B43] dark:hover:bg-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F3A58]"
          >
            Termin anfragen
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E3C4CC] text-black transition-colors hover:bg-[#F7E8EC] dark:border-zinc-800 dark:text-[#D9859B] dark:hover:bg-zinc-800 md:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F3A58]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#EDD6DC] bg-[#F9EEF1] px-6 py-5 dark:border-zinc-800 dark:bg-[#111113] md:hidden">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="flex min-h-11 items-center justify-between border-b border-[#F2DFE4] py-2.5 text-left font-display text-lg font-medium text-black hover:text-black/70 dark:border-zinc-800/70 dark:text-[#D9859B] dark:hover:text-[#E59DB0] cursor-pointer"
              >
                <span>{item.label}</span>
              </button>
            ))}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleNavClick('kontakt')}
                className="flex min-h-11 w-full items-center justify-center rounded-lg bg-[#9F3A58] px-4 py-2.5 font-display text-base font-semibold tracking-wide text-white hover:bg-[#882F4A] dark:bg-zinc-100 dark:text-[#7D2B43] dark:hover:bg-white cursor-pointer"
              >
                Termin anfragen
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
