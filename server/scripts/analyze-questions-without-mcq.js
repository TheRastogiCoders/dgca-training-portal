const fs = require('fs');
const path = require('path');

const practiceQuestionsDir = path.join(__dirname, '../practice-questions');

// Get all JSON files
const files = fs.readdirSync(practiceQuestionsDir).filter(f => f.endsWith('.json'));

const questionsWithoutMCQ = [];

files.forEach(file => {
  try {
    const filePath = path.join(practiceQuestionsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (data.questions && Array.isArray(data.questions)) {
      data.questions.forEach((q, index) => {
        const hasOptions = q.options && Array.isArray(q.options) && q.options.length > 0;
        if (!hasOptions) {
          questionsWithoutMCQ.push({
            file,
            questionIndex: index,
            questionId: q.id || `q${index + 1}`,
            questionText: (q.question || q.text || '').substring(0, 100) + '...',
            book: data.book?.title || data.book?.slug || 'Unknown',
            chapter: data.chapter?.title || data.chapter?.slug || 'Unknown'
          });
        }
      });
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`\nFound ${questionsWithoutMCQ.length} questions without MCQs:\n`);
console.log(JSON.stringify(questionsWithoutMCQ, null, 2));

// Save to file
const outputPath = path.join(__dirname, '../questions-without-mcq.json');
fs.writeFileSync(outputPath, JSON.stringify(questionsWithoutMCQ, null, 2));
console.log(`\nResults saved to: ${outputPath}`);

