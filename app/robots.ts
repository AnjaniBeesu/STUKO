import type { MetadataRoute } from 'next';

const BASE_URL = 'https://stuko.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth', '/onboarding', '/profile', '/avatar', '/library/view/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
