import type { MetadataRoute } from 'next';

const BASE_URL = 'https://stuko.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = [
    { path: '/', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/attendance', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/sgpa-cgpa', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/pomodoro', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/flashcards', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/quiz', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/summarizer', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/exam-mode', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/document-reader', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/study-room', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/cookies', changeFrequency: 'yearly' as const, priority: 0.5 },
  ];

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
