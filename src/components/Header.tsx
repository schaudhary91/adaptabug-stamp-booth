import { Camera } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center gap-3">
        <Camera className="h-12 w-12 text-primary" aria-label="Adaptabug Stamp-Booth Logo" />
        <h1 className="text-3xl font-bold text-primary logo-heading"><span>Adaptabug Stamp-Booth</span></h1>
      </div>
    </header>
  );
}
