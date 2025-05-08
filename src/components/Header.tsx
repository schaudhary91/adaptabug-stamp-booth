import Image from 'next/image';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center gap-3">
        <Image
          src="/img/ads-ux-logo-filled.png" 
          alt="ADS UX Logo"
          width={48}
          height={48}
          className="rounded"
          data-ai-hint="ads ux logo"
          priority
        />
        <h1 className="text-3xl font-bold text-primary logo-heading"><span>Adaptabug Stamp-Booth</span></h1>
      </div>
    </header>
  );
}
