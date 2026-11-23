import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface ProtectedCanvasProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain';
  showCornerMark?: boolean;
  onProtectedAttempt?: () => void;
}

export function ProtectedCanvas({
  src,
  alt,
  className = '',
  objectFit = 'cover',
  showCornerMark = false,
  onProtectedAttempt,
}: ProtectedCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');

    const img = new Image();
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      if (!active) return;
      imageRef.current = img;
      setStatus('loaded');
    };
    img.onerror = () => {
      if (!active) return;
      imageRef.current = null;
      setStatus('error');
    };
    img.src = src;

    return () => {
      active = false;
    };
  }, [src]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!container || !canvas || !img || status !== 'loaded') return;

    const draw = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = Math.round(rect.width * dpr);
      const targetHeight = Math.round(rect.height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, targetWidth, targetHeight);

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = targetWidth / targetHeight;

      let drawWidth = targetWidth;
      let drawHeight = targetHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (objectFit === 'cover') {
        if (imgRatio > boxRatio) {
          drawHeight = targetHeight;
          drawWidth = drawHeight * imgRatio;
          offsetX = (targetWidth - drawWidth) / 2;
        } else {
          drawWidth = targetWidth;
          drawHeight = drawWidth / imgRatio;
          offsetY = (targetHeight - drawHeight) / 2;
        }
      } else {
        if (imgRatio > boxRatio) {
          drawWidth = targetWidth;
          drawHeight = drawWidth / imgRatio;
          offsetY = (targetHeight - drawHeight) / 2;
        } else {
          drawHeight = targetHeight;
          drawWidth = drawHeight * imgRatio;
          offsetX = (targetWidth - drawWidth) / 2;
        }
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      if (showCornerMark) {
        const fontSize = Math.max(11 * dpr, Math.round(targetWidth * 0.014));
        ctx.save();
        ctx.font = `500 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        const markText = '© Mobile Studio by Martin · Ansicht geschützt';
        const padX = Math.max(14 * dpr, (targetWidth - Math.min(targetWidth, drawWidth)) / 2 + 16 * dpr);
        const padY = Math.max(12 * dpr, (targetHeight - Math.min(targetHeight, drawHeight)) / 2 + 14 * dpr);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 4 * dpr;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.fillText(markText, targetWidth - padX, targetHeight - padY);
        ctx.restore();
      }
    };

    draw();

    const observer = new ResizeObserver(() => {
      draw();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [status, objectFit, showCornerMark]);

  const handleBlockedInteraction = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onProtectedAttempt?.();
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={alt}
      onContextMenu={handleBlockedInteraction}
      onDragStart={handleBlockedInteraction}
      className={`protected-media relative overflow-hidden select-none bg-[#F7E8EC] dark:bg-zinc-900 ${className}`}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7E8EC] text-black/40 dark:bg-zinc-900 dark:text-[#B96C80]/60">
          <Camera className="h-5 w-5 opacity-40" aria-hidden="true" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F7E8EC] px-6 text-center text-black dark:bg-zinc-900 dark:text-[#C77389]">
          <Camera className="h-6 w-6 text-black/60 dark:text-[#B96C80]" aria-hidden="true" />
          <span className="text-xs font-medium text-black dark:text-[#D9859B]">{alt}</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`block h-full w-full transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Transparent shield overlay prevents drag-and-drop or direct canvas saving */}
      <div
        aria-hidden="true"
        onContextMenu={handleBlockedInteraction}
        onDragStart={handleBlockedInteraction}
        className="absolute inset-0 z-10 bg-transparent"
      />
    </div>
  );
}
