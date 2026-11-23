import heroSharpPortrait from '../assets/images/hero_sharp_portrait_1795461594243.jpg';
import portraitColorStudio from '../assets/images/portrait_color_studio_1795461595559.jpg';
import portraitBusinessExecutive from '../assets/images/portrait_business_executive_1795461594709.jpg';
import type { ServiceItem, ShowcasePhoto } from '../types/photography';

export const HERO_IMAGE_URL = heroSharpPortrait;

export const SHOWCASE_PHOTOS: ShowcasePhoto[] = [
  {
    id: 'portraet-claire',
    title: 'Klarheit im Studiolicht',
    category: 'Studio',
    location: 'Zürich',
    year: '2026',
    aspect: 'landscape',
    featured: true,
    imageUrl: portraitColorStudio,
    caption:
      'Gestochen scharfes Studio-Portrait mit fein modelliertem Beauty-Light und natürlicher Hautzeichnung ohne Retusche-Glättung.',
    exif: {
      camera: 'Hasselblad X2D 100C',
      lens: '90mm f/2.5',
      aperture: 'f/5.6',
      shutter: '1/200s',
      iso: 'ISO 64',
    },
  },
  {
    id: 'portraet-elena-studio',
    title: 'Präsenz im Tageslicht',
    category: 'Charakter',
    location: 'Zug',
    year: '2026',
    aspect: 'landscape',
    featured: true,
    imageUrl: portraitBusinessExecutive,
    caption:
      'Präzises Business- und Charakterportrait im natürlichen Tageslicht — voller Fokus auf Ausdruck, Blickkontakt und feinste Texturen.',
    exif: {
      camera: 'Leica SL3',
      lens: '75mm APO-Summicron',
      aperture: 'f/4.0',
      shutter: '1/320s',
      iso: 'ISO 100',
    },
  },
];

export const SERVICES: ServiceItem[] = [
  {
    number: '01.',
    title: 'Studio-Portraits',
    subtitle: 'Präzise Lichtführung & Schärfe',
    description:
      'Detailreiche Portraits bei Dir im Apartment oder Hotel.',
    infoParagraphs: [
      'Das Fotoshooting findet bei Dir statt, in Deinem Apartment oder Hotel. Für die Besten Fotos ist genügend Platz notwendig. Falls Du unsicher bist, lass es uns Wissen. Auf Anfrage können wir auch eine Hotelsuite organisieren.',
      'Ein Fotoshooting dauert mindestens 2-4 Stunden. Falls Ihr mehrere Personen seid, können wir den Tag viel effizienter nutzen und Ihr könnt sparen.',
    ],
  },
  {
    number: '02.',
    title: 'Outdoor-Portraits',
    subtitle: 'Natürliches Licht & Atmosphäre',
    description:
      'Authentische Outdoor-Portraitserien in einer cinematischen Umgebung.',
    infoParagraphs: [
      'Je nach Wetter, Fotokonzept und anderen Gegebenheiten können auch Outdoorportraits gemacht werden. Bitte kontaktiere uns bei solchen Interessen.',
    ],
  },
  {
    number: '03.',
    title: 'Video-Portraits',
    subtitle: 'Cineastische Bewegtbilder',
    description:
      'Kurze, cineastische Videoportraits.',
    infoParagraphs: [
      'Videos und Reels ergänzen Deine Werbung stark. Darum können auch cineastische Videosequenzen gemacht werden. Bitte kontaktiere uns bei solchen Interessen.',
    ],
  },
];
