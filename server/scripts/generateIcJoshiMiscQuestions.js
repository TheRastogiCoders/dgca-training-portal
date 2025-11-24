const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const DATA_FILE = path.join(BASE_DIR, 'data', 'ic-joshi-meteorology-misc-questions.json');
const PRACTICE_DIR = path.join(BASE_DIR, 'practice-questions');
const PY_FALLBACK_FILE = path.join(BASE_DIR, 'scripts', 'generateIcJoshiMiscQuestions.py');

const slugMap = {
  'MISCELLANEOUS QUESTIONS': {
    slug: 'miscellaneous-questions',
    title: 'Miscellaneous Questions',
  },
  'ADDITIONAL QUESTIONS - 1': {
    slug: 'additional-questions-1',
    title: 'Additional Questions - 1',
  },
  'ADDITIONAL QUESTIONS - 2': {
    slug: 'additional-questions-2',
    title: 'Additional Questions - 2',
  },
  'QUESTIONS ON MET SERVICES FOR AVIATION': {
    slug: 'questions-on-met-services-for-aviation',
    title: 'Questions on Met Services for Aviation',
  },
  'QUESTIONS ON METEOROLOGICAL AND BRIEFING': {
    slug: 'questions-on-meteorological-and-briefing',
    title: 'Questions on Meteorological and Briefing',
  },
  'QUESTIONS ON GENERAL CIRCULATION': {
    slug: 'questions-on-general-circulation',
    title: 'Questions on General Circulation',
  },
  'QUESTIONS ON METAR and SPECI': {
    slug: 'questions-on-metar-and-speci',
    title: 'Questions on METAR and SPECI',
  },
  'QUESTIONS ON STATION MODEL': {
    slug: 'questions-on-station-model',
    title: 'Questions on Station Model',
  },
  'AVATION WEATHER FORCAST': {
    slug: 'aviation-weather-forecast',
    title: 'Aviation Weather Forecast',
  },
  'AVATION WEATHER FORCAST (2)': {
    slug: 'aviation-weather-forecast-2',
    title: 'Aviation Weather Forecast (2)',
  },
};

const optionLabels = 'abcdefghijklmnopqrstuvwxyz'.split('');

const parseOption = (raw = '', fallbackIdx = 0) => {
  const letterMatch = raw.match(/^\(\s*([a-z])\s*\)\s*[\).:-]?\s*/i);
  const letter = letterMatch ? letterMatch[1].toLowerCase() : optionLabels[fallbackIdx];
  const text = letterMatch ? raw.slice(letterMatch[0].length).trim() : raw.trim();
  return { letter, text: text || `Option ${letter.toUpperCase()}` };
};

const extractAnswerLetter = (answer = '') => {
  const match = answer.match(/([a-z])/i);
  return match ? match[1].toLowerCase() : '';
};

const slugify = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'item';

const buildQuestion = (chapterSlug, question, idx) => {
  const qnum = String(question.question_number || `Q${idx + 1}`);
  const parsedOptions = (question.options || []).map((opt, optIdx) => parseOption(opt, optIdx));
  if (!parsedOptions.length) return null;

  const answerLetter = extractAnswerLetter(question.answer || '');
  const correctIdx =
    parsedOptions.findIndex(opt => opt.letter === answerLetter) >= 0
      ? parsedOptions.findIndex(opt => opt.letter === answerLetter)
      : 0;

  const options = parsedOptions.map(opt => opt.text);
  const answer = optionLabels[correctIdx] || 'a';

  return {
    id: `${chapterSlug}-${slugify(qnum)}`,
    question_number: qnum,
    question: (question.question_text || '').trim(),
    question_type: question.question_type || 'MCQ',
    options,
    answer,
    solution: options[correctIdx] || '',
    explanation: '',
  };
};

const main = () => {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('[generateIcJoshiMiscQuestions] Data file not found:', DATA_FILE);
    process.exit(1);
  }

  if (!fs.existsSync(PRACTICE_DIR)) {
    fs.mkdirSync(PRACTICE_DIR, { recursive: true });
  }

  let raw;
  try {
    const fileText = fs.readFileSync(DATA_FILE, 'utf-8').replace(/^\uFEFF/, '');
    raw = JSON.parse(fileText.replace(/\\/g, '\\\\'));
  } catch (err) {
    if (!fs.existsSync(PY_FALLBACK_FILE)) {
      console.error('[generateIcJoshiMiscQuestions] Failed to parse data file and fallback not found.');
      throw err;
    }
    const pyText = fs.readFileSync(PY_FALLBACK_FILE, 'utf-8');
    const markerRegex = /RAW_JSON\s*=\s*r?"""/;
    const markerMatch = markerRegex.exec(pyText);
    const startIdx = markerMatch ? markerMatch.index + markerMatch[0].length : -1;
    const endIdx = startIdx >= 0 ? pyText.indexOf('"""', startIdx) : -1;
    if (startIdx === -1 || endIdx === -1) {
      console.error('[generateIcJoshiMiscQuestions] Unable to locate RAW_JSON in python fallback.');
      throw err;
    }
    const rawBlock = pyText.slice(startIdx + marker.length, endIdx);
    raw = JSON.parse(rawBlock.replace(/\\/g, '\\\\'));
  }
  const chapters = raw.data || [];
  const results = [];

  chapters.forEach(chapter => {
    const meta = slugMap[chapter.chapter_title];
    if (!meta) {
      console.warn(`[generateIcJoshiMiscQuestions] Missing slug for chapter "${chapter.chapter_title}" – skipping.`);
      return;
    }

    const questions = (chapter.questions || [])
      .map((question, idx) => buildQuestion(meta.slug, question, idx))
      .filter(Boolean);

    const payload = {
      book_name: raw.book_title || 'MET_IC_Joshi_7 Edition',
      chapter_number: chapter.chapter_number || null,
      chapter_title: meta.title,
      chapter_slug: meta.slug,
      source: 'ic-joshi',
      questions,
    };

    const target = path.join(PRACTICE_DIR, `ic-joshi-${meta.slug}.json`);
    fs.writeFileSync(target, JSON.stringify(payload, null, 2), 'utf-8');
    results.push({ slug: meta.slug, count: questions.length });
  });

  console.log('[generateIcJoshiMiscQuestions] Generated:');
  results.forEach(({ slug, count }) => {
    console.log(` • ${slug}: ${count} questions`);
  });
};

main();

