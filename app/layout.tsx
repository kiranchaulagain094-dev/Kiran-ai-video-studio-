import React from 'react';

export const metadata = {
  title: 'Kiran AI Video Studio | AI Video Script & YouTube Shorts Tools',
  description:
    'Create cinematic AI video scripts, plan 9:16 viral YouTube Shorts, edit multi-scene timelines, and generate high-CTR metadata and SEO tags with Kiran AI Video Studio.',
  metadataBase: new URL('https://kiran-ai-video-studio.vercel.app'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'sFs9iuSCsEjv48AGOVwK1crboQv_h6eg2YQBHUGniwM',
  },
  openGraph: {
    title: 'Kiran AI Video Studio | AI Video Script & YouTube Shorts Tools',
    description:
      'Create cinematic AI video scripts, plan 9:16 viral YouTube Shorts, edit multi-scene timelines, and generate high-CTR metadata and SEO tags with Kiran AI Video Studio.',
    url: 'https://kiran-ai-video-studio.vercel.app',
    siteName: 'Kiran AI Video Studio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiran AI Video Studio | AI Video Script & YouTube Shorts Tools',
    description:
      'Create cinematic AI video scripts, plan 9:16 viral YouTube Shorts, edit multi-scene timelines, and generate high-CTR metadata and SEO tags with Kiran AI Video Studio.',
    creator: '@kiranaimusic-94',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="sFs9iuSCsEjv48AGOVwK1crboQv_h6eg2YQBHUGniwM"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
