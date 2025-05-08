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
    name: 'ADS UX Logo', // Updated name
    imageUrl: 'https://naadan-chords-music.s3.ap-south-1.amazonaws.com/ads-ux-logo-filled.png', // Updated image path
    alt: 'ADS UX Logo Stamp', // Updated alt text
    width: 80,
    height: 80,
  },
  { 
    id: 'Adaptabug', 
    name: 'Adaptabug', 
    imageUrl: 'https://naadan-chords-music.s3.ap-south-1.amazonaws.com/adaptabug.png', 
    alt: 'Adaptabug',
    width: 100,
    height: 100,
  }
];
