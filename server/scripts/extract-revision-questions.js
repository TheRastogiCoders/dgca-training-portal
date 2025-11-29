const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Configuration
const PDF_INPUT_DIR = path.join(__dirname, '..', '..', 'pdf-input');
const PRACTICE_QUESTIONS_DIR = path.join(__dirname, '..', 'practice-questions');

// Book mapping from PDF filename patterns to book identifiers
const BOOK_MAPPING = {
  // IC Joshi books
  'ic-joshi': {
    patterns: [/ic-joshi/i, /icjoshi/i],
    bookName: 'MET_IC_Joshi_7 Edition',
    source: 'ic-joshi',
    slugPrefix: 'ic-joshi'
  },
  // CAE Oxford books
  'cae-oxford-meteorology': {
    patterns: [/cae.*meteorology/i, /oxford.*meteorology/i, /meteorology.*oxford/i],
    bookName: 'CAE Oxford Meteorology',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford'
  },
  'cae-oxford-air-regulations': {
    patterns: [/cae.*air.*regulation/i, /oxford.*air.*regulation/i, /air.*regulation.*oxford/i],
    bookName: 'CAE Oxford Air Regulations',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford-air-regulations'
  },
  'cae-oxford-navigation': {
    patterns: [/cae.*navigation/i, /oxford.*navigation/i, /navigation.*oxford/i],
    bookName: 'CAE Oxford Navigation',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford-navigation'
  },
  'cae-oxford-general-navigation': {
    patterns: [/cae.*general.*navigation/i, /oxford.*general.*navigation/i, /general.*navigation.*oxford/i, /general.*navigation/i],
    bookName: 'CAE Oxford General Navigation',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford-general-navigation'
  },
  'cae-oxford-flight-planning': {
    patterns: [/flight.*planning/i, /flight.*monitoring/i, /flight.*planning.*monitoring/i],
    bookName: 'CAE Oxford Flight Planning & Monitoring',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford-flight-planning'
  },
  'cae-oxford-performance': {
    patterns: [/performance/i],
    bookName: 'CAE Oxford Performance',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford-performance'
  },
  'cae-oxford-radio-navigation': {
    patterns: [/radio.*navigation/i],
    bookName: 'CAE Oxford Radio Navigation',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford-radio-navigation'
  },
  'cae-oxford-powerplant': {
    patterns: [/powerplant/i],
    bookName: 'CAE Oxford Powerplant',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford-powerplant'
  },
  'cae-oxford-principles-of-flight': {
    patterns: [/principles.*of.*flight/i],
    bookName: 'CAE Oxford Principles of Flight',
    source: 'cae-oxford',
    slugPrefix: 'cae-oxford-principles-of-flight'
  },
  // RK Bali books
  'rk-bali': {
    patterns: [/rk.*bali/i, /rkbali/i],
    bookName: 'RK Bali',
    source: 'rk-bali',
    slugPrefix: 'rk-bali'
  },
  // Operational Procedures
  'operational-procedures': {
    patterns: [/operational.*procedure/i, /ops.*procedure/i],
    bookName: 'Operational Procedures',
    source: 'operational-procedures',
    slugPrefix: 'operational-procedures'
  },
  // Instrument
  'instrument': {
    patterns: [/instrument/i, /afcs/i],
    bookName: 'Instrument',
    source: 'instrument',
    slugPrefix: 'instrument'
  }
};

/**
 * Identify book from PDF filename
 */
function identifyBook(filename) {
  const lowerFilename = filename.toLowerCase();
  
  for (const [bookId, config] of Object.entries(BOOK_MAPPING)) {
    for (const pattern of config.patterns) {
      if (pattern.test(lowerFilename)) {
        return { bookId, ...config };
      }
    }
  }
  
  // Default fallback
  return {
    bookId: 'unknown',
    bookName: 'Unknown Book',
    source: 'unknown',
    slugPrefix: 'unknown'
  };
}

/**
 * Clean and normalize text
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract question number from text
 */
