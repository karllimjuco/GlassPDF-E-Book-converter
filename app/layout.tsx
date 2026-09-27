import type { Metadata } from 'next';
import { Quicksand, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SettingsProvider } from '@/components/providers/SettingsProvider';
import { Navbar } from '@/components/ui/Navbar';
import { CursorTrail } from '@/components/ui/CursorTrail';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GlassPDF — PDF Utility Suite',
  description: 'Merge, split, convert, watermark PDFs — 100% in your browser. Private by design.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Flash-free theme initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('glasspdf_theme');
                const resolved = t === 'light' ? 'light' : t === 'dark' ? 'dark'
                  : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', resolved);
                if (resolved === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            `,
          }}
        />
      </head>
      <body className={`${quicksand.variable} ${inter.variable} antialiased min-h-screen relative selection:bg-sky-400 selection:text-white`}>
        {/* Fixed full-bleed background photo on a dedicated wrapper div */}
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}
        />

        {/* Dynamic theme overlay layer */}
        <div className="fixed inset-0 -z-10 pointer-events-none transition-colors duration-500 bg-white/10 dark:bg-slate-950/60 dark:backdrop-blur-[2px]" />

        <ThemeProvider>
          <SettingsProvider>
            <CursorTrail />
            <Navbar />
            <main className="pt-16 min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
