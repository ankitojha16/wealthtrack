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

function resolveSlug(rawSlug: string): string {
  if (rawSlug === 'loan' || rawSlug === 'loan-calculator') {
    return 'emi';
  }
  return rawSlug;
}

export async function generateStaticParams() {
  const params = CALCULATORS.map((calc) => ({
    slug: calc.slug,
  }));
  params.push({ slug: 'loan' }, { slug: 'loan-calculator' });
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = resolveSlug(params.slug);
  const calc = CALCULATORS.find((c) => c.slug === slug);
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
  const slug = resolveSlug(params.slug);
  const calc = CALCULATORS.find((c) => c.slug === slug);
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
