// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://site.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/profilim/',
          '/biletlerim/',
          '/favorilerim/',
          '/sepet/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/profilim/', '/biletlerim/', '/favorilerim/', '/sepet/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}