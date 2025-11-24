const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const sourcePath = path.join(rootDir, 'data', 'ic-joshi-meteorology-source.json');
const outputDir = path.join(rootDir, 'practice-questions');

const slugify = (str = '') =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const run = () => {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source data not found at ${sourcePath}`);
  }

  const chapters = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  chapters.forEach((chapter) => {
    const slug = slugify(chapter.chapter_title || `chapter-${chapter.chapter_number || '1'}`);
    const questions = (chapter.questions || []).map((q, idx) => {
      const rawAnswer = String(q.solution || q.answer || '').trim();
      const normalizedAnswer = rawAnswer ? rawAnswer.toLowerCase() : '';
      return {
        id: `${slug}-${String(q.question_number || idx + 1).toLowerCase()}`,
        question_number: q.question_number || `Q${idx + 1}`,
        question: q.question_text || q.question || '',
        question_type: q.question_type || 'MCQ',
        options: Array.isArray(q.options) ? q.options.map((opt) => String(opt)) : [],
        answer: normalizedAnswer,
        solution: normalizedAnswer,
        explanation: q.explanation || ''
      };
    });

    const output = {
      book_name: chapter.book_name || 'MET_IC_Joshi_7 Edition',
      chapter_number: chapter.chapter_number || '',
      chapter_title: chapter.chapter_title || '',
      chapter_slug: slug,
      source: 'ic-joshi',
      questions
    };

    const outputPath = path.join(outputDir, `ic-joshi-${slug}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`Generated ${path.relative(rootDir, outputPath)} with ${questions.length} questions.`);
  });
};

run();

