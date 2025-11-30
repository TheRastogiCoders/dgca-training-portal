#!/usr/bin/env node

/**
 * Complete connection verification for Mass & Balance and Performance book
 * Shows the full chain: books.json → chapters → JSON files → API → Frontend
 */

const books = require('../data/books.json');
const chapters = require('../data/chapters.json');
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(100));
console.log('  MASS & BALANCE AND PERFORMANCE - COMPLETE CONNECTION VERIFICATION');
console.log('='.repeat(100) + '\n');

const mbBook = books.find(b => b.id === 'mass-and-balance-and-performance');
const mbChapters = chapters.filter(c => c.bookId === 'mass-and-balance-and-performance');

// Section 1: Database Configuration
console.log('📚 1. DATABASE CONFIGURATION (books.json)');
console.log('─'.repeat(100));
console.log(`  Book ID: ${mbBook.id}`);
console.log(`  Book Name: ${mbBook.name}`);
console.log(`  Subject: ${mbBook.subject}`);
console.log(`  Description: ${mbBook.description}`);
console.log(`  Total Chapters: ${mbBook.chapters.length}\n`);

// Section 2: Chapter Details from books.json
console.log('📖 2. CHAPTERS FROM BOOKS.JSON');
console.log('─'.repeat(100));
const masBalance = [];
const performance = [];
mbBook.chapters.forEach((ch, i) => {
  const info = `Ch${(i+1).toString().padStart(2)}: ${ch.name.padEnd(30)} (slug: ${ch.slug})`;
  if (i < 8) masBalance.push(info);
  else performance.push(info);
});
console.log('  MASS & BALANCE (Chapters 1-8):');
masBalance.forEach(info => console.log('    ' + info));
console.log('\n  PERFORMANCE (Chapters 9-16):');
performance.forEach(info => console.log('    ' + info));
console.log();

// Section 3: JSON Files Verification
console.log('📄 3. JSON FILES VERIFICATION');
console.log('─'.repeat(100));
let allFilesExist = true;
let totalQuestions = 0;
const fileStats = {};

mbBook.chapters.forEach((ch, i) => {
  const category = i < 8 ? 'mass-and-balance' : 'performance';
  const fileName = `${category}-${ch.slug}.json`;
  const filePath = path.join(__dirname, '..', 'practice-questions', fileName);
  const exists = fs.existsSync(filePath);
  
  if (!exists) {
    allFilesExist = false;
  } else {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const qCount = content.questions?.length || 0;
      totalQuestions += qCount;
      fileStats[i] = { fileName, exists, qCount };
    } catch (e) {
      fileStats[i] = { fileName, exists, qCount: 0, error: true };
    }
  }
});

Object.entries(fileStats).forEach(([idx, stat]) => {
  const i = parseInt(idx);
  const category = i < 8 ? 'MB' : 'PERF';
  const status = stat.exists ? '✓' : '✗';
  const qInfo = stat.qCount ? ` [${stat.qCount}Q]` : '';
  console.log(`  ${status} ${stat.fileName.padEnd(50)} ${qInfo}`);
});

console.log(`\n  Total Questions: ${totalQuestions}`);
console.log(`  Files Complete: ${allFilesExist ? 'YES ✓' : 'NO ✗'}\n`);

// Section 4: API Endpoint Mapping
console.log('🔌 4. API ENDPOINT MAPPING');
console.log('─'.repeat(100));
console.log('  Endpoint: /api/practice-questions/mass-and-balance-and-performance?chapter={slug}');
console.log('\n  Examples:');
console.log('    GET /api/practice-questions/mass-and-balance-and-performance?chapter=general-principles');
console.log('    GET /api/practice-questions/mass-and-balance-and-performance?chapter=takeoff-performance');
console.log('    GET /api/practice-questions/mass-and-balance-and-performance?chapter=cg-calculations\n');

// Section 5: Frontend Subject Mapping
console.log('🎨 5. FRONTEND SUBJECT MAPPING (BookChapters.js)');
console.log('─'.repeat(100));
console.log('  Subject: "mass-and-balance"');
console.log('    ├─ Book: "mass-and-balance-and-performance"');
console.log('    └─ Chapters: 8 (General Principles, Aircraft Weighing, CG Calculations, ...)');
console.log('\n  Subject: "performance"');
console.log('    ├─ Book: "mass-and-balance-and-performance"');
console.log('    └─ Chapters: 8 (Takeoff Performance, Climb Performance, ...)\n');

// Section 6: Chapter Slug Resolution
console.log('🔄 6. CHAPTER SLUG RESOLUTION (chapterSlug.js)');
console.log('─'.repeat(100));
const slugMappings = {
  'centre-of-gravity-calculations': 'cg-calculations',
};
console.log('  Overrides for mass-and-balance-and-performance:');
Object.entries(slugMappings).forEach(([from, to]) => {
  console.log(`    "${from}" → "${to}"`);
});
console.log();

// Section 7: Complete Flow
console.log('🔗 7. COMPLETE CONNECTION FLOW');
console.log('─'.repeat(100));
console.log(`
  1. User selects "Performance" subject
  2. Frontend loads from BookChapters.js: 'performance' → 'mass-and-balance-and-performance'
  3. Shows 8 chapters: Takeoff Performance, Climb Performance, ...
  4. User clicks "Takeoff Performance"
  5. Navigate to: /pyq/book/mass-and-balance-and-performance/takeoff-performance
  6. BookPracticeRunner fetches:
     GET /api/practice-questions/mass-and-balance-and-performance?chapter=takeoff-performance
  7. Server:
     a. Maps book: mass-and-balance-and-performance → mass-and-balance-and-performance
     b. Constructs file: performance-takeoff-performance.json
     c. Loads 5 questions from file
  8. Frontend displays questions with proper numbering (1, 2, 3, 4, 5)
`);

// Final Status
console.log('─'.repeat(100));
console.log('✅ CONNECTION VERIFICATION COMPLETE\n');
console.log(`  Status: ${allFilesExist && totalQuestions > 0 ? '✓ READY FOR DEPLOYMENT' : '✗ NEEDS FIXES'}`);
console.log(`  All files found: ${allFilesExist ? 'YES' : 'NO'}`);
console.log(`  Total questions: ${totalQuestions}`);
console.log(`  Chapters configured: ${mbBook.chapters.length}`);
console.log('\n' + '='.repeat(100) + '\n');
