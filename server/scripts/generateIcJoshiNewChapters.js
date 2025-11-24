const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../data/ic-joshi-meteorology-extra-chapters.json');
const PRACTICE_DIR = path.join(__dirname, '../practice-questions');

const slugMap = {
  'AIR MASSES, FRONTS AND WD': {
    slug: 'air-masses-fronts-and-western-disturbances',
    title: 'Air Masses, Fronts and Western Disturbances'
  },
  'ICE ACCRETION': {
    slug: 'ice-accretion',
    title: 'Ice Accretion'
  },
  'JET STREAMS': {
    slug: 'jet-streams',
    title: 'Jet Streams'
  },
  'CAT AND MOUNTAIN WAVES': {
    slug: 'cat-and-mountain-waves',
    title: 'CAT and Mountain Waves'
  },
  'TROPICAL SYSTEMS': {
    slug: 'tropical-systems',
    title: 'Tropical Systems'
  },
  'CLIMATOLOGY OF INDIA': {
    slug: 'climatology-of-india',
    title: 'Climatology of India'
  },
  'THUNDERSTORM': {
    slug: 'thunderstorm',
    title: 'Thunderstorm'
  }
};

const skipQuestions = {
  'AIR MASSES, FRONTS AND WD': ['Q6', 'Q8', 'Q10', 'Q13'],
  'ICE ACCRETION': ['Q11'],
  'TROPICAL SYSTEMS': ['Q7']
};

const optionLabels = 'abcdefghijklmnopqrstuvwxyz'.split('');

function normalizeOptions(options = []) {
  return options
    .map(opt => {
      if (typeof opt === 'string') return opt.trim();
      return (opt?.option_text || '').trim();
    })
    .filter(Boolean);
}

function findCorrectIndex(options = []) {
  return options.findIndex(opt => typeof opt === 'object' ? !!opt.is_correct : false);
}

function buildQuestion(chapterSlug, question) {
  const mappedOptions = normalizeOptions(question.options);
  const correctIndex = findCorrectIndex(question.options);
  if (correctIndex < 0 || !mappedOptions[correctIndex]) {
    return null;
  }

  const answerLabel = optionLabels[correctIndex] || '';
  if (!answerLabel) return null;

  const solutionText = (() => {
    const raw = (question.correct_option_text || '').trim();
    if (!raw || /missing in source/i.test(raw)) {
      return mappedOptions[correctIndex];
    }
    return raw;
  })();

  return {
    id: `${chapterSlug}-${(question.question_number || `q${Math.random()}`).toLowerCase()}`,
    question_number: question.question_number,
    question: question.question_text,
    question_type: question.question_type || 'MCQ',
    options: mappedOptions,
    answer: answerLabel,
    solution: solutionText,
    explanation: ''
  };
}

function main() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error('[generateIcJoshiNewChapters] Source file not found:', SOURCE_FILE);
    process.exit(1);
  }

  if (!fs.existsSync(PRACTICE_DIR)) {
    fs.mkdirSync(PRACTICE_DIR, { recursive: true });
  }

  const raw = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
  const chapters = Array.isArray(raw.chapters) ? raw.chapters : [];

  chapters.forEach(chapter => {
    const meta = slugMap[chapter.chapter_title];
    if (!meta) {
      console.warn(`[generateIcJoshiNewChapters] Missing slug mapping for chapter "${chapter.chapter_title}" – skipping.`);
      return;
    }

    const skipList = skipQuestions[chapter.chapter_title] || [];
    const filteredQuestions = (chapter.questions || [])
      .filter(q => !skipList.includes(q.question_number))
      .map(q => buildQuestion(meta.slug, q))
      .filter(Boolean);

    const payload = {
      book_name: raw.book_name || 'MET_IC_Joshi_7 Edition',
      chapter_number: Number(chapter.chapter_number) || chapter.chapter_number,
      chapter_title: meta.title,
      chapter_slug: meta.slug,
      source: 'ic-joshi',
      questions: filteredQuestions
    };

    const fileName = `ic-joshi-${meta.slug}.json`;
    const targetPath = path.join(PRACTICE_DIR, fileName);
    fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`[generateIcJoshiNewChapters] Wrote ${filteredQuestions.length} questions → ${fileName}`);
  });
}

main();

