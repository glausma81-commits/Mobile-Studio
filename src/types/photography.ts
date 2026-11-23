export type PhotoCategory = 'Alle' | 'Studio' | 'Charakter';

export interface ExifData {
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
}

export interface ShowcasePhoto {
  id: string;
  title: string;
  category: Exclude<PhotoCategory, 'Alle'>;
  location: string;
  year: string;
  aspect: 'portrait' | 'landscape' | 'wide';
  featured?: boolean;
  imageUrl: string;
  caption: string;
  exif: ExifData;
}

export interface ServiceItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  infoParagraphs?: string[];
}
