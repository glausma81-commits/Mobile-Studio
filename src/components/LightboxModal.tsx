import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, X } from 'lucide-react';
import type { ShowcasePhoto } from '../types/photography';
import { ProtectedCanvas } from './ProtectedCanvas';

interface LightboxModalProps {
  photos: ShowcasePhoto[];
  currentIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onProtectedAttempt: () => void;
}

export function LightboxModal({
  photos,
  currentIndex,
  onClose,
  onSelectIndex,
  onProtectedAttempt,
}: LightboxModalProps) {
  const isOpen = currentIndex !== null && photos[currentIndex] !== undefined;
  const photo = isOpen && currentIndex !== null ? photos[currentIndex] : null;

  useEffect(() => {
    if (!isOpen || currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onSelectIndex((currentIndex + 1) % photos.length);
      } else if (e.key === 'ArrowLeft') {
        onSelectIndex((currentIndex - 1 + photos.length) % photos.length);
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        onProtectedAttempt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, currentIndex, photos.length, onClose, onSelectIndex, onProtectedAttempt]);

  if (!isOpen || !photo || currentIndex === null) {
    return null;
  }

  const handlePrev = () => {
    onSelectIndex((currentIndex - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    onSelectIndex((currentIndex + 1) % photos.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Großansicht: ${photo.title}`}
      onContextMenu={(e) => {
        e.preventDefault();
        onProtectedAttempt();
      }}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 text-zinc-100 backdrop-blur-sm"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 px-5 py-4 lg:px-10">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="tabular-nums font-medium text-zinc-200">
            {String(currentIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </span>
          <span aria-hidden="true">·</span>
          <span>{photo.category}</span>
          <span aria-hidden="true" className="hidden sm:inline">
            ·
          </span>
          <span className="hidden sm:inline">
            {photo.location}, {photo.year}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400">
            <Lock className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
            <span>Ansicht geschützt — kein öffentlicher Download</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Großansicht schließen"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Frame */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:px-14 lg:px-20">
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Vorheriges Foto"
            className="absolute left-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white sm:left-6 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div className="relative h-full w-full max-w-5xl">
          <ProtectedCanvas
            src={photo.imageUrl}
            alt={photo.title}
            objectFit="contain"
            showCornerMark
            onProtectedAttempt={onProtectedAttempt}
            className="h-full w-full bg-transparent"
          />
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Nächstes Foto"
            className="absolute right-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-200 transition-colors hover:bg-zinc-800 hover:text-white sm:right-6 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Bottom Metadata Bar */}
      <div className="border-t border-zinc-800/80 bg-zinc-950/90 px-5 py-4 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-editorial text-2xl font-medium tracking-tight text-white">
              {photo.title}
            </h3>
            <p className="mt-0.5 max-w-2xl text-xs leading-relaxed italic text-zinc-400">
              {photo.caption}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 tabular-nums shrink-0">
            <span>{photo.exif.camera}</span>
            <span aria-hidden="true">·</span>
            <span>{photo.exif.lens}</span>
            <span aria-hidden="true">·</span>
            <span>{photo.exif.aperture}</span>
            <span aria-hidden="true">·</span>
            <span>{photo.exif.shutter}</span>
            <span aria-hidden="true">·</span>
            <span>{photo.exif.iso}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
