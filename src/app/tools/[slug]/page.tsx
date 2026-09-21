import React from 'react';
import { notFound, redirect } from 'next/navigation';

export async function generateStaticParams() {
  return [
    { slug: 'budget-planner' },
    { slug: 'loan-planner' },
    { slug: 'net-worth' },
    { slug: 'financial-health' },
  ];
}

interface Props {
  params: {
    slug: string;
  };
}

export default function ToolRedirectPage({ params }: Props) {
  if (params.slug === 'budget-planner') {
    redirect('/budget');
  } else if (params.slug === 'loan-planner') {
    redirect('/loans');
  } else if (params.slug === 'net-worth' || params.slug === 'financial-health') {
    redirect('/reports');
  } else {
    notFound();
  }
}
