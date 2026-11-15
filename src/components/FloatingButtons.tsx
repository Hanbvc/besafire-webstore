import { useEffect, useState } from 'react';
import site from '../data/site.json';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { IconChevronUp, IconWhatsApp } from './Icons';

export function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="floating">
      {showTop && (
        <button
          type="button"
          className="floating__btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
        >
          <IconChevronUp />
        </button>
      )}
      <a
        className="floating__btn"
        href={buildWhatsAppUrl(site.whatsappNumber, `Halo ${site.brand}, saya ingin bertanya.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat via WhatsApp"
      >
        <IconWhatsApp width={30} height={30} />
      </a>
    </div>
  );
}
