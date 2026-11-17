import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SeoHeadProps {
  title: string;
  description: string;
  type?: 'website' | 'product' | 'article';
  robots?: 'index, follow' | 'noindex, nofollow';
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const STATIC_SEO_SELECTORS = [
  'title:not([data-joya-helmet="true"])',
  'meta[name="description"]:not([data-joya-helmet="true"])',
  'meta[name="robots"]:not([data-joya-helmet="true"])',
  'meta[property="og:type"]:not([data-joya-helmet="true"])',
  'meta[property="og:site_name"]:not([data-joya-helmet="true"])',
  'meta[property="og:locale"]:not([data-joya-helmet="true"])',
  'meta[property="og:title"]:not([data-joya-helmet="true"])',
  'meta[property="og:description"]:not([data-joya-helmet="true"])',
  'meta[property="og:url"]:not([data-joya-helmet="true"])',
  'meta[name="twitter:card"]:not([data-joya-helmet="true"])',
  'meta[name="twitter:title"]:not([data-joya-helmet="true"])',
  'meta[name="twitter:description"]:not([data-joya-helmet="true"])',
  'link[rel="canonical"]:not([data-joya-helmet="true"])',
];

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  type = 'website',
  robots = 'index, follow',
  structuredData,
}) => {
  const { pathname } = useLocation();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://joya.today';
  const canonicalUrl = `${origin}${pathname}`;
  const jsonLdString = structuredData ? JSON.stringify(structuredData) : '';

  // Remove initial static index.html duplicates once React Helmet takes over <head>
  useEffect(() => {
    STATIC_SEO_SELECTORS.forEach((selector) => {
      document.head.querySelectorAll(selector).forEach((el) => el.remove());
    });
  }, []);

  return (
    <Helmet prioritizeSeoTags>
      <title data-joya-helmet="true">{title}</title>
      <meta name="description" content={description} data-joya-helmet="true" />
      <meta name="robots" content={robots} data-joya-helmet="true" />

      <link rel="canonical" href={canonicalUrl} data-joya-helmet="true" />

      <meta property="og:type" content={type} data-joya-helmet="true" />
      <meta property="og:site_name" content="JOYA" data-joya-helmet="true" />
      <meta property="og:locale" content="ar_EG" data-joya-helmet="true" />
      <meta property="og:title" content={title} data-joya-helmet="true" />
      <meta property="og:description" content={description} data-joya-helmet="true" />
      <meta property="og:url" content={canonicalUrl} data-joya-helmet="true" />

      <meta name="twitter:card" content="summary_large_image" data-joya-helmet="true" />
      <meta name="twitter:title" content={title} data-joya-helmet="true" />
      <meta name="twitter:description" content={description} data-joya-helmet="true" />

      {jsonLdString && (
        <script type="application/ld+json" data-joya-helmet="true">
          {jsonLdString}
        </script>
      )}
    </Helmet>
  );
};
