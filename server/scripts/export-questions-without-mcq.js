const fs = require('fs');
const path = require('path');

const practiceQuestionsDir = path.join(__dirname, '../practice-questions');
const dataDir = path.join(__dirname, '../data');

const questionsWithoutMCQ = [];

console.log('Scanning all question files...\n');

// Function to process a question file
function processQuestionFile(filePath, source) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Handle different file structures
    let questions = [];
    let extractedBookName = 'Unknown Book';
    let extractedChapterTitle = 'Unknown Chapter';
    let chapterNumber = null;
    
    if (Array.isArray(data)) {
      // If data is directly an array of questions
      questions = data;
    } else if (data.questions && Array.isArray(data.questions)) {
      // If data has a questions array
      questions = data.questions;
      extractedBookName = data.book_name || data.book?.title || data.book?.name || 'Unknown Book';
      extractedChapterTitle = data.chapter_title || data.chapter?.title || data.chapter?.name || 'Unknown Chapter';
      chapterNumber = data.chapter_number || data.chapterNumber || null;
    } else if (data.question) {
      // Single question object
      questions = [data];
      extractedBookName = data.book_name || data.book?.title || 'Unknown Book';
      extractedChapterTitle = data.chapter_title || data.chapter?.title || 'Unknown Chapter';
      chapterNumber = data.chapter_number || data.chapterNumber || null;
    }
    
    questions.forEach((q, index) => {
      // Check if question has valid options (must be array with at least 2 options)
      const hasOptions = q.options && 
                        Array.isArray(q.options) && 
                        q.options.length >= 2 &&
                        q.options.some(opt => opt && String(opt).trim().length > 0);
      
      // Check if question has table (look for table-related keywords in question text)
      const questionText = q.question || q.question_text || q.text || '';
      const hasTable = questionText.toLowerCase().includes('table') || 
                      questionText.includes('<table') || 
                      (questionText.includes('|') && questionText.split('|').length > 3);
      
      // Check if question type is explicitly non-MCQ
      const questionType = q.question_type || q.type || '';
      const isNonMCQ = questionType && 
                      !['MCQ', 'mcq', 'multiple choice', 'multiple-choice'].includes(questionType);
      
      // Include questions that:
      // 1. Don't have valid options (empty, null, or less than 2 options)
      // 2. Don't have tables
      // 3. Are explicitly non-MCQ OR don't have options
      if ((!hasOptions || isNonMCQ) && !hasTable) {
        const questionData = {
          question_number: q.question_number || q.questionNumber || q.id || index + 1,
          question_text: questionText,
          question_type: questionType || (hasOptions ? 'MCQ' : 'Non-MCQ'),
          book_name: extractedBookName,
          chapter_title: extractedChapterTitle,
          chapter_number: chapterNumber,
          source_file: source,
          solution: q.solution || q.answer || '',
          explanation: q.explanation || '',
          answer: q.answer || '',
          // Include any other fields that might be present
          ...(q.id && { id: q.id }),
          ...(q.difficulty && { difficulty: q.difficulty }),
          ...(q.page_number && { page_number: q.page_number }),
          ...(q.pageNumber && { page_number: q.pageNumber }),
          ...(q.topic && { topic: q.topic }),
          ...(q.topicId && { topic_id: q.topicId }),
          ...(q.category && { category: q.category }),
          ...(q.bookId && { book_id: q.bookId }),
          ...(q.chapterId && { chapter_id: q.chapterId })
        };
        
        questionsWithoutMCQ.push(questionData);
      }
    });
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Scan practice-questions directory
if (fs.existsSync(practiceQuestionsDir)) {
  const practiceFiles = fs.readdirSync(practiceQuestionsDir).filter(f => f.endsWith('.json'));
  practiceFiles.forEach(file => {
    const filePath = path.join(practiceQuestionsDir, file);
    processQuestionFile(filePath, `practice-questions/${file}`);
  });
}

// Scan data directory for questions.json and pyq.json
if (fs.existsSync(dataDir)) {
  const dataFiles = ['questions.json', 'pyq.json'];
  dataFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      processQuestionFile(filePath, `data/${file}`);
    }
  });
}

// Sort by book name, then chapter, then question number
questionsWithoutMCQ.sort((a, b) => {
  if (a.book_name !== b.book_name) {
    return a.book_name.localeCompare(b.book_name);
  }
  if (a.chapter_title !== b.chapter_title) {
    return a.chapter_title.localeCompare(b.chapter_title);
  }
  return (a.question_number || 0) - (b.question_number || 0);
});

// Count files scanned
let filesScanned = 0;
if (fs.existsSync(practiceQuestionsDir)) {
  filesScanned += fs.readdirSync(practiceQuestionsDir).filter(f => f.endsWith('.json')).length;
}
if (fs.existsSync(dataDir)) {
  ['questions.json', 'pyq.json'].forEach(file => {
    if (fs.existsSync(path.join(dataDir, file))) {
      filesScanned++;
    }
  });
}

// Create summary
const summary = {
  total_questions: questionsWithoutMCQ.length,
  books: [...new Set(questionsWithoutMCQ.map(q => q.book_name))],
  chapters: [...new Set(questionsWithoutMCQ.map(q => `${q.book_name} - ${q.chapter_title}`))],
  generated_at: new Date().toISOString(),
  files_scanned: filesScanned
};

// Create final output structure
const output = {
  summary,
  questions: questionsWithoutMCQ
};

// Save to file
const outputPath = path.join(__dirname, '../questions-without-mcq-complete.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`\n✅ Analysis Complete!\n`);
console.log(`📊 Summary:`);
console.log(`   - Total questions without MCQ: ${questionsWithoutMCQ.length}`);
console.log(`   - Books: ${summary.books.length}`);
console.log(`   - Chapters: ${summary.chapters.length}`);
console.log(`   - Files scanned: ${filesScanned}`);
console.log(`\n💾 Results saved to: ${outputPath}\n`);

// Also create a more readable version grouped by book and chapter
const groupedOutput = {
  summary,
  questions_by_book: {}
};

questionsWithoutMCQ.forEach(q => {
  if (!groupedOutput.questions_by_book[q.book_name]) {
    groupedOutput.questions_by_book[q.book_name] = {};
  }
  if (!groupedOutput.questions_by_book[q.book_name][q.chapter_title]) {
    groupedOutput.questions_by_book[q.book_name][q.chapter_title] = [];
  }
  groupedOutput.questions_by_book[q.book_name][q.chapter_title].push(q);
});

const groupedOutputPath = path.join(__dirname, '../questions-without-mcq-grouped.json');
fs.writeFileSync(groupedOutputPath, JSON.stringify(groupedOutput, null, 2), 'utf8');
console.log(`📁 Grouped version saved to: ${groupedOutputPath}\n`);
