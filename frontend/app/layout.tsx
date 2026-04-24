import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/ui/Navbar';
// import Chatbot from '@/features/chatbot/Chatbot';  // COMMENTÉ - à activer plus tard
import ThemeProvider from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookingHub - Plateforme de réservation multi-services',
  description: 'Trouvez, comparez et réservez des services locaux en quelques clics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            {/* <Chatbot /> */}  {/* COMMENTÉ - à activer plus tard */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}