export const CHAPTER_SLUG_OVERRIDES = {
  'ic-joshi': {
    'clear-air-turbulence': 'cat-and-mountain-waves',
    'mountain-waves': 'cat-and-mountain-waves',
  },
  // Handle legacy / mistyped slugs for Operational Procedures book
  'operational-procedures': {
    // Map older \"cs-ops\" slug to the correct \"eu-ops\" JSON file
    'cs-ops-general-requirements': 'eu-ops-general-requirements',
  },
  // Handle RK Bali chapter title variations
  'rk-bali': {
    'personnel-licensing': 'personnel-licencing',
    'airworthiness': 'airworthiness-of-aircraft',
    'environmental-procedures-and-hazards-general-aspects': 'special-operational-procedures-and-hazards-general-aspects',
  },
};

export const slugifyChapterName = (name = '') =>
  name
    .toLowerCase()
    .replace(/\(([^)]+)\)/g, (_match, acronym) => `-${acronym.toLowerCase()}`)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const resolveChapterSlug = (bookSlug, slug = '') => {
  const normalizedSlug = slug.toLowerCase();
  if (!bookSlug) {
    return normalizedSlug;
  }

  const overrides = CHAPTER_SLUG_OVERRIDES[bookSlug];
  if (overrides && overrides[normalizedSlug]) {
    return overrides[normalizedSlug];
  }

  return normalizedSlug;
};

