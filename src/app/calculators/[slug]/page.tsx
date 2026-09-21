import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CALCULATORS } from '@/lib/data/calculators';
import { LEARN_ARTICLES } from '@/lib/data/articles';
import CalculatorClient from './CalculatorClient';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return CALCULATORS.map((calc) => ({
    slug: calc.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const calc = CALCULATORS.find((c) => c.slug === params.slug);
  if (!calc) return {};

  return {
    title: `${calc.title} — WealthTrack Free Financial Calculators`,
    description: `${calc.description} Complete with mathematical formula, worked example, and FAQs.`,
    openGraph: {
      title: `${calc.title} | WealthTrack`,
      description: calc.description,
      type: 'website',
    },
  };
}

export default function CalculatorPage({ params }: Props) {
  const calc = CALCULATORS.find((c) => c.slug === params.slug);
  if (!calc) notFound();

  // Find related calculators and articles
  const relatedCalcs = CALCULATORS.filter((c) => calc.relatedCalculators?.includes(c.slug));
  const relatedArticles = LEARN_ARTICLES.filter((a) => calc.relatedArticles?.includes(a.slug));

  // FAQ Schema.org JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: calc.faqs.map((f) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CalculatorClient
        calc={calc}
        relatedCalcs={relatedCalcs}
        relatedArticles={relatedArticles}
      />
    </>
  );
}
