import type { Metadata } from 'next';
import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const fontSans = FontSans({
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Delta',
  description: 'Business Requirements Management'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${fontSans.className} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          // enableSystem
          disableTransitionOnChange
        >
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
