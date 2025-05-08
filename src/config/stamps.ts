export interface StampConfig {
  id: string;
  name: string;
  imageUrl: string;
  alt: string;
  width: number; // Default width for the stamp
  height: number; // Default height for the stamp
}

export const predefinedStamps: StampConfig[] = [
  {
    id: 'default-adsux-logo',
    name: 'ADS UX Logo',
    imageUrl: 'https://picsum.photos/seed/adsuxdefaultstamp/100/100', // Placeholder for the ADS UX logo
    alt: 'ADS UX Default Stamp',
    width: 80,
    height: 80,
  },
  { 
    id: 'smiley-face', 
    name: 'Smiley Face', 
    imageUrl: 'https://picsum.photos/seed/smiley/100/100', 
    alt: 'Smiley Face Stamp',
    width: 80,
    height: 80,
  },
  { 
    id: 'star', 
    name: 'Star', 
    imageUrl: 'https://picsum.photos/seed/starshine/100/100', 
    alt: 'Star Stamp',
    width: 70,
    height: 70,
  },
  { 
    id: 'heart', 
    name: 'Heart', 
    imageUrl: 'https://picsum.photos/seed/lovelyheart/100/100', 
    alt: 'Heart Stamp',
    width: 75,
    height: 70,
  },
  { 
    id: 'cool-shades', 
    name: 'Cool Shades', 
    imageUrl: 'https://picsum.photos/seed/coolshades/120/80', 
    alt: 'Cool Shades Stamp',
    width: 100,
    height: 60,
  },
  {
    id: 'party-hat',
    name: 'Party Hat',
    imageUrl: 'https://picsum.photos/seed/partyhat/100/120',
    alt: 'Party Hat Stamp',
    width: 60,
    height: 80,
  }
];
