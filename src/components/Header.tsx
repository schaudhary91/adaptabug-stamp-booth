import { ImagePlus } from 'lucide-react';

const AdsUxLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ads UX Logo"
    className="text-primary"
  >
    {/* A */}
    <path d="M25,15 L10,45 L15,45 L17.5,37.5 L32.5,37.5 L35,45 L40,45 L25,15 Z M20,30 L30,30 L25,20 Z" />
    {/* D */}
    <path d="M45,15 L60,15 C67.5,15 70,20 70,25 C70,30 67.5,35 60,35 L50,35 L50,45 L45,45 L45,15 Z M50,20 L50,30 L60,30 C62.5,30 65,27.5 65,25 C65,22.5 62.5,20 60,20 L50,20 Z" />
    {/* S */}
    <path d="M75,15 L90,15 L90,22.5 C90,25 87.5,27.5 85,27.5 L80,27.5 L80,32.5 C80,35 82.5,37.5 85,37.5 L90,37.5 L90,45 L75,45 L75,37.5 C75,35 77.5,32.5 80,32.5 L85,32.5 L85,22.5 C85,20 82.5,17.5 80,17.5 L75,17.5 L75,15 Z" />
    {/* U */}
    <path d="M10,55 L10,75 C10,82.5 15,85 25,85 C35,85 40,82.5 40,75 L40,55 L35,55 L35,75 C35,80 30,80 25,80 C20,80 15,80 15,75 L15,55 L10,55 Z" />
    {/* X */}
    <path d="M45,55 L55,67.5 L45,80 L50,80 L60,70 L70,80 L75,80 L65,67.5 L75,55 L70,55 L60,65 L50,55 L45,55 Z" />
  </svg>
);


export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center gap-3">
        <AdsUxLogo />
        <h1 className="text-3xl font-bold text-primary">Adaptabug Stamp-Booth</h1>
      </div>
    </header>
  );
}
