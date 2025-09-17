
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LayoutProvider } from '@/components/layout-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const fontBody = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Janantara',
  description: 'Crafting Digital Excellence with Purpose and Precision.',
  icons: {
    icon: '/favicon.ico?v=1',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontBody.variable} ${fontHeadline.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-body antialiased">
          <LayoutProvider header={<Header />} footer={<Footer />}>
            {children}
          </LayoutProvider>
          <Toaster />
      </body>
    </html>
  );
}
