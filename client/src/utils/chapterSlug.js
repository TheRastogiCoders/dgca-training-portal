export const CHAPTER_SLUG_OVERRIDES = {
  'ic-joshi': {
    'clear-air-turbulence': 'cat-and-mountain-waves',
    'mountain-waves': 'cat-and-mountain-waves',
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

