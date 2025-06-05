import Image from 'next/image';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Studio Tools - Creative Utilities',
  description: 'A suite of tools for designers and developers, including Glass View and more.',
  icons: {
    icon: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1749126849/Screenshot_2025-06-04_181750-removebg-preview_t95dl6.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" /> 
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        {/* Made in Bolt.new badge */}
        <div className="flex flex-col items-center mt-8">
          <span className="text-sm font-medium mb-1">Made in</span>
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            title="Made in Bolt.new (opens in a new window)"
          >
            {/* Light mode badge */}
            <Image
              src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1748429478/1000160714-removebg-preview_zrso2j.png"
              alt="Made in Bolt.new (light mode)"
              width={120}
              height={40}
              unoptimized
              className="block dark:hidden"
            />
            {/* Dark mode badge */}
            <Image
              src="https://res.cloudinary.com/ddz3nsnq1/image/upload/v1748428905/1000160700-removebg-preview_em3pue.png"
              alt="Made in Bolt.new (dark mode)"
              width={120}
              height={40}
              unoptimized
              className="hidden dark:block"
            />
          </a>
        </div>
      </body>
        
    </html>
  );
}
