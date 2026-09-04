import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";

export const metadata: Metadata = {
  title: "BiswashKori (বিশ্বাষকরি) | Bangladesh's Trust & Review Platform",
  description: "বিশ্বাসযোগ্য রিভিউ, সঠিক সিদ্ধান্ত। Discover, read, and write trusted reviews for businesses in Bangladesh.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Hind+Siliguri:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var storedTheme = localStorage.getItem('theme');
                var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && systemDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className="antialiased min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-colors duration-200">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
