const PRACTICE_BOOK_SLUG_MAP = {
  'ic-joshi': 'ic-joshi',
  'oxford': 'oxford',
  'air-law': 'oxford',
  'human-performance-and-limitations': 'human-performance',
  'rk-bali': 'rk-bali',
  'cae-oxford-general-navigation': 'cae-oxford-general-navigation',
  'general-navigation': 'cae-oxford-general-navigation',
  'cae-oxford-flight-planning-monitoring': 'cae-oxford-flight-planning',
  'cae-oxford-flight-planning': 'cae-oxford-flight-planning',
  'cae-oxford-performance': 'cae-oxford-performance',
  'performance': 'mass-and-balance-and-performance',
  'cae-oxford-radio-navigation': 'cae-oxford-radio-navigation',
  'cae-oxford-navigation': 'cae-oxford-navigation',
  'operational-procedures': 'operational-procedures',
  'instrument-2014': 'instrument',
  'instrument': 'instrument',
  'cae-oxford-meteorology': 'cae-oxford',
  'cae-oxford-powerplant': 'cae-oxford-powerplant',
  'powerplant': 'cae-oxford-powerplant',
  'cae-oxford-principles-of-flight': 'cae-oxford-principles-of-flight',
  'principles-of-flight': 'cae-oxford-principles-of-flight',
  'cae-oxford-radio-telephony': 'cae-oxford',
  'mass-and-balance-and-performance': 'mass-and-balance-and-performance',
  'mass-and-balance': 'mass-and-balance-and-performance'
};

export const resolvePracticeBookSlug = (subjectSlug = '', bookSlug = '') => {
  if (!bookSlug) return '';
  const lowerBook = bookSlug.toLowerCase();
  const lowerSubject = (subjectSlug || '').toLowerCase();

  if (lowerBook === 'cae-oxford') {
    return lowerSubject === 'meteorology' ? 'cae-oxford' : 'oxford';
  }

  return PRACTICE_BOOK_SLUG_MAP[lowerBook] || lowerBook;
};

export const fetchChapterQuestionMetadata = async ({ subjectSlug, bookSlug, chapterSlug }) => {
  if (!bookSlug || !chapterSlug) {
    return null;
  }

  const practiceBookSlug = resolvePracticeBookSlug(subjectSlug, bookSlug);
  if (!practiceBookSlug) {
    return null;
  }

  try {
    const response = await fetch(`/api/practice-questions/${practiceBookSlug}/count?chapter=${encodeURIComponent(chapterSlug)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('fetchChapterQuestionMetadata error:', error);
    return null;
  }
};
