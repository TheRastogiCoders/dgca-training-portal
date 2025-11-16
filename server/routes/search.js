const express = require('express');
const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { loadPracticeQuestionsIndex } = require('../utils/practiceQuestionsIndex');

// Initialize Google AI for content rewriting only
const apiKey = process.env.GOOGLE_API_KEY;
let model;
if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// Load JSON data files
const loadJSONFile = (filename) => {
  try {
    const filePath = path.join(__dirname, '../data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// Cache loaded data
let booksCache = null;
let topicsCache = null;
let definitionsCache = null;
let chaptersCache = null;
let questionsCache = null;
let pyqCache = null;
let practiceQuestionsIndex = null;

// Load practice questions index on startup
const loadAllData = () => {
  try {
    console.log('Loading practice questions index...');
    practiceQuestionsIndex = loadPracticeQuestionsIndex();
    console.log(`Loaded ${practiceQuestionsIndex.topics.length} topics, ${practiceQuestionsIndex.definitions.length} definitions, ${practiceQuestionsIndex.questions.length} questions from practice files`);
  } catch (error) {
    console.error('Error loading practice questions index:', error);
    practiceQuestionsIndex = { topics: [], definitions: [], questions: [], chapters: [], books: [] };
  }
};

// Load on module initialization
loadAllData();

const getBooks = () => {
  if (!booksCache) {
    booksCache = loadJSONFile('books.json');
    // Merge with practice questions books
    if (practiceQuestionsIndex && practiceQuestionsIndex.books) {
      booksCache = [...booksCache, ...practiceQuestionsIndex.books];
    }
  }
  return booksCache;
};

const getTopics = () => {
  if (!topicsCache) {
    topicsCache = loadJSONFile('topics.json');
    // Merge with practice questions topics
    if (practiceQuestionsIndex && practiceQuestionsIndex.topics) {
      topicsCache = [...topicsCache, ...practiceQuestionsIndex.topics];
    }
  }
  return topicsCache;
};

const getDefinitions = () => {
  if (!definitionsCache) {
    definitionsCache = loadJSONFile('definitions.json');
    // Merge with practice questions definitions
    if (practiceQuestionsIndex && practiceQuestionsIndex.definitions) {
      definitionsCache = [...definitionsCache, ...practiceQuestionsIndex.definitions];
    }
  }
  return definitionsCache;
};

const getChapters = () => {
  if (!chaptersCache) {
    chaptersCache = loadJSONFile('chapters.json');
    // Merge with practice questions chapters
    if (practiceQuestionsIndex && practiceQuestionsIndex.chapters) {
      chaptersCache = [...chaptersCache, ...practiceQuestionsIndex.chapters];
    }
  }
  return chaptersCache;
};

const getQuestions = () => {
  if (!questionsCache) {
    questionsCache = loadJSONFile('questions.json');
    // Merge with practice questions
    if (practiceQuestionsIndex && practiceQuestionsIndex.questions) {
      questionsCache = [...questionsCache, ...practiceQuestionsIndex.questions];
    }
  }
  return questionsCache;
};

const getPYQs = () => {
  if (!pyqCache) {
    pyqCache = loadJSONFile('pyq.json');
  }
  return pyqCache;
};

// Search helper function
const searchInData = (query, data, fields) => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  return data.filter(item =>
    fields.some(field =>
      (item[field] || '').toLowerCase().includes(lowerQuery)
    ) ||
    (item.aliases && item.aliases.some(alias =>
      alias.toLowerCase().includes(lowerQuery)
    ))
  );
};

// Extract keywords from text
const extractKeywords = (text) => {
  if (!text) return [];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3); // Filter out short words
  return [...new Set(words)]; // Remove duplicates
};

// Find relevant content for question explanation
const findRelevantContent = (questionText, options, correctAnswer, bookName, chapterName) => {
  const topics = getTopics();
  const definitions = getDefinitions();
  const questions = getQuestions();
  
  // Extract keywords from question
  const questionKeywords = extractKeywords(questionText);
  const allKeywords = [...questionKeywords];
  
  // Add keywords from options
  options.forEach(opt => {
    allKeywords.push(...extractKeywords(opt));
  });
  
  // Find matching definitions
  const matchingDefinitions = definitions.filter(def => {
    const defText = `${def.term} ${def.simpleExplanation} ${def.detailedExplanation}`.toLowerCase();
    return allKeywords.some(keyword => defText.includes(keyword));
  });
  
  // Find matching topics
  const matchingTopics = topics.filter(topic => {
    const topicText = `${topic.title} ${topic.aliases?.join(' ') || ''}`.toLowerCase();
    return allKeywords.some(keyword => topicText.includes(keyword));
  });
  
  // Find related questions
  const relatedQuestions = questions.filter(q => {
    const qText = `${q.question || q.text || ''}`.toLowerCase();
    return allKeywords.some(keyword => qText.includes(keyword));
  });
  
  return {
    definitions: matchingDefinitions.slice(0, 3), // Top 3 matches
    topics: matchingTopics.slice(0, 2),
    relatedQuestions: relatedQuestions.slice(0, 2)
  };
};

// POST /api/search/explain-question - Generate explanation for a question
router.post('/explain-question', async (req, res) => {
  try {
    const body = z.object({
      question: z.string().min(1),
      options: z.array(z.string()),
      correctAnswer: z.string(),
      selectedAnswer: z.string().optional(),
      bookName: z.string().optional(),
      chapterName: z.string().optional()
    }).parse(req.body);
    
    const { question, options, correctAnswer, selectedAnswer, bookName, chapterName } = body;
    
    // Find relevant content
    const relevantContent = findRelevantContent(question, options, correctAnswer, bookName, chapterName);
    
    // Build context for AI
    let contextText = `Question: ${question}\n\nOptions:\n`;
    options.forEach((opt, idx) => {
      const label = ['a', 'b', 'c', 'd', 'e', 'f'][idx];
      contextText += `${label}. ${opt}\n`;
    });
    contextText += `\nCorrect Answer: ${correctAnswer}\n`;
    
    if (selectedAnswer && selectedAnswer !== correctAnswer) {
      contextText += `Selected Answer: ${selectedAnswer} (Incorrect)\n`;
    }
    
    // Add relevant definitions
    if (relevantContent.definitions.length > 0) {
      contextText += `\nRelevant Definitions:\n`;
      relevantContent.definitions.forEach(def => {
        contextText += `- ${def.term}: ${def.simpleExplanation}\n`;
        if (def.detailedExplanation) {
          contextText += `  ${def.detailedExplanation.substring(0, 200)}...\n`;
        }
      });
    }
    
    // Add relevant topics
    if (relevantContent.topics.length > 0) {
      contextText += `\nRelevant Topics:\n`;
      relevantContent.topics.forEach(topic => {
        contextText += `- ${topic.title}\n`;
      });
    }
    
    // Generate explanation using AI
    let explanation = '';
    if (model) {
      try {
        const prompt = `You are an aviation instructor explaining a DGCA/CPL/ATPL exam question. Provide a clear, concise explanation for why the correct answer is correct. ${selectedAnswer && selectedAnswer !== correctAnswer ? `Also explain why the selected answer "${selectedAnswer}" is incorrect.` : ''}

${contextText}

Provide a clear explanation (2-4 sentences) that:
1. Explains why the correct answer is correct
2. ${selectedAnswer && selectedAnswer !== correctAnswer ? 'Explains why the selected answer is incorrect' : 'Briefly mentions why other options are incorrect'}
3. Uses aviation terminology accurately
4. Is educational and helps the student understand the concept

Explanation:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        explanation = response.text().trim();
      } catch (aiError) {
        console.error('AI explanation generation error:', aiError);
        // Fallback to keyword-based explanation
        explanation = generateKeywordBasedExplanation(question, options, correctAnswer, relevantContent);
      }
    } else {
      // No AI available, use keyword-based explanation
      explanation = generateKeywordBasedExplanation(question, options, correctAnswer, relevantContent);
    }
    
    res.json({
      explanation,
      relevantDefinitions: relevantContent.definitions.map(d => ({
        term: d.term,
        explanation: d.simpleExplanation
      })),
      relevantTopics: relevantContent.topics.map(t => t.title)
    });
  } catch (error) {
    console.error('Error in /explain-question:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to generate explanation', message: error.message });
  }
});

// Generate keyword-based explanation when AI is not available
const generateKeywordBasedExplanation = (question, options, correctAnswer, relevantContent) => {
  const correctOption = options.find((opt, idx) => {
    const label = ['a', 'b', 'c', 'd', 'e', 'f'][idx];
    return label === correctAnswer.toLowerCase();
  });
  
  let explanation = `The correct answer is ${correctAnswer.toUpperCase()}: ${correctOption || 'See option above'}.\n\n`;
  
  if (relevantContent.definitions.length > 0) {
    explanation += `This question relates to ${relevantContent.definitions[0].term}. `;
    explanation += relevantContent.definitions[0].simpleExplanation;
  } else {
    explanation += `This question tests your understanding of ${extractKeywords(question).slice(0, 2).join(' and ')}. `;
    explanation += `The correct answer is based on standard aviation principles and regulations.`;
  }
  
  return explanation;
};

// GET /api/search/suggest - Get search suggestions
router.get('/suggest', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const books = getBooks();
    const topics = getTopics();
    const definitions = getDefinitions();
    const chapters = getChapters();
    const questions = getQuestions();

    const suggestions = [];

    // Search in topics
    const matchedTopics = searchInData(query, topics, ['title']);
    matchedTopics.forEach(topic => {
      const book = books.find(b => b.id === topic.bookId);
      suggestions.push({
        id: topic.id,
        text: `${topic.title} – ${book?.name || 'Unknown'}, Chapter ${topic.chapterId || 'N/A'}`,
        type: 'topic',
        bookId: topic.bookId,
        chapterId: topic.chapterId
      });
    });

    // Search in definitions
    const matchedDefinitions = searchInData(query, definitions, ['term']);
    matchedDefinitions.forEach(def => {
      const book = books.find(b => b.id === def.bookId);
      suggestions.push({
        id: def.id,
        text: `${def.term} – ${book?.name || 'Unknown'}`,
        type: 'definition',
        bookId: def.bookId,
        chapterId: def.chapterId
      });
    });

    // Search in questions
    const matchedQuestions = searchInData(query, questions, ['question', 'text']);
    matchedQuestions.forEach(question => {
      const book = books.find(b => b.id === question.bookId);
      suggestions.push({
        id: question.id,
        text: `${(question.question || question.text || '').substring(0, 60)}... – ${book?.name || 'Unknown'}`,
        type: 'question',
        bookId: question.bookId,
        chapterId: question.chapterId
      });
    });

    // Search in chapters
    const matchedChapters = searchInData(query, chapters, ['name']);
    matchedChapters.forEach(chapter => {
      const book = books.find(b => b.id === chapter.bookId);
      suggestions.push({
        id: chapter.id,
        text: `${chapter.name} – ${book?.name || 'Unknown'}`,
        type: 'chapter',
        bookId: chapter.bookId,
        chapterId: chapter.id
      });
    });

    // Search in books
    const matchedBooks = searchInData(query, books, ['name', 'author']);
    matchedBooks.forEach(book => {
      suggestions.push({
        id: book.id,
        text: `${book.name} – ${book.author}`,
        type: 'book',
        bookId: book.id
      });
    });

    // Remove duplicates and limit to 10
    const uniqueSuggestions = suggestions
      .filter((s, index, self) => 
        index === self.findIndex(t => t.id === s.id && t.type === s.type)
      )
      .slice(0, 10);

    res.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error('Error in /suggest:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// POST /api/search/ask - Get detailed answer with AI summarization
router.post('/ask', async (req, res) => {
  try {
    console.log('[/ask] Received request:', req.body);
    const body = z.object({ 
      query: z.string().min(1),
      suggestionId: z.string().optional(),
      suggestionType: z.string().optional()
    }).parse(req.body);
    
    console.log('[/ask] Parsed body:', body);

    const { query, suggestionId, suggestionType } = body;
    const books = getBooks();
    const topics = getTopics();
    const definitions = getDefinitions();
    const chapters = getChapters();
    const questions = getQuestions();
    const pyqs = getPYQs();
    
    console.log('[/ask] Loaded data:', {
      books: books.length,
      topics: topics.length,
      definitions: definitions.length,
      chapters: chapters.length,
      questions: questions.length,
      pyqs: pyqs.length
    });

    let matchedContent = null;
    let matchedTopic = null;
    let matchedDefinition = null;

    // If suggestion ID provided, use it directly
    if (suggestionId && suggestionType) {
      if (suggestionType === 'topic') {
        matchedTopic = topics.find(t => t.id === suggestionId);
      } else if (suggestionType === 'definition') {
        matchedDefinition = definitions.find(d => d.id === suggestionId);
      } else if (suggestionType === 'question') {
        // Handle question type - find the question and extract topic/definition
        const matchedQuestion = questions.find(q => q.id === suggestionId);
        if (matchedQuestion) {
          // Try to find topic from chapter
          const chapter = chapters.find(c => c.id === matchedQuestion.chapterId);
          if (chapter) {
            matchedTopic = topics.find(t => t.title === chapter.name || t.chapterId === chapter.id);
          }
          // If no topic found, create a temporary definition from the question
          if (!matchedTopic && !matchedDefinition) {
            matchedDefinition = {
              id: matchedQuestion.id,
              term: chapter?.name || 'Question Topic',
              simpleExplanation: matchedQuestion.answer || matchedQuestion.explanation || '',
              detailedExplanation: `Question: ${matchedQuestion.question}\n\nAnswer: ${matchedQuestion.answer || matchedQuestion.explanation || 'See options below.'}`,
              formulas: [],
              examples: [matchedQuestion.question],
              bookId: matchedQuestion.bookId,
              chapterId: matchedQuestion.chapterId,
              pageNumber: matchedQuestion.pageNumber,
              relatedTerms: [],
              source: 'practice-questions'
            };
          }
        }
      }
    }

    // If no direct match, search for content
    if (!matchedTopic && !matchedDefinition) {
      // Prioritize definitions over topics
      const matchedDefs = searchInData(query, definitions, ['term', 'simpleExplanation', 'detailedExplanation']);
      if (matchedDefs.length > 0) {
        matchedDefinition = matchedDefs[0];
      } else {
        const matchedTopics = searchInData(query, topics, ['title']);
        if (matchedTopics.length > 0) {
          matchedTopic = matchedTopics[0];
        }
      }
    }

    // Use definition if available, otherwise use topic
    matchedContent = matchedDefinition || matchedTopic;

    if (!matchedContent) {
      return res.json({
        title: 'No Results Found',
        simpleExplanation: `No information found for "${query}". Please try a different search term.`,
        detailedExplanation: '',
        examples: [],
        formulas: [],
        bookReferences: [],
        relatedPYQs: [],
        relatedSubtopics: []
      });
    }

    // Extract book reference
    const book = books.find(b => b.id === matchedContent.bookId);
    const chapter = chapters.find(c => c.id === matchedContent.chapterId);
    const bookReferences = [];
    if (book) {
      bookReferences.push({
        bookName: book.name,
        chapterName: chapter?.name || '',
        pageNumber: matchedContent.pageNumber || ''
      });
    }

    // Find related PYQs
    const relatedPYQs = [];
    if (matchedContent.term || matchedContent.title) {
      const searchTerm = (matchedContent.term || matchedContent.title || '').toLowerCase();
      const matchingPYQs = pyqs.filter(pyq => {
        const pyqText = `${pyq.question || ''} ${pyq.answer || ''}`.toLowerCase();
        return pyqText.includes(searchTerm.substring(0, 10));
      });
      relatedPYQs.push(...matchingPYQs.slice(0, 3).map(pyq => ({
        question: pyq.question || '',
        answer: pyq.answer || '',
        year: pyq.year || ''
      })));
    }

    // Find related questions from practice questions
    const relatedQuestions = [];
    if (matchedContent.term || matchedContent.title) {
      const searchTerm = (matchedContent.term || matchedContent.title || '').toLowerCase();
      const matchingQuestions = questions.filter(q => {
        const qText = `${q.question || q.text || ''}`.toLowerCase();
        return qText.includes(searchTerm.substring(0, 10));
      });
      relatedQuestions.push(...matchingQuestions.slice(0, 3).map(q => ({
        question: q.question || q.text || '',
        answer: q.answer || '',
        bookId: q.bookId,
        chapterId: q.chapterId
      })));
    }

    // Find related subtopics
    const relatedSubtopics = [];
    if (matchedContent.relatedTopics && Array.isArray(matchedContent.relatedTopics)) {
      matchedContent.relatedTopics.forEach(topicId => {
        const relatedTopic = topics.find(t => t.id === topicId);
        if (relatedTopic) {
          relatedSubtopics.push(relatedTopic.title);
        }
      });
    }

    // Prepare content for AI rewriting
    let contentToRewrite = '';
    if (matchedDefinition) {
      contentToRewrite = `Term: ${matchedDefinition.term}\n\nSimple Explanation: ${matchedDefinition.simpleExplanation}\n\nDetailed Explanation: ${matchedDefinition.detailedExplanation}`;
      if (matchedDefinition.examples && matchedDefinition.examples.length > 0) {
        contentToRewrite += `\n\nExamples:\n${matchedDefinition.examples.join('\n')}`;
      }
      if (matchedDefinition.formulas && matchedDefinition.formulas.length > 0) {
        contentToRewrite += `\n\nFormulas:\n${matchedDefinition.formulas.map(f => `${f.name}: ${f.formula}`).join('\n')}`;
      }
    } else if (matchedTopic) {
      contentToRewrite = `Topic: ${matchedTopic.title}\n\nThis topic is covered in ${book?.name || 'the book'}, Chapter ${chapter?.name || 'N/A'}.`;
    }

    // Use AI to rewrite/simplify the content
    let rewrittenContent = contentToRewrite;
    if (model && contentToRewrite) {
      try {
        const prompt = `You are an aviation instructor. Rewrite and simplify the following aviation content for a student. Make it clear, concise, and educational. Do NOT add new information - only reorganize and simplify what is provided. Keep all technical terms accurate.

${contentToRewrite}

Provide the rewritten content in a clear, educational format:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        rewrittenContent = response.text().trim();
      } catch (aiError) {
        console.error('AI rewriting error:', aiError);
        rewrittenContent = contentToRewrite; // Fallback to original
      }
    }

    // Build response
    const response = {
      title: matchedDefinition ? matchedDefinition.term : (matchedTopic ? matchedTopic.title : 'Result'),
      simpleExplanation: matchedDefinition ? matchedDefinition.simpleExplanation : '',
      detailedExplanation: rewrittenContent,
      examples: matchedDefinition?.examples || [],
      formulas: matchedDefinition?.formulas || [],
      bookReferences,
      relatedPYQs,
      relatedQuestions,
      relatedSubtopics
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /ask:', error);
    console.error('Error stack:', error.stack);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors,
        title: 'Error',
        simpleExplanation: 'Invalid request. Please check your input.',
        detailedExplanation: '',
        examples: [],
        formulas: [],
        bookReferences: [],
        relatedPYQs: [],
        relatedSubtopics: []
      });
    }
    res.status(500).json({
      error: 'Failed to process query',
      message: error.message,
      title: 'Error',
      simpleExplanation: 'Failed to fetch answer. Please try again.',
      detailedExplanation: '',
      examples: [],
      formulas: [],
      bookReferences: [],
      relatedPYQs: [],
      relatedSubtopics: []
    });
  }
});

module.exports = router;
