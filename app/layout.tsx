import type { Metadata } from 'next';
import { Quicksand, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SettingsProvider } from '@/components/providers/SettingsProvider';
import { Navbar } from '@/components/ui/Navbar';

const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GlassPDF — PDF Utility Suite',
  description: 'Merge, split, convert, watermark PDFs — 100% in your browser. Private by design.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash-of-wrong-theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('glasspdf_theme');
                const resolved = t === 'light' ? 'light' : t === 'dark' ? 'dark'
                  : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', resolved);
              } catch(e) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            `,
          }}
        />
      </head>
      <body className={`${quicksand.variable} ${inter.variable} font-sans antialiased min-h-screen`}>
        <ThemeProvider>
          <SettingsProvider>
            <Navbar />
            <main className="pt-14">
              {children}
            </main>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
