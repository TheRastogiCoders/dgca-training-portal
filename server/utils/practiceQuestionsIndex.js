const fs = require('fs');
const path = require('path');

// Extract key aviation terms from text
const extractTerms = (text) => {
  if (!text) return [];
  
  // Common aviation terms and patterns
  const aviationTerms = [
    'VOR', 'DME', 'ILS', 'GPS', 'RNAV', 'ADF', 'SSR', 'ACAS', 'GNSS',
    'Airwash', 'Pressure Gradient', 'Isobar', 'Tropopause', 'Jet Stream',
    'Airworthiness', 'Certificate', 'Licensing', 'Air Traffic Control',
    'Separation', 'Airspace', 'Approach', 'Departure', 'Holding',
    'Stress', 'Hypoxia', 'Fatigue', 'Circadian', 'GAS Syndrome',
    'Wind', 'Temperature', 'Humidity', 'Cloud', 'Thunderstorm',
    'Turbulence', 'Icing', 'Visibility', 'Altimetry', 'Density'
  ];
  
  const foundTerms = [];
  const lowerText = text.toLowerCase();
  
  aviationTerms.forEach(term => {
    if (lowerText.includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  });
  
  return foundTerms;
};

// Load all practice question files and create searchable index
const loadPracticeQuestionsIndex = () => {
  const practiceQuestionsDir = path.join(__dirname, '../practice-questions');
  
  // Check if directory exists
  if (!fs.existsSync(practiceQuestionsDir)) {
    console.error('Practice questions directory not found:', practiceQuestionsDir);
    return { topics: [], definitions: [], questions: [], chapters: [], books: [] };
  }
  
  const files = fs.readdirSync(practiceQuestionsDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} practice question files`);
  
  const topics = [];
  const definitions = [];
  const questions = [];
  const chapters = [];
  const books = new Set();
  
  files.forEach((file, fileIndex) => {
    try {
      const filePath = path.join(practiceQuestionsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      const bookName = data.book_name || 'Unknown Book';
      const chapterTitle = data.chapter_title || 'Unknown Chapter';
      const chapterNumber = data.chapter_number || '';
      
      // Create book entry
      books.add(bookName);
      
      // Create chapter entry
      const chapterId = `practice-ch-${fileIndex}`;
      chapters.push({
        id: chapterId,
        bookId: `practice-book-${bookName.replace(/\s+/g, '-').toLowerCase()}`,
        name: chapterTitle,
        source: 'practice-questions',
        fileName: file
      });
      
      // Create topic from chapter title
      topics.push({
        id: `practice-topic-${fileIndex}`,
        title: chapterTitle,
        aliases: [chapterTitle.toLowerCase(), ...extractTerms(chapterTitle)],
        bookId: `practice-book-${bookName.replace(/\s+/g, '-').toLowerCase()}`,
        chapterId: chapterId,
        pageNumber: 0,
        category: extractCategory(bookName, chapterTitle),
        relatedTopics: [],
        source: 'practice-questions',
        fileName: file
      });
      
      // Process questions
      if (data.questions && Array.isArray(data.questions)) {
        data.questions.forEach((q, qIndex) => {
          const questionId = `practice-q-${fileIndex}-${qIndex}`;
          
          // Add question
          questions.push({
            id: questionId,
            question: q.question || '',
            answer: q.answer || q.solution || '',
            explanation: q.explanation || '',
            options: q.options || [],
            topicId: `practice-topic-${fileIndex}`,
            bookId: `practice-book-${bookName.replace(/\s+/g, '-').toLowerCase()}`,
            chapterId: chapterId,
            pageNumber: 0,
            difficulty: 'Medium',
            source: 'practice-questions',
            fileName: file
          });
          
          // Extract terms from question and create definitions
          const questionText = q.question || '';
          const answerText = q.answer || q.solution || '';
          const extractedTerms = extractTerms(questionText);
          
          extractedTerms.forEach(term => {
            // Check if definition already exists
            const existingDef = definitions.find(d => d.term === term);
            if (!existingDef) {
              definitions.push({
                id: `practice-def-${term.replace(/\s+/g, '-').toLowerCase()}-${fileIndex}`,
                term: term,
                simpleExplanation: `Definition extracted from ${chapterTitle} chapter.`,
                detailedExplanation: answerText || `Related to ${chapterTitle}. See practice questions for details.`,
                formulas: [],
                examples: [questionText],
                bookId: `practice-book-${bookName.replace(/\s+/g, '-').toLowerCase()}`,
                chapterId: chapterId,
                pageNumber: 0,
                relatedTerms: [],
                source: 'practice-questions',
                fileName: file
              });
            } else {
              // Add example to existing definition
              if (!existingDef.examples) existingDef.examples = [];
              if (!existingDef.examples.includes(questionText)) {
                existingDef.examples.push(questionText);
              }
            }
          });
        });
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });
  
  return {
    topics,
    definitions,
    questions,
    chapters,
    books: Array.from(books).map((name, index) => ({
      id: `practice-book-${name.replace(/\s+/g, '-').toLowerCase()}`,
      name: name,
      author: 'Various',
      subject: extractSubject(name),
      chapters: [],
      source: 'practice-questions'
    }))
  };
};

// Extract category from book name and chapter
const extractCategory = (bookName, chapterTitle) => {
  const lowerBook = bookName.toLowerCase();
  const lowerChapter = chapterTitle.toLowerCase();
  
  if (lowerBook.includes('meteorology') || lowerChapter.includes('wind') || lowerChapter.includes('pressure') || lowerChapter.includes('cloud')) {
    return 'Meteorology';
  }
  if (lowerBook.includes('air law') || lowerBook.includes('air regulations') || lowerChapter.includes('airworthiness') || lowerChapter.includes('licensing')) {
    return 'Air Regulations';
  }
  if (lowerBook.includes('human performance') || lowerChapter.includes('stress') || lowerChapter.includes('fatigue')) {
    return 'Human Performance';
  }
  if (lowerBook.includes('navigation') || lowerChapter.includes('vor') || lowerChapter.includes('dme') || lowerChapter.includes('gps')) {
    return 'Navigation';
  }
  if (lowerBook.includes('performance') || lowerChapter.includes('performance')) {
    return 'Performance';
  }
  if (lowerBook.includes('instrument') || lowerChapter.includes('instrument')) {
    return 'Instruments';
  }
  
  return 'General';
};

// Extract subject from book name
const extractSubject = (bookName) => {
  const lower = bookName.toLowerCase();
  if (lower.includes('meteorology')) return 'Meteorology';
  if (lower.includes('air law') || lower.includes('air regulations')) return 'Air Regulations';
  if (lower.includes('human performance')) return 'Human Performance';
  if (lower.includes('navigation')) return 'Navigation';
  if (lower.includes('performance')) return 'Performance';
  if (lower.includes('instrument')) return 'Instruments';
  return 'General';
};

module.exports = {
  loadPracticeQuestionsIndex,
  extractTerms
};

