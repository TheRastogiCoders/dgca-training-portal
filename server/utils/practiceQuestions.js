const fs = require('fs');
const path = require('path');

const practiceQuestionsDir = path.join(__dirname, '..', 'practice-questions');

const PRACTICE_BOOK_SLUG_MAPPING = {
  'air-law': 'oxford',
  'human-performance-and-limitations': 'human-performance',
  'oxford': 'oxford',
  'cae-oxford': 'oxford',
  'rk-bali': 'rk-bali',
  'ic-joshi': 'ic-joshi',
  'general-navigation': 'cae-oxford-general-navigation',
  'cae-oxford-general-navigation': 'cae-oxford-general-navigation',
  'cae-oxford-flight-planning': 'cae-oxford-flight-planning',
  'cae-oxford-flight-planning-monitoring': 'cae-oxford-flight-planning',
  'cae-oxford-performance': 'cae-oxford-performance',
  'cae-oxford-radio-navigation': 'cae-oxford-radio-navigation',
  'cae-oxford-powerplant': 'cae-oxford-powerplant',
  'powerplant': 'cae-oxford-powerplant',
  'cae-oxford-principles-of-flight': 'cae-oxford-principles-of-flight',
  'principles-of-flight': 'cae-oxford-principles-of-flight',
  'cae-oxford-navigation': 'cae-oxford-navigation',
  'operational-procedures': 'operational-procedures',
  'instrument-2014': 'instrument',
  'instrument': 'instrument',
  'cae-oxford-meteorology': 'cae-oxford',
  'cae-oxford-radio-telephony': 'cae-oxford',
  'mass-and-balance-and-performance': 'mass-and-balance-and-performance',
  'mass-and-balance': 'mass-and-balance-and-performance'
};

const resolvePracticeQuestionFile = (bookParam, chapterParam) => {
  const book = (bookParam || '').toLowerCase();
  const chapter = (chapterParam || '').toLowerCase();
  let filePrefix = PRACTICE_BOOK_SLUG_MAPPING[book] || book;
  let filePath;

  if (chapter) {
    filePath = path.join(practiceQuestionsDir, `${filePrefix}-${chapter}.json`);

    if (!fs.existsSync(filePath)) {
      const alternativePrefixes = [];

      if (book === 'cae-oxford' && filePrefix === 'oxford') {
        alternativePrefixes.push('cae-oxford');
      }

      if (book === 'mass-and-balance-and-performance' || filePrefix === 'mass-and-balance-and-performance') {
        alternativePrefixes.push('mass-and-balance');
        alternativePrefixes.push('performance');
      }

      if (book !== filePrefix) {
        alternativePrefixes.push(book);
      }

      for (const altPrefix of alternativePrefixes) {
        const altFilePath = path.join(practiceQuestionsDir, `${altPrefix}-${chapter}.json`);
        if (fs.existsSync(altFilePath)) {
          filePath = altFilePath;
          filePrefix = altPrefix;
          break;
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      if (!fs.existsSync(practiceQuestionsDir)) {
        return { book, chapter, filePath: null };
      }

      const allFiles = fs.readdirSync(practiceQuestionsDir).filter(f => f.endsWith('.json'));
      const matchingFile = allFiles.find(f => {
        const fileBase = f.replace('.json', '');
        const normalizedFileBase = fileBase.toLowerCase();
        const normalizedChapter = chapter.toLowerCase();
        
        // Exact match
        if (normalizedFileBase.endsWith(`-${normalizedChapter}`) || normalizedFileBase === normalizedChapter || normalizedFileBase.includes(`-${normalizedChapter}-`)) {
          return true;
        }
        
        // Handle spelling variations (organisations vs organizations, etc.)
        const normalizedFileForMatching = normalizedFileBase
          .replace(/organisations/g, 'organizations')
          .replace(/organizations/g, 'organisations');
        const normalizedChapterForMatching = normalizedChapter
          .replace(/organisations/g, 'organizations')
          .replace(/organizations/g, 'organisations');
        
        return normalizedFileForMatching.endsWith(`-${normalizedChapterForMatching}`) || 
               normalizedFileForMatching === normalizedChapterForMatching || 
               normalizedFileForMatching.includes(`-${normalizedChapterForMatching}-`);
      });

      if (matchingFile) {
        filePath = path.join(practiceQuestionsDir, matchingFile);
      } else {
        return { book, chapter, filePath: null };
      }
    }
  } else {
    filePath = path.join(practiceQuestionsDir, `${filePrefix}.json`);
    if (!fs.existsSync(filePath)) {
      return { book, chapter: null, filePath: null };
    }
  }

  return { book, chapter, filePath };
};

module.exports = {
  PRACTICE_BOOK_SLUG_MAPPING,
  resolvePracticeQuestionFile,
  practiceQuestionsDir,
};
