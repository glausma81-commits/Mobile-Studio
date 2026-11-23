import { useEffect } from 'react';
import { Info, X } from 'lucide-react';
import type { ServiceItem } from '../types/photography';

interface ServiceInfoModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onRequestBooking: () => void;
}

export function ServiceInfoModal({
  service,
  onClose,
  onRequestBooking,
}: ServiceInfoModalProps) {
  useEffect(() => {
    if (!service) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [service, onClose]);

  if (!service || !service.infoParagraphs || service.infoParagraphs.length === 0) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-info-heading"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/65 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-[#EDD6DC] bg-[#F9EEF1] p-6 shadow-xl sm:p-8 dark:border-zinc-800 dark:bg-[#18181B]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Infobox schließen"
          className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-lg text-black/75 transition-colors hover:bg-[#F7E8EC] hover:text-black dark:text-[#B96C80] dark:hover:bg-zinc-800 dark:hover:text-[#D9859B] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F3A58]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-black dark:text-[#B96C80]">
          <Info className="h-3.5 w-3.5 text-[#9F3A58] dark:text-[#D9859B]" aria-hidden="true" />
          <span>Ablauf &amp; Hinweise · {service.number}</span>
        </div>

        <h2
          id="service-info-heading"
          className="mt-2 font-display text-3xl font-semibold tracking-tight text-black dark:text-[#D9859B]"
        >
          {service.title}
        </h2>
        <p className="mt-1 text-xs font-medium italic text-black/80 dark:text-[#B96C80]">
          {service.subtitle}
        </p>

        <div className="mt-5 space-y-4 border-t border-[#EDD6DC] pt-5 dark:border-zinc-800">
          {service.infoParagraphs.map((paragraph, idx) => (
            <p
              key={idx}
              className="text-sm leading-relaxed italic text-black dark:text-[#C77389]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#EDD6DC] pt-5 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#E3C4CC] bg-[#FFFDFD] px-4 py-2 text-xs font-medium text-black transition-colors hover:border-[#D4A7B3] hover:bg-[#F7E8EC] dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:hover:border-zinc-600 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Schließen
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestBooking();
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#9F3A58] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#882F4A] dark:bg-zinc-100 dark:text-[#7D2B43] dark:hover:bg-white cursor-pointer"
          >
            Termin anfragen
          </button>
        </div>
      </div>
    </div>
  );
}
