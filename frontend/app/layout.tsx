// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ThemeProvider from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';
import Chatbot from '@/features/chatbot/Chatbot';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reservia - Plateforme de réservation multi-services',
  description: 'Trouvez, comparez et réservez des services locaux en quelques clics',
  icons: {
    icon: '/logo.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 pt-0">  {/* ← Changez pt-16 en pt-0 */}
                {children}
              </main>
              <Footer />
              <Chatbot />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}