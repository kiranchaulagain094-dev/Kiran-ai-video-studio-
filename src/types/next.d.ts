declare module 'next' {
  export namespace MetadataRoute {
    export interface SitemapItem {
      url: string;
      lastModified?: string | Date;
      changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority?: number;
      alternates?: {
        languages?: Record<string, string>;
      };
    }
    export type Sitemap = SitemapItem[];
  }

  export interface Metadata {
    title?: string | { default: string; template: string };
    description?: string;
    metadataBase?: URL;
    alternates?: {
      canonical?: string;
      languages?: Record<string, string>;
    };
    verification?: {
      google?: string;
      yandex?: string;
      yahoo?: string;
      other?: Record<string, string | string[]>;
    };
    openGraph?: Record<string, any>;
    twitter?: Record<string, any>;
    robots?: Record<string, any>;
    icons?: Record<string, any>;
  }
}
