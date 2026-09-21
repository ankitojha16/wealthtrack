import { MetadataRoute } from 'next';
import { CALCULATORS } from '@/lib/data/calculators';
import { LEARN_ARTICLES } from '@/lib/data/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wealthtrack.app';

  const publicRoutes = [
    '',
    '/about',
    '/contact',
    '/calculators',
    '/learn',
    '/privacy',
    '/terms',
    '/feedback',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const calculatorRoutes = CALCULATORS.map((calc) => ({
    url: `${baseUrl}/calculators/${calc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const articleRoutes = LEARN_ARTICLES.map((article) => ({
    url: `${baseUrl}/learn/${article.slug}`,
    lastModified: new Date(article.updatedDate),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...publicRoutes, ...calculatorRoutes, ...articleRoutes];
}
