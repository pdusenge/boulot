import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import StoreProvider from '../components/StoreProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Boulot - Professional Student-SME Talent Marketplace',
  description: 'Connect high-potential student talent with SMEs for real-world solutions. Automated, secure, and professional.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="flex flex-col min-h-screen font-sans">
        <StoreProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
