import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed this line
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geistSans = GeistSans;
// const geistMono = GeistMono; // Removed this line

export const metadata: Metadata = {
  title: 'StampBooth',
  description: 'Create fun photos with stamps!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased font-sans`}> {/* Removed geistMono.variable */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
