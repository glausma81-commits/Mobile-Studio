import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Expand,
  Info,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { LightboxModal } from './components/LightboxModal';
import { Navbar } from './components/Navbar';
import { ProtectedCanvas } from './components/ProtectedCanvas';
import { ServiceInfoModal } from './components/ServiceInfoModal';
import { ThemeToggle, type ThemeMode } from './components/ThemeToggle';
import {
  HERO_IMAGE_URL,
  SERVICES,
  SHOWCASE_PHOTOS,
} from './data/portfolioData';
import type { PhotoCategory, ServiceItem } from './types/photography';

const CATEGORIES: PhotoCategory[] = [
  'Alle',
  'Studio',
  'Charakter',
];

function getGalleryColumnClass(isAllFilter: boolean): string {
  return isAllFilter ? 'md:col-span-6 h-[360px] lg:h-[460px]' : 'h-[360px] lg:h-[460px]';
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('mobile-studio-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Ignore storage errors
  }
  return 'light';
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('Alle');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [protectionToastVisible, setProtectionToastVisible] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('mobile-studio-theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const [activeServiceInfo, setActiveServiceInfo] = useState<ServiceItem | null>(null);

  // Preiskalkulator-Zustand & Neues Preismodell
  const [calcLocation, setCalcLocation] = useState<'indoor' | 'outdoor'>('indoor');
  const [calcDuration, setCalcDuration] = useState<number>(4); // Standard: 4 h
  const [calcPeople, setCalcPeople] = useState<number>(1); // 1 bis 4 Personen
  // 1. Grundpreise nach Dauer
  const DURATION_PRICES: Record<number, number> = {
    2: 600,
    4: 800,
    6: 900,
    8: 950,
  };
  // 2. Degressiver Aufpreis für zusätzliche Personen (1 Person inklusive)
  // 1. Zusatzperson: +100 CHF | 2. Zusatzperson: +75 CHF | 3. Zusatzperson: +65 CHF
  const getExtraPeoplePrice = (people: number, duration: number): number => {
    if (duration < 4 || people <= 1) return 0;
    const additional = people - 1;
    if (additional === 1) return 100;
    if (additional === 2) return 175; // 100 + 75
    if (additional === 3) return 240; // 100 + 75 + 65
    return 240 + (additional - 3) * 60; // falls mehr als 4 Personen
  };
  const basePrice = DURATION_PRICES[calcDuration] || 800;
  const extraPeoplePrice = getExtraPeoplePrice(calcPeople, calcDuration);
  const calcTotal = basePrice + extraPeoplePrice;
  const additionalPeople = calcDuration >= 4 ? Math.max(0, calcPeople - 1) : 0;
  const handleDurationChange = (hours: number) => {
    setCalcDuration(hours);
    if (hours < 4) {
      setCalcPeople(1); // 2h bleibt auf 1 Person fokussiert
    }
  };
  const applyCalcToContact = () => {
    const locName = calcLocation === 'indoor' ? 'Indoor-Portraits' : 'Outdoor-Portraits';
    const detailText = `Paket: ${locName} (${calcDuration} Stunden)\nPersonen: ${calcPeople} Person(en)${
      additionalPeople > 0 ? ` (inkl. CHF ${extraPeoplePrice}.– für ${additionalPeople} Zusatzperson(en))` : ''
    }\nGeschätzter Richtpreis: CHF ${calcTotal.toLocaleString('de-CH')}.–`;
    setContactCategory(calcLocation === 'indoor' ? 'Indoorportrait' : 'Outdoor-Portraits');
    setContactPeopleCount(String(calcPeople));
    setContactMessage(
      `Hallo, ich interessiere mich für folgendes Angebot aus dem Preiskalkulator:\n\n${detailText}\n\n`
    );
    handleNavigateSection('kontakt');
  };

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPeopleCount, setContactPeopleCount] = useState('');
  const [contactCategory, setContactCategory] = useState('Indoorportrait');
  const [contactReferral, setContactReferral] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'Alle') {
      return SHOWCASE_PHOTOS;
    }
    return SHOWCASE_PHOTOS.filter((photo) => photo.category === selectedCategory);
  }, [selectedCategory]);

  const triggerProtectionNotice = useCallback(() => {
    setProtectionToastVisible(true);
  }, []);

  useEffect(() => {
    if (!protectionToastVisible) return;
    const timer = window.setTimeout(() => {
      setProtectionToastVisible(false);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [protectionToastVisible]);

  // Deter Ctrl+S / Cmd+S across the public showcase
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerProtectionNotice();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [triggerProtectionNotice]);

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFeedback(null);
    setContactSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          peopleCount: contactPeopleCount,
          category: contactCategory,
          referral: contactReferral,
          message: contactMessage,
          consent: contactConsent,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        reference?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setContactFeedback({
          type: 'error',
          text: data.error || 'Bitte überprüfen Sie Ihre Eingaben.',
        });
        return;
      }

      setContactFeedback({
        type: 'success',
        text: `Vielen Dank für Ihre Anfrage (Referenz ${data.reference}). Ich melde mich innerhalb von 24 Stunden persönlich bei Ihnen.`,
      });
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactPeopleCount('');
      setContactReferral('');
      setContactMessage('');
      setContactConsent(false);
    } catch {
      setContactFeedback({
        type: 'error',
        text: 'Anfrage konnte momentan nicht gesendet werden. Bitte versuchen Sie es erneut.',
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#F9EEF1] text-black transition-colors duration-200 dark:bg-[#111113] dark:text-[#D9859B]">
      <Navbar onNavigateSection={handleNavigateSection} />

      <main>
          {/* Split-Screen Hero */}
          <section className="mx-auto max-w-[1320px] px-6 pt-10 pb-14 lg:px-10 lg:pt-14 lg:pb-16">
            <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="flex flex-col justify-between py-2 lg:col-span-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-medium tracking-wide text-black dark:text-[#B96C80]">
                      Portraitfotografie &amp; Video-Portraits · Zug, Zürich &amp; ganze Schweiz
                    </p>
                    <ThemeToggle theme={theme} onToggle={setTheme} />
                  </div>
                  <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold tracking-[-0.01em] text-black dark:text-[#D9859B] leading-[1.06] sm:text-5xl lg:text-[4rem] [text-wrap:balance]">
                    Präzise Portraits voller Ausdruck und Schärfe.
                  </h1>
                  <p className="mt-6 max-w-lg text-base leading-relaxed italic text-black dark:text-[#C77389]">
                    Gestochen scharfe Einzel-, Charakter- und Video-Portraits mit klarer Lichtführung. Entdecken Sie ausgewählte Arbeiten in geschützter Ansicht und fragen Sie Ihr persönliches Shooting direkt an.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => handleNavigateSection('galerie')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#9F3A58] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#882F4A] dark:bg-zinc-100 dark:text-[#7D2B43] dark:hover:bg-white cursor-pointer whitespace-nowrap"
                  >
                    <span>Portraits ansehen</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigateSection('kontakt')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#E3C4CC] bg-[#FFFDFD] px-5 py-2.5 text-sm font-medium text-black transition-colors duration-150 hover:border-[#D4A7B3] hover:bg-[#F7E8EC] dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:hover:border-zinc-600 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
                  >
                    <span>Termin anfragen</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="h-[340px] sm:h-[420px] lg:h-full lg:min-h-[460px] overflow-hidden rounded-2xl border border-[#EDD6DC] bg-[#F7E8EC] dark:border-zinc-800 dark:bg-zinc-900">
                  <ProtectedCanvas
                    src={HERO_IMAGE_URL}
                    alt="Gestochen scharfes Studio-Portrait im gerichteten Schieferlicht"
                    onProtectedAttempt={triggerProtectionNotice}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Curated Protected Gallery */}
          <section id="galerie" className="border-t border-[#EDD6DC] dark:border-zinc-800 mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-medium text-black dark:text-[#B96C80]">
                  Kuratierte Portraitauswahl · 2026
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-black dark:text-[#D9859B] sm:text-[2.75rem] [text-wrap:balance]">
                  Ausgewählte Portraits
                </h2>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div
                  role="tablist"
                  aria-label="Galeriekategorien"
                  className="flex flex-wrap items-center gap-1 rounded-lg border border-[#EAD2D8] bg-[#F7E8EC] p-1 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {CATEGORIES.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#FFFDFD] text-black shadow-xs dark:bg-zinc-800 dark:text-[#D9859B]'
                            : 'text-black/75 hover:text-black dark:text-[#B96C80] dark:hover:text-[#E59DB0]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subtle Protection Notice */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#EDD6DC] pb-4 text-xs text-black dark:border-zinc-800 dark:text-[#B96C80]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#9F3A58] dark:text-[#D9859B] shrink-0" aria-hidden="true" />
                <span className="italic">
                  Öffentliche Galeriebilder sind vor Downloads und Direkt-Speicherung geschützt.
                </span>
              </div>
              <span className="tabular-nums text-black dark:text-[#B96C80]">
                {filteredPhotos.length} {filteredPhotos.length === 1 ? 'Aufnahme' : 'Aufnahmen'}
              </span>
            </div>

            {/* Responsive 2-Portrait Gallery Grid */}
            <div
              className={`mt-8 grid gap-6 ${
                selectedCategory === 'Alle'
                  ? 'grid-cols-1 md:grid-cols-12'
                  : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {filteredPhotos.map((photo, index) => (
                <article
                  key={photo.id}
                  className={`group flex flex-col ${getGalleryColumnClass(selectedCategory === 'Alle')}`}
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Großansicht öffnen: ${photo.title}`}
                    className="relative flex-1 overflow-hidden rounded-2xl border border-[#EDD6DC] bg-[#F7E8EC] text-left dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F3A58]"
                  >
                    <ProtectedCanvas
                      src={photo.imageUrl}
                      alt={`${photo.title} — ${photo.category} in ${photo.location}`}
                      onProtectedAttempt={triggerProtectionNotice}
                      className="h-full w-full transition-transform duration-300 group-hover:scale-[1.015]"
                    />

                    {/* Subtle hover scrim */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-20 flex items-end justify-between bg-gradient-to-t from-black/75 via-black/15 to-transparent p-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <div>
                        <p className="font-editorial text-xl font-medium text-white">
                          {photo.title}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-200 tabular-nums">
                          {photo.exif.camera} · {photo.exif.aperture}
                        </p>
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-xs">
                        <Expand className="h-4 w-4" />
                      </span>
                    </div>
                  </button>

                  {/* Clean unboxed metadata row */}
                  <div className="mt-3 flex items-baseline justify-between gap-4 px-0.5">
                    <h3 className="font-display text-lg font-semibold text-black dark:text-[#D9859B] truncate">
                      {photo.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-black/80 dark:text-[#B96C80] whitespace-nowrap shrink-0 tabular-nums">
                      <span>{photo.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{photo.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>{photo.year}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Services Section */}
          <section
            id="leistungen"
            className="border-t border-[#EDD6DC] bg-[#F9EEF1] py-16 transition-colors duration-200 dark:border-zinc-800 dark:bg-[#161619] lg:py-24"
          >
            <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-medium text-black dark:text-[#B96C80]">Arbeitsweise &amp; Angebot</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-black dark:text-[#D9859B] sm:text-[2.75rem] [text-wrap:balance]">
                    Präzise Bildsprache für Menschen und Persönlichkeiten
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-relaxed italic text-black dark:text-[#C77389]">
                  Jede Portraitserie entsteht im direkten Austausch — von der ersten Lichtsetzung bis zur finalen Bildauswahl.
                </p>
              </div>

              {/* 3-Column Services */}
              <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                {SERVICES.map((service) => (
                  <div
                    key={service.number}
                    className="flex flex-col justify-between rounded-2xl border border-[#EDD6DC] bg-[#FFFDFD] p-7 dark:border-zinc-800 dark:bg-[#1C1C20]"
                  >
                    <div>
                      <span className="font-display text-sm font-semibold text-black dark:text-[#D9859B] tabular-nums">
                        {service.number}
                      </span>
                      <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-black dark:text-[#D9859B]">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium italic text-black/80 dark:text-[#B96C80]">
                        {service.subtitle}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed italic text-black dark:text-[#C77389]">
                        {service.description}
                      </p>
                    </div>

                    {service.infoParagraphs && service.infoParagraphs.length > 0 && (
                      <div className="mt-6 border-t border-[#EDD6DC] pt-4 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setActiveServiceInfo(service)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#E3C4CC] bg-[#F9EEF1] px-3.5 py-2 text-xs font-medium text-black transition-colors hover:border-[#D4A7B3] hover:bg-[#F3DFE5] dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:hover:border-zinc-600 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Info className="h-3.5 w-3.5 text-[#9F3A58] dark:text-[#D9859B]" aria-hidden="true" />
                          <span>Wichtige Infos</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Preiskalkulator Box */}
              <div className="mt-8 rounded-2xl border border-[#EDD6DC] bg-[#FFFDFD] p-7 dark:border-zinc-800 dark:bg-[#1C1C20] shadow-sm">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#EDD6DC] dark:border-zinc-800 pb-6">
                  <div>
                    <span className="text-xs font-semibold tracking-wider uppercase text-[#9F3A58] dark:text-[#D9859B]">
                      Individuelle Kalkulation
                    </span>
                    <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-black dark:text-[#D9859B]">
                      Preiskalkulator
                    </h3>
                    <p className="mt-1 text-xs font-medium italic text-black/80 dark:text-[#B96C80]">
                      Wählen Sie Location, Dauer und Personenanzahl für eine transparente Richtpreis-Schätzung.
                    </p>
                  </div>
                  {/* Richtpreis Anzeige */}
                  <div className="flex items-baseline gap-2 rounded-xl border border-[#E3C4CC] bg-[#F9EEF1] px-5 py-3 dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-xs font-medium text-black/70 dark:text-zinc-400">Geschätzter Richtpreis:</span>
                    <span className="text-2xl font-bold font-display text-[#9F3A58] dark:text-[#D9859B]">
                      CHF {calcTotal.toLocaleString('de-CH')}.–
                    </span>
                  </div>
                </div>
                {/* 1. Location Umschalter */}
                <div className="mt-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black/70 dark:text-[#B96C80]">
                    1. Location wählen
                  </span>
                  <div className="grid grid-cols-2 gap-4 mt-2 max-w-md">
                    <button
                      type="button"
                      onClick={() => setCalcLocation('indoor')}
                      className={`py-3 px-4 rounded-xl border-2 font-display text-sm font-semibold transition-all cursor-pointer ${
                        calcLocation === 'indoor'
                          ? 'border-[#9F3A58] bg-[#F9EEF1] text-black dark:border-[#D9859B] dark:bg-[#9F3A58]/20 dark:text-[#D9859B]'
                          : 'border-[#EDD6DC] bg-white text-black/70 hover:border-[#D4A7B3] dark:border-zinc-800 dark:bg-[#161619] dark:text-zinc-300'
                      }`}
                    >
                      Studio / Indoor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCalcLocation('outdoor');
                        if (calcDuration < 4) setCalcDuration(4); // Outdoor startet ab 4 h
                      }}
                      className={`py-3 px-4 rounded-xl border-2 font-display text-sm font-semibold transition-all cursor-pointer ${
                        calcLocation === 'outdoor'
                          ? 'border-[#9F3A58] bg-[#F9EEF1] text-black dark:border-[#D9859B] dark:bg-[#9F3A58]/20 dark:text-[#D9859B]'
                          : 'border-[#EDD6DC] bg-white text-black/70 hover:border-[#D4A7B3] dark:border-zinc-800 dark:bg-[#161619] dark:text-zinc-300'
                      }`}
                    >
                      Outdoor / On-Location
                    </button>
                  </div>
                </div>
                {/* 2. Dauer Auswählen (2h, 4h, 6h, 8h) */}
                <div className="mt-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black/70 dark:text-[#B96C80]">
                    2. Zeitrahmen wählen
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    {/* 2h Option */}
                    {calcLocation === 'indoor' ? (
                      <div
                        onClick={() => handleDurationChange(2)}
                        className={`flex flex-col justify-between p-5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                          calcDuration === 2
                            ? 'border-[#9F3A58] bg-[#F9EEF1]/70 dark:border-[#D9859B] dark:bg-[#9F3A58]/20'
                            : 'border-[#EDD6DC] hover:border-[#D4A7B3] bg-white dark:border-zinc-800 dark:bg-[#161619]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-display text-lg font-semibold text-black dark:text-[#D9859B]">2 Stunden</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">1 Person</span>
                          </div>
                          <p className="mt-2 text-xs italic text-black/80 dark:text-[#C77389]">
                            Kompaktes Portrait-Shooting, ideal für Einzelpersonen.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#EDD6DC]/70 dark:border-zinc-800">
                          <span className="font-display text-base font-bold text-black dark:text-[#D9859B]">CHF 600.–</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-center items-center text-center">
                        <span className="text-xs font-medium text-zinc-400">Outdoor ab 4 h möglich</span>
                        <p className="text-[11px] text-zinc-400 mt-1">Für optimale Flexibilität bei Licht & Location.</p>
                      </div>
                    )}
                    {/* 4h Option */}
                    <div
                      onClick={() => handleDurationChange(4)}
                      className={`flex flex-col justify-between p-5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                        calcDuration === 4
                          ? 'border-[#9F3A58] bg-[#F9EEF1]/70 dark:border-[#D9859B] dark:bg-[#9F3A58]/20'
                          : 'border-[#EDD6DC] hover:border-[#D4A7B3] bg-white dark:border-zinc-800 dark:bg-[#161619]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-display text-lg font-semibold text-black dark:text-[#D9859B]">4 Stunden</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">Mehrpersonen mgl.</span>
                        </div>
                        <p className="mt-2 text-xs italic text-black/80 dark:text-[#C77389]">
                          Ausführliche Session mit Outfit- & Set-Wechseln.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EDD6DC]/70 dark:border-zinc-800">
                        <span className="font-display text-base font-bold text-black dark:text-[#D9859B]">CHF 800.–</span>
                      </div>
                    </div>
                    {/* 6h Option (NEU) */}
                    <div
                      onClick={() => handleDurationChange(6)}
                      className={`flex flex-col justify-between p-5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                        calcDuration === 6
                          ? 'border-[#9F3A58] bg-[#F9EEF1]/70 dark:border-[#D9859B] dark:bg-[#9F3A58]/20'
                          : 'border-[#EDD6DC] hover:border-[#D4A7B3] bg-white dark:border-zinc-800 dark:bg-[#161619]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-display text-lg font-semibold text-black dark:text-[#D9859B]">6 Stunden</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">Erweitert</span>
                        </div>
                        <p className="mt-2 text-xs italic text-black/80 dark:text-[#C77389]">
                          Viel Zeit für verschiedene Stile, Looks und kleine Teams.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EDD6DC]/70 dark:border-zinc-800">
                        <span className="font-display text-base font-bold text-black dark:text-[#D9859B]">CHF 900.–</span>
                      </div>
                    </div>
                    {/* 8h Option */}
                    <div
                      onClick={() => handleDurationChange(8)}
                      className={`flex flex-col justify-between p-5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                        calcDuration === 8
                          ? 'border-[#9F3A58] bg-[#F9EEF1]/70 dark:border-[#D9859B] dark:bg-[#9F3A58]/20'
                          : 'border-[#EDD6DC] hover:border-[#D4A7B3] bg-white dark:border-zinc-800 dark:bg-[#161619]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-display text-lg font-semibold text-black dark:text-[#D9859B]">8 Stunden</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">Ganztag</span>
                        </div>
                        <p className="mt-2 text-xs italic text-black/80 dark:text-[#C77389]">
                          Volle kreative Freiheit für Teams oder umfangreiche Serien.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#EDD6DC]/70 dark:border-zinc-800">
                        <span className="font-display text-base font-bold text-black dark:text-[#D9859B]">CHF 950.–</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 3. Personenanzahl (Interaktiver Zähler mit degressiver Staffelung) */}
                <div className="mt-8 pt-6 border-t border-[#EDD6DC] dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-black/70 dark:text-[#B96C80]">
                      3. Anzahl teilnehmende Personen
                    </span>
                    <p className="text-xs italic text-black/60 dark:text-[#B96C80] mt-0.5">
                      {calcDuration >= 4 ? (
                        <span>
                          1 Person inkl. | +1 Pers: <strong>+CHF 100.–</strong> | +2 Pers: <strong>+CHF 175.–</strong> (+75) | +3 Pers: <strong>+CHF 240.–</strong> (+65)
                        </span>
                      ) : (
                        'Bei 2-Stunden-Shootings auf 1 Person fokussiert (Gruppen ab 4 Stunden buchbar).'
                      )}
                    </p>
                  </div>
                  {/* Plus/Minus Zähler (1 bis 4 Personen) */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={calcPeople <= 1 || calcDuration < 4}
                      onClick={() => setCalcPeople((p) => Math.max(1, p - 1))}
                      className="h-10 w-10 rounded-lg border border-[#EDD6DC] bg-white dark:border-zinc-700 dark:bg-zinc-800 flex items-center justify-center font-bold text-lg text-black dark:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    >
                      −
                    </button>
                    <div className="flex flex-col items-center min-w-16">
                      <span className="font-display text-lg font-bold text-black dark:text-[#D9859B]">
                        {calcPeople} {calcPeople === 1 ? 'Person' : 'Personen'}
                      </span>
                      {additionalPeople > 0 && (
                        <span className="text-[11px] font-semibold text-[#9F3A58] dark:text-[#D9859B]">
                          (+ CHF {extraPeoplePrice}.–)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={calcDuration < 4 || calcPeople >= 4}
                      onClick={() => setCalcPeople((p) => Math.min(4, p + 1))}
                      className="h-10 w-10 rounded-lg border border-[#EDD6DC] bg-white dark:border-zinc-700 dark:bg-zinc-800 flex items-center justify-center font-bold text-lg text-black dark:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Footer mit Anfrage-Button */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDD6DC] dark:border-zinc-800">
                  <span className="text-xs italic text-black/60 dark:text-[#B96C80] text-center sm:text-left">
                    * Unverbindliche Richtpreis-Schätzung inkl. digitaler Bildabgabe & Vorbesprechung.
                  </span>
                  <button
                    type="button"
                    onClick={applyCalcToContact}
                    className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-[#9F3A58] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#882F4A] cursor-pointer shadow-sm dark:bg-zinc-100 dark:text-[#7D2B43] dark:hover:bg-white"
                  >
                    Auswahl ins Kontaktformular übernehmen →
                  </button>
                </div>
              </div>
              </div>
          </section>

          {/* Contact / Booking Inquiry */}
          <section id="kontakt" className="border-t border-[#EDD6DC] dark:border-zinc-800 mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-xs font-medium text-black dark:text-[#B96C80]">Projektanfrage</p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-black dark:text-[#D9859B] sm:text-[2.75rem] [text-wrap:balance]">
                  Lassen Sie uns über Ihr Projekt sprechen.
                </h2>
                <p className="mt-4 text-sm leading-relaxed italic text-black dark:text-[#C77389]">
                  Ob Indoorportrait, Outdoor-Portrait oder Video-Portrait — schildern Sie mir kurz Ihren Zeitrahmen und Ihre Vorstellungen.
                </p>

                <div className="mt-8 space-y-4 border-t border-[#EDD6DC] pt-6 text-sm text-black dark:border-zinc-800 dark:text-[#C77389]">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-[#9F3A58] dark:text-[#B96C80] shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-black dark:text-[#D9859B]">Mobiles Studio, Zug, Zürich &amp; ganze Schweiz</p>
                      <p className="text-xs italic text-black/80 dark:text-[#B96C80]">Vor-Ort-Termine nach Vereinbarung · Antwortzeit in der Regel innerhalb eines Werktags</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <form
                  onSubmit={handleContactSubmit}
                  className="rounded-2xl border border-[#EDD6DC] bg-[#FFFDFD] p-6 sm:p-8 dark:border-zinc-800 dark:bg-[#18181B]"
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-medium text-black dark:text-[#D9859B]">
                        Ihr Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Clara Hofmann"
                        className="mt-1.5 w-full rounded-lg border border-[#E3C4CC] bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:border-[#9F3A58] focus:outline-none focus:ring-2 focus:ring-[#9F3A58]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:placeholder:text-[#B96C80]/60 dark:focus:border-[#D9859B] dark:focus:ring-[#D9859B]/20"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-medium text-black dark:text-[#D9859B]">
                        E-Mail-Adresse
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="clara@beispiel.de"
                        className="mt-1.5 w-full rounded-lg border border-[#E3C4CC] bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:border-[#9F3A58] focus:outline-none focus:ring-2 focus:ring-[#9F3A58]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:placeholder:text-[#B96C80]/60 dark:focus:border-[#D9859B] dark:focus:ring-[#D9859B]/20"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-medium text-black dark:text-[#D9859B]">
                        Telefonnummer
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        autoComplete="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+41 79 000 00 00"
                        className="mt-1.5 w-full rounded-lg border border-[#E3C4CC] bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:border-[#9F3A58] focus:outline-none focus:ring-2 focus:ring-[#9F3A58]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:placeholder:text-[#B96C80]/60 dark:focus:border-[#D9859B] dark:focus:ring-[#D9859B]/20"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-people" className="block text-xs font-medium text-black dark:text-[#D9859B]">
                        Anzahl Personen
                      </label>
                      <input
                        id="contact-people"
                        type="number"
                        min={1}
                        max={100}
                        value={contactPeopleCount}
                        onChange={(e) => setContactPeopleCount(e.target.value)}
                        placeholder="1"
                        className="mt-1.5 w-full rounded-lg border border-[#E3C4CC] bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:border-[#9F3A58] focus:outline-none focus:ring-2 focus:ring-[#9F3A58]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:placeholder:text-[#B96C80]/60 dark:focus:border-[#D9859B] dark:focus:ring-[#D9859B]/20"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-category" className="block text-xs font-medium text-black dark:text-[#D9859B]">
                        Gewünschter Bereich
                      </label>
                      <select
                        id="contact-category"
                        value={contactCategory}
                        onChange={(e) => setContactCategory(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[#E3C4CC] bg-white px-3.5 py-2.5 text-sm text-black focus:border-[#9F3A58] focus:outline-none focus:ring-2 focus:ring-[#9F3A58]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:focus:border-[#D9859B] dark:focus:ring-[#D9859B]/20"
                      >
                        <option value="Indoorportrait">Indoorportrait</option>
                        <option value="Outdoor-Portraits">Outdoor-Portraits</option>
                        <option value="Editorial-Portrait">Editorial-Portrait</option>
                        <option value="Video-Portrait">Video-Portrait</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-referral" className="block text-xs font-medium text-black dark:text-[#D9859B]">
                        Referenz/Word of Mouth
                      </label>
                      <input
                        id="contact-referral"
                        type="text"
                        value={contactReferral}
                        onChange={(e) => setContactReferral(e.target.value)}
                        placeholder="Wie haben Sie von uns erfahren?"
                        className="mt-1.5 w-full rounded-lg border border-[#E3C4CC] bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:border-[#9F3A58] focus:outline-none focus:ring-2 focus:ring-[#9F3A58]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:placeholder:text-[#B96C80]/60 dark:focus:border-[#D9859B] dark:focus:ring-[#D9859B]/20"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="contact-message" className="block text-xs font-medium text-black dark:text-[#D9859B]">
                      Projektbeschreibung
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Zeitraum, Ort und gewünschter Umfang des Shootings…"
                      className="mt-1.5 w-full rounded-lg border border-[#E3C4CC] bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/45 focus:border-[#9F3A58] focus:outline-none focus:ring-2 focus:ring-[#9F3A58]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#D9859B] dark:placeholder:text-[#B96C80]/60 dark:focus:border-[#D9859B] dark:focus:ring-[#D9859B]/20"
                    />
                  </div>

                  {contactFeedback && (
                    <div
                      role="status"
                      className={`mt-5 flex items-start gap-2 rounded-lg border px-4 py-3 text-xs font-medium ${
                        contactFeedback.type === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300'
                      }`}
                    >
                      {contactFeedback.type === 'success' && (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      <span>{contactFeedback.text}</span>
                    </div>
                  )}

<div className="mt-4 flex items-start gap-2.5 text-left">
                    <input
                      type="checkbox"
                      id="contactConsent"
                      checked={contactConsent}
                      onChange={(e) => setContactConsent(e.target.checked)}
                      required
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#9F3A58] focus:ring-[#9F3A58] dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer"
                    />
                    <label htmlFor="contactConsent" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                      Ich willige ein, dass meine Daten zur Kontaktaufnahme und Beantwortung meiner Anfrage verarbeitet werden. Sehen Sie dazu auch meine{' '}
                       <a 
    href="/Datenschutzbestimmungen_Mobile_Studio_Fotografie.pdf" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="underline hover:text-[#9F3A58]"
  >
    Datenschutzerklärung (Privacy Policy)
  </a>{' '}
  verarbeitet werden.
                    </label>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#9F3A58] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#882F4A] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-[#7D2B43] dark:hover:bg-white cursor-pointer"
                    >
                      {contactSubmitting ? 'Wird gesendet…' : 'Anfrage absenden'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#EDD6DC] bg-[#F9EEF1] py-10 transition-colors duration-200 dark:border-zinc-800 dark:bg-[#111113]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-6 text-xs text-black dark:text-[#B96C80] sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-black dark:text-[#D9859B]">© 2026 Mobile Studio by Martin</span>
            <span aria-hidden="true">·</span>
            <span className="italic">Alle gezeigten Werke sind urheberrechtlich geschützt.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleNavigateSection('galerie')}
              className="text-black hover:text-black/70 dark:text-[#C77389] dark:hover:text-[#E59DB0] cursor-pointer"
            >
              Galerie
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('leistungen')}
              className="text-black hover:text-black/70 dark:text-[#C77389] dark:hover:text-[#E59DB0] cursor-pointer"
            >
              Leistungen
            </button>
            <button
              type="button"
              onClick={() => handleNavigateSection('kontakt')}
              className="font-medium text-black hover:text-black/70 dark:text-[#D9859B] dark:hover:text-[#E59DB0] cursor-pointer"
            >
              Kontakt
            </button>
            <ThemeToggle theme={theme} onToggle={setTheme} />
          </div>
        </div>
      </footer>

      {/* Lightbox for Protected Public Gallery */}
      <LightboxModal
        photos={filteredPhotos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
        onProtectedAttempt={triggerProtectionNotice}
      />

      {/* Service Info Popup Modal */}
      <ServiceInfoModal
        service={activeServiceInfo}
        onClose={() => setActiveServiceInfo(null)}
        onRequestBooking={() => {
          if (activeServiceInfo?.number === '02.') {
            setContactCategory('Outdoor-Portraits');
          } else if (activeServiceInfo?.number === '03.') {
            setContactCategory('Video-Portrait');
          } else {
            setContactCategory('Indoorportrait');
          }
          handleNavigateSection('kontakt');
        }}
      />

      {/* Polite Toast when visitor tries right-click / drag / save on protected gallery */}
      {protectionToastVisible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 left-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-100 shadow-lg sm:left-auto"
        >
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-[#D9859B] shrink-0" aria-hidden="true" />
            <p className="leading-relaxed italic">
              Alle Vorschaubilder sind urheberrechtlich geschützt und nicht zum öffentlichen Download freigegeben.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
