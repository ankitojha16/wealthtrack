import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LEARN_ARTICLES } from '@/lib/data/articles';
import { CALCULATORS } from '@/lib/data/calculators';
import { Clock, Calendar, HelpCircle, Calculator, ArrowRight } from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return LEARN_ARTICLES.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = LEARN_ARTICLES.find((a) => a.slug === params.slug);
  if (!article) return {};

  return {
    title: `${article.title} — WealthTrack Finance Guide`,
    description: article.metaDescription,
    openGraph: {
      title: `${article.title} | WealthTrack Knowledge Center`,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
      authors: ['ANKIT KUMAR'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription,
    },
  };
}

export default function ArticlePage({ params }: Props) {
  const article = LEARN_ARTICLES.find((a) => a.slug === params.slug);
  if (!article) notFound();

  const relatedCalcs = CALCULATORS.filter((c) => article.relatedCalculators?.includes(c.slug));
  const relatedArticles = LEARN_ARTICLES.filter((a) => article.relatedArticles?.includes(a.slug));

  // Schema.org Article & FAQPage JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate,
    author: {
      '@type': 'Person',
      name: 'ANKIT KUMAR',
    },
    publisher: {
      '@type': 'Organization',
      name: 'WealthTrack',
      logo: {
        '@type': 'ImageObject',
        url: 'https://wealthtrack.app/favicon.svg',
      },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Learn
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200 font-bold truncate max-w-xs">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 inline-block">
            {article.category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {article.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            {article.summary}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readingTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Updated {article.updatedDate}
            </span>
            <span>•</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">Authored by ANKIT KUMAR</span>
          </div>
        </header>

        {/* Article Body Content */}
        <div className="prose dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          {article.content.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {para}
                </p>
              ))}

              {section.bulletPoints && section.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                  {section.bulletPoints.map((point, bIdx) => (
                    <li key={bIdx}>{point}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* FAQs */}
        {article.faqs && article.faqs.length > 0 && (
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-500" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {article.faqs.map((faq, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{faq.question}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Calculators & Next Reads */}
        <footer className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
          {relatedCalcs.length > 0 && (
            <div className="p-6 rounded-3xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 space-y-3">
              <h3 className="text-sm font-black text-sky-900 dark:text-sky-200 flex items-center gap-2 uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-sky-600" />
                Related Interactive Calculators
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedCalcs.map((calc) => (
                  <Link
                    key={calc.slug}
                    href={`/calculators/${calc.slug}`}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-sky-400 shadow-sm transition-all"
                  >
                    {calc.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedArticles.length > 0 && (
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">Recommended Next Reads</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((art) => (
                  <Link
                    key={art.slug}
                    href={`/learn/${art.slug}`}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 transition-all flex items-center justify-between group"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 transition-colors truncate">
                      {art.title}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </footer>
      </article>
    </>
  );
}
