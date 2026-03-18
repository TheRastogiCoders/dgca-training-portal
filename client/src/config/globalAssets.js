/**
 * Global image and asset paths for VIMAANNA.
 * Use these constants so logo and shared images can be updated in one place.
 * Add images to client/public/ and reference here (e.g. /images/hero-bg.jpg).
 */
export const GLOBAL_ASSETS = {
  /** Main logo (header, login, OG) - use PNG for broad support */
  LOGO: '/logo.png',
  /** Fallback logo (e.g. SVG) if PNG not available */
  LOGO_ALT: '/vimaanna-logo.svg',
  /** Full logo for emails / print (optional) */
  LOGO_FULL: '/vimaanna-logo.png',
  /** Hero / landing background — aerial cockpit view from Unsplash (free to use) */
  HERO_BG: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80',
  /** Hero carousel slides — each with image and optional title/tagline */
  HERO_CAROUSEL_SLIDES: [
    {
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80',
      title: 'Wings Within Reach',
      tagline: 'Your one place for DGCA exam prep—question bank, PYQ, timed tests, and study library.',
    },
    {
      image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1920&q=80',
      title: 'Clear the Sky',
      tagline: 'Master Air Regulations, Meteorology, Air Navigation, and Technical General with confidence.',
    },
    {
      image: 'https://dgcacomputernumber.com/wp-content/uploads/2025/08/what-is-dgca-exam.png',
      title: 'From Ground to Cockpit',
      tagline: 'Practice like the real exam. Timed tests, PYQ, and chapter-wise drills—all free.',
    },
  ],
  /** About / mission section image (optional; add /images/about-mission.jpg) */
  ABOUT_IMAGE: '/images/about-mission.jpg',
  /** Favicon */
  FAVICON: '/favicon.ico',
};

export default GLOBAL_ASSETS;
