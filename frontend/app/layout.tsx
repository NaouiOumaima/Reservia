// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';  // ← AJOUTER CETTE LIGNE
import ThemeProvider from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reservia - Plateforme de réservation multi-services',
  description: 'Trouvez, comparez et réservez des services locaux en quelques clics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />  {/* ← AJOUTER CETTE LIGNE */}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}