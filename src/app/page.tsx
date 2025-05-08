import { Header } from '@/components/Header';
import { ImageWorkspace } from '@/components/ImageWorkspace';

export default function StampBoothPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex flex-col">
        <ImageWorkspace />
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Adaptabug Stamp-Booth. Create with fun!</p>
      </footer>
    </div>
  );
}