function extractQuestionNumber(text) {
  const patterns = [
    /^(\d+)\./,
    /^Q(\d+)/i,
    /^Question\s+(\d+)/i,
    /^\((\d+)\)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

/**
 * Extract options from text
 * Handles various formats: (a) option, A) option, A. option, etc.
 */
function extractOptions(text) {
  const options = [];
  const optionPatterns = [
    /^\(([a-f])\)\s*(.+?)(?=\n\([a-f]\)|$)/gims,
    /^([a-f])[\.\)]\s*(.+?)(?=\n[a-f][\.\)]|$)/gims,
    /^([a-f])\s+(.+?)(?=\n[a-f]\s+|$)/gims,
  ];

  for (const pattern of optionPatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length >= 2) {
      matches.forEach(match => {
        const letter = match[1].toLowerCase();
        const optionText = match[2].trim();
        if (optionText) {
          options.push(`(${letter}) ${optionText}`);
        }
      });
      if (options.length >= 2) {
        return options;
      }
    }
  }

  // Fallback: Try to find options in lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const foundOptions = [];
  let currentOption = null;

  for (const line of lines) {
    const optionMatch = line.match(/^\(?([a-f])\)?[\.\)]\s*(.+)$/i);
    if (optionMatch) {
      currentOption = optionMatch[1].toLowerCase();
      foundOptions.push(`(${currentOption}) ${optionMatch[2].trim()}`);
    } else if (currentOption && line.length > 0 && !line.match(/^\(?[a-f]\)?/i)) {
      // Continue previous option if line doesn't start with new option
      foundOptions[foundOptions.length - 1] += ' ' + line;
    }
  }

  if (foundOptions.length >= 2) {
    return foundOptions;
  }

  return null;
}

/**
 * Extract correct answer from text
 * Looks for patterns like "Answer: (a)", "Correct Answer: (b)", etc.
 */
function extractCorrectAnswer(text) {
  const answerPatterns = [
    /(?:Correct\s+)?Answer[:\s]+\(?([a-f])\)?/i,
    /Answer[:\s]+\(?([a-f])\)?/i,
    /Key[:\s]+\(?([a-f])\)?/i,
    /Solution[:\s]+\(?([a-f])\)?/i,
  ];

  for (const pattern of answerPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  // Try to find answer in the last few lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const lastLines = lines.slice(-5).join(' ');
  
  for (const pattern of answerPatterns) {
    const match = lastLines.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  return null;
}

/**
 * Parse questions from PDF text
 */
function parseQuestions(pdfText) {
  const questions = [];
  const cleanedText = cleanText(pdfText);
  
  // Split by question patterns
  const questionSplitters = [
    /\n(?=\d+\.\s)/g,
    /\n(?=Q\d+)/gi,
    /\n(?=Question\s+\d+)/gi,
    /\n(?=\(\d+\))/g,
  ];

  let questionBlocks = [cleanedText];
  
  for (const splitter of questionSplitters) {
    const newBlocks = [];
    questionBlocks.forEach(block => {
      newBlocks.push(...block.split(splitter));
    });
    questionBlocks = newBlocks;
  }

  let questionId = 1;

  for (const block of questionBlocks) {
    if (!block.trim() || block.trim().length < 20) continue;

    const questionNumber = extractQuestionNumber(block) || questionId;
    const options = extractOptions(block);
    const correctAnswer = extractCorrectAnswer(block);

    if (!options || options.length < 2) {
      // Try to extract question text without options
      const questionMatch = block.match(/^[^\n]+/);
      if (questionMatch && questionMatch[0].length > 10) {
        // Store as question without options (non-MCQ)
        questions.push({
          question_number: `Q${questionId}`,
          question: questionMatch[0].trim(),
          question_type: 'MCQ',
          options: [],
          answer: correctAnswer || '',
          solution: correctAnswer || '',
          explanation: ''
        });
        questionId++;
      }
      continue;
    }

    // Extract question text (everything before options)
    let questionText = block;
    
    // Remove answer section if present
    questionText = questionText.replace(/(?:Correct\s+)?Answer[:\s]+\(?[a-f]\)?.*$/gmi, '');
    questionText = questionText.replace(/Key[:\s]+\(?[a-f]\)?.*$/gmi, '');
    
    // Remove option lines to get question text
    const questionMatch = questionText.match(/^(.+?)(?:\n.*?(?:\([a-f]\)|\([A-F]\)|[a-f][\.\)]|[A-F][\.\)]))|^(.+?)$/s);
    
    let finalQuestionText = '';
    if (questionMatch) {
      finalQuestionText = (questionMatch[1] || questionMatch[2] || '').trim();
      // Remove question number prefix
      finalQuestionText = finalQuestionText.replace(/^(\d+\.|Q\d+|Question\s+\d+|\(\d+\))\s*/i, '').trim();
    } else {
      // Fallback: take first few lines
      const lines = questionText.split('\n').filter(l => l.trim());
      finalQuestionText = lines.slice(0, 3).join(' ').trim();
    }

    if (finalQuestionText.length < 10) {
      continue;
    }

    // Find correct answer index
    const answerIndex = correctAnswer 
      ? options.findIndex(opt => opt.toLowerCase().startsWith(`(${correctAnswer})`))
      : -1;
    const solution = answerIndex >= 0 ? options[answerIndex] : (options[0] || '');

    questions.push({
      question_number: `Q${questionId}`,
      question: finalQuestionText,
      question_type: 'MCQ',
      options: options,
      answer: correctAnswer || (answerIndex >= 0 ? correctAnswer : 'a'),
      solution: solution,
      explanation: ''
    });
    questionId++;
  }

  return questions;
}

