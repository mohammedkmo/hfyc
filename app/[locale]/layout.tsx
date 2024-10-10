import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getLangDir } from 'rtl-detect';
import { Toaster } from "@/components/ui/toaster"
import DeviceProvider from "@/components/DeviceProvider";
import { GeistSans } from 'geist/font/sans';

const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["100", "200", "300", "400", "500", "600", "700"], variable: "--font-arabic" });

export const metadata: Metadata = {
  title: "PCH badging",
  description: "Petrochina PCH badging",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string }
}>) {
  const messages = await getMessages();

  const direction = getLangDir(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={`${GeistSans.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <DeviceProvider>
            <Header />
            {children}
          </DeviceProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
