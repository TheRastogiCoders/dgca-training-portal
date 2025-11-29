const { processPDF } = require('./extract-pdf-questions');
const { mergeExtractedPapers } = require('./merge-extracted-papers');
const fs = require('fs');
const path = require('path');

/**
 * Combined script: Extract PDFs and merge with frontend
 */
async function extractAndMerge() {
  console.log('🚀 PDF Extraction & Integration Pipeline');
  console.log('='.repeat(60));
  
  // Step 1: Extract PDFs
  console.log('\n📄 Step 1: Extracting questions from PDFs...\n');
  const extractScript = require('./extract-pdf-questions');
  const PDF_INPUT_DIR = path.join(__dirname, '..', '..', 'pdf-input');
  
  if (!fs.existsSync(PDF_INPUT_DIR)) {
    console.log(`\n📁 Creating input directory: ${PDF_INPUT_DIR}`);
    fs.mkdirSync(PDF_INPUT_DIR, { recursive: true });
    console.log(`\n✅ Created directory. Please add your PDF files to:`);
    console.log(`   ${PDF_INPUT_DIR}`);
    console.log(`\nThen run this script again.`);
    return;
  }

  const files = fs.readdirSync(PDF_INPUT_DIR)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => path.join(PDF_INPUT_DIR, file));

  if (files.length === 0) {
    console.log(`\n⚠️  No PDF files found in: ${PDF_INPUT_DIR}`);
    console.log(`\nPlease add your PDF files to the directory above and run again.`);
    return;
  }

  console.log(`📚 Found ${files.length} PDF file(s)\n`);

  const results = [];
  for (const file of files) {
    const result = await extractScript.processPDF(file);
    if (result) {
      results.push(result);
    }
  }

  if (results.length === 0) {
    console.log('\n❌ No questions were extracted. Please check your PDFs and try again.');
    return;
  }

  // Step 2: Merge with frontend
  console.log('\n\n🔄 Step 2: Merging with frontend...\n');
  mergeExtractedPapers();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Pipeline Complete!');
  console.log('='.repeat(60));
  console.log(`\n🎉 Your papers are now available in the frontend!`);
  console.log(`\n📊 Summary:`);
  console.log(`   • Processed: ${files.length} PDF(s)`);
  console.log(`   • Extracted: ${results.length} paper(s)`);
  console.log(`   • Total questions: ${results.reduce((sum, r) => sum + r.questionCount, 0)}`);
}

// Run the script
if (require.main === module) {
  extractAndMerge().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { extractAndMerge };