/**
 * Process a single PDF file for Revision Questions
 */
async function processRevisionPDF(pdfPath) {
  try {
    const filename = path.basename(pdfPath, path.extname(pdfPath));
    console.log(`\n📄 Processing: ${filename}.pdf`);
    
    // Identify book from filename
    const bookInfo = identifyBook(filename);
    console.log(`   📚 Identified Book: ${bookInfo.bookName}`);
    
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    console.log(`   Pages: ${pdfData.numpages}`);
    console.log(`   Extracting Revision Questions...`);

    const questions = parseQuestions(pdfData.text);
    
    if (questions.length === 0) {
      console.log(`   ⚠️  No questions found. The PDF format might not be recognized.`);
      return null;
    }

    // Generate chapter slug
    const chapterSlug = `${bookInfo.slugPrefix}-revision-questions`;
    const chapterTitle = 'Revision Questions';

    // Build practice question file structure
    const outputData = {
      book_name: bookInfo.bookName,
      chapter_number: 'N/A',
      chapter_title: chapterTitle,
      chapter_slug: chapterSlug,
      source: bookInfo.source,
      questions: questions
    };

    // Save to practice-questions directory
    const outputFilename = `${chapterSlug}.json`;
    const outputPath = path.join(PRACTICE_QUESTIONS_DIR, outputFilename);
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

    console.log(`   ✅ Extracted ${questions.length} questions`);
    console.log(`   💾 Saved to: ${path.relative(process.cwd(), outputPath)}`);

    return {
      filename: outputFilename,
      bookName: bookInfo.bookName,
      questionCount: questions.length,
      path: outputPath
    };

  } catch (error) {
    console.error(`   ❌ Error processing ${path.basename(pdfPath)}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Revision Questions Extractor');
  console.log('='.repeat(60));

  // Check if input directory exists
  if (!fs.existsSync(PDF_INPUT_DIR)) {
    console.log(`\n📁 Creating input directory: ${PDF_INPUT_DIR}`);
    fs.mkdirSync(PDF_INPUT_DIR, { recursive: true });
    console.log(`\n✅ Created directory. Please add your PDF files to:`);
    console.log(`   ${PDF_INPUT_DIR}`);
    console.log(`\nThen run this script again.`);
    return;
  }

  // Show the path being used (for debugging)
  console.log(`\n📂 PDF Input Directory: ${PDF_INPUT_DIR}`);
  console.log(`   (Resolved from: ${path.resolve(PDF_INPUT_DIR)})`);

  // Ensure practice-questions directory exists
  if (!fs.existsSync(PRACTICE_QUESTIONS_DIR)) {
    fs.mkdirSync(PRACTICE_QUESTIONS_DIR, { recursive: true });
  }

  // Find all PDF files
  const files = fs.readdirSync(PDF_INPUT_DIR)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => path.join(PDF_INPUT_DIR, file));

  if (files.length === 0) {
    console.log(`\n⚠️  No PDF files found in: ${PDF_INPUT_DIR}`);
    console.log(`\nPlease add your PDF files to the directory above and run again.`);
    return;
  }

  console.log(`\n📚 Found ${files.length} PDF file(s)`);

  const results = [];
  for (const file of files) {
    const result = await processRevisionPDF(file);
    if (result) {
      results.push(result);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  
  if (results.length === 0) {
    console.log('❌ No questions were extracted from any PDF.');
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Ensure PDFs contain selectable text (not scanned images)');
    console.log('   2. Check if questions follow standard MCQ format');
    console.log('   3. Verify PDFs are not password protected');
    console.log('   4. Ensure PDF filename contains book identifier (e.g., "ic-joshi", "cae-oxford")');
  } else {
    console.log(`✅ Successfully processed ${results.length} file(s):\n`);
    results.forEach(result => {
      console.log(`   📄 ${result.bookName}`);
      console.log(`      Questions: ${result.questionCount}`);
      console.log(`      File: ${result.filename}\n`);
    });

    console.log(`\n📁 All practice question files saved to: ${PRACTICE_QUESTIONS_DIR}`);
    console.log(`\n🔗 Next steps:`);
    console.log(`   1. Review the generated JSON files`);
    console.log(`   2. The chapters will appear in your book chapter list`);
    console.log(`   3. Users can access them via: /practice/[subject]/[book]/[chapter]`);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { processRevisionPDF, identifyBook, parseQuestions };

