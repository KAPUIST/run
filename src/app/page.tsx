'use client';

import { useState, useCallback } from 'react';
import BackgroundEffects from '@/components/landing/BackgroundEffects';
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import StyleGallery, { STYLES } from '@/components/landing/StyleGallery';
import FeedbackForm from '@/components/landing/FeedbackForm';
import Lightbox from '@/components/landing/Lightbox';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((src: string, name: string) => {
    const idx = STYLES.findIndex((s) => s.src === src);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const navLightbox = useCallback(
    (direction: number) => {
      setLightboxIndex((prev) => (prev + direction + STYLES.length) % STYLES.length);
    },
    []
  );

  return (
    <>
      <BackgroundEffects />
      <Nav />
      <Hero onOpenLightbox={openLightbox} />
      <HowItWorks />
      <StyleGallery onOpenLightbox={openLightbox} />
      <FeedbackForm />
      <Lightbox
        isOpen={lightboxOpen}
        currentSrc={STYLES[lightboxIndex]?.src ?? ''}
        currentName={STYLES[lightboxIndex]?.name ?? ''}
        onClose={closeLightbox}
        onNav={navLightbox}
      />
      <Footer />
    </>
  );
}
