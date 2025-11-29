const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Configuration
const PDF_INPUT_DIR = path.join(__dirname, '..', '..', 'pdf-input');
const JSON_OUTPUT_DIR = path.join(__dirname, '..', 'data', 'extracted-papers');

// Ensure output directory exists
if (!fs.existsSync(JSON_OUTPUT_DIR)) {
  fs.mkdirSync(JSON_OUTPUT_DIR, { recursive: true });
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
 * Handles various formats: A) option, A. option, (A) option, etc.
 */
function extractOptions(text) {
  const options = {};
  const optionPatterns = [
    /^([A-F])[\.\)]\s*(.+?)(?=\n[A-F][\.\)]|$)/gms,
    /^\(([A-F])\)\s*(.+?)(?=\n\([A-F]\)|$)/gms,
    /^([A-F])\s+(.+?)(?=\n[A-F]\s+|$)/gms,
  ];

  for (const pattern of optionPatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length >= 2) {
      matches.forEach(match => {
        const letter = match[1].toUpperCase();
        const optionText = match[2].trim();
        if (optionText) {
          options[letter] = optionText;
        }
      });
      if (Object.keys(options).length >= 2) {
        return options;
      }
    }
  }

  // Fallback: Try to find options in lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const foundOptions = {};
  let currentOption = null;

  for (const line of lines) {
    const optionMatch = line.match(/^([A-F])[\.\)]\s*(.+)$/i);
    if (optionMatch) {
      currentOption = optionMatch[1].toUpperCase();
      foundOptions[currentOption] = optionMatch[2].trim();
    } else if (currentOption && line.length > 0) {
      foundOptions[currentOption] += ' ' + line;
    }
  }

  if (Object.keys(foundOptions).length >= 2) {
    return foundOptions;
  }

  return null;
}

/**
 * Extract correct answer from text
 * Looks for patterns like "Answer: A", "Correct Answer: B", etc.
 */
function extractCorrectAnswer(text) {
  const answerPatterns = [
    /(?:Correct\s+)?Answer[:\s]+([A-F])/i,
    /Answer[:\s]+([A-F])/i,
    /Key[:\s]+([A-F])/i,
    /Solution[:\s]+([A-F])/i,
    /\(([A-F])\)/g,
  ];

  for (const pattern of answerPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  // Try to find answer in the last few lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const lastLines = lines.slice(-5).join(' ');
  
  for (const pattern of answerPatterns) {
    const match = lastLines.match(pattern);
    if (match) {
      return match[1].toUpperCase();
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

    if (!options || Object.keys(options).length < 2) {
      // Try to extract question text without options
      const questionMatch = block.match(/^[^\n]+/);
      if (questionMatch && questionMatch[0].length > 10) {
        // Store as question without options (non-MCQ)
        questions.push({
          ID: questionId++,
          Question: questionMatch[0].trim(),
          Options: {},
          Correct_Answer: correctAnswer || ''
        });
      }
      continue;
    }

    // Extract question text (everything before options)
    let questionText = block;
    
    // Remove answer section if present
    questionText = questionText.replace(/(?:Correct\s+)?Answer[:\s]+[A-F].*$/gmi, '');
    questionText = questionText.replace(/Key[:\s]+[A-F].*$/gmi, '');
    
    // Remove option lines to get question text
    const optionLines = Object.values(options).join('|');
    const questionMatch = questionText.match(/^(.+?)(?:\n.*?(?:A[\.\)]|\(A\)))|^(.+?)$/s);
    
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

    questions.push({
      ID: questionId++,
      Question: finalQuestionText,
      Options: options,
      Correct_Answer: correctAnswer || ''
    });
  }

  return questions;
}

/**
 * Process a single PDF file
 */
async function processPDF(pdfPath) {
  try {
    console.log(`\n📄 Processing: ${path.basename(pdfPath)}`);
    
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    
    console.log(`   Pages: ${pdfData.numpages}`);
    console.log(`   Extracting questions...`);

    const questions = parseQuestions(pdfData.text);
    
    if (questions.length === 0) {
      console.log(`   ⚠️  No questions found. The PDF format might not be recognized.`);
      console.log(`   💡 Tip: Check if the PDF contains text (not scanned images).`);
      return null;
    }

    // Generate paper name from filename
    const filename = path.basename(pdfPath, path.extname(pdfPath));
    const paperName = filename
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const outputData = {
      [paperName]: {
        Questions: questions
      }
    };

    // Save to JSON file
    const outputFilename = `${filename}.json`;
    const outputPath = path.join(JSON_OUTPUT_DIR, outputFilename);
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

    console.log(`   ✅ Extracted ${questions.length} questions`);
    console.log(`   💾 Saved to: ${path.relative(process.cwd(), outputPath)}`);

    return {
      filename: outputFilename,
      paperName,
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
  console.log('🚀 PDF Question Extractor');
  console.log('=' .repeat(50));

  // Check if input directory exists
  if (!fs.existsSync(PDF_INPUT_DIR)) {
    console.log(`\n📁 Creating input directory: ${PDF_INPUT_DIR}`);
    fs.mkdirSync(PDF_INPUT_DIR, { recursive: true });
    console.log(`\n✅ Created directory. Please add your PDF files to:`);
    console.log(`   ${PDF_INPUT_DIR}`);
    console.log(`\nThen run this script again.`);
    return;
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
    const result = await processPDF(file);
    if (result) {
      results.push(result);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));
  
  if (results.length === 0) {
    console.log('❌ No questions were extracted from any PDF.');
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Ensure PDFs contain selectable text (not scanned images)');
    console.log('   2. Check if questions follow standard MCQ format');
    console.log('   3. Verify PDFs are not password protected');
  } else {
    console.log(`✅ Successfully processed ${results.length} file(s):\n`);
    results.forEach(result => {
      console.log(`   📄 ${result.paperName}`);
      console.log(`      Questions: ${result.questionCount}`);
      console.log(`      File: ${result.filename}\n`);
    });

    console.log(`\n📁 All JSON files saved to: ${JSON_OUTPUT_DIR}`);
    console.log(`\n🔗 Next steps:`);
    console.log(`   1. Review the generated JSON files`);
    console.log(`   2. Import them into samplePapers.js or use them directly`);
    console.log(`   3. Update frontend to load these new papers`);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { processPDF, parseQuestions };

