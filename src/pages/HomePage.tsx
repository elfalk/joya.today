import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useJoya } from '../context/JoyaContext';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ExpandingRevealSection } from '../components/ExpandingRevealSection';
import { CoreSystemsSection } from '../components/CoreSystemsSection';
import { SubSystemsSection } from '../components/SubSystemsSection';
import { SpotlightFooter } from '../components/SpotlightFooter';
import { SeoHead } from '../components/SeoHead';

export const HomePage: React.FC = () => {
  const { systems } = useJoya();
  const location = useLocation();

  const coreSystems = systems.filter((s) => s.category === 'core');
  const additionalSystems = systems.filter((s) => s.category === 'additional');

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://joya.today';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'JOYA',
      url: origin,
      email: 'hello@joya.today',
      logo: `${origin}/assets/joya-header-logo.svg`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'JOYA | منظومة إدارة الأعمال المتكاملة',
      url: origin,
      inLanguage: 'ar',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'أنظمة JOYA لإدارة الأعمال',
      numberOfItems: systems.length,
      itemListElement: systems.map((sys, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: sys.name,
        url: `${origin}/system/${sys.slug}`,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B325B]">
      <SeoHead
        title="JOYA | منظومة إدارة الأعمال ونقاط البيع المتكاملة"
        description="اكتشف 28 نظاماً متكاملاً من JOYA لإدارة الكافيهات والمحامص والمطاعم والصيدليات والعيادات والمصانع والمخازن على كافة الأجهزة."
        structuredData={structuredData}
      />
      <Header />
      <main>
        <HeroSection />
        <ExpandingRevealSection />
        <CoreSystemsSection systems={coreSystems} />
        <SubSystemsSection systems={additionalSystems} />
      </main>
      <SpotlightFooter />
    </div>
  );
};
