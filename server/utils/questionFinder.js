const fs = require('fs');
const path = require('path');
const { resolvePracticeQuestionFile, practiceQuestionsDir } = require('./practiceQuestions');

/**
 * Parse questionId to extract book, chapter, and question index
 * Formats supported:
 * - question-{bookSlug}-{chapterSlug}-{index}
 * - {bookSlug}-{chapterSlug}-q{number}
 * - {bookSlug}-{chapterSlug}-{number}
 * - {chapterSlug}-q{number} (e.g., "aerodrome-met-reports-q23")
 * - {simpleId} (for PYQ sessions)
 */
const parseQuestionId = (questionId) => {
  if (!questionId) return null;

  const normalized = String(questionId).trim();

  // Format: question-{bookSlug}-{chapterSlug}-{index}
  const questionMatch = normalized.match(/^question-(.+?)-(.+?)-(\d+)$/);
  if (questionMatch) {
    return {
      bookSlug: questionMatch[1],
      chapterSlug: questionMatch[2],
      questionIndex: parseInt(questionMatch[3], 10) - 1, // Convert to 0-based index
      questionNumber: parseInt(questionMatch[3], 10), // Keep 1-based for matching
      type: 'practice'
    };
  }

  // Format: {bookSlug}-{chapterSlug}-q{number} or {bookSlug}-{chapterSlug}-{number}
  const chapterMatch = normalized.match(/^(.+?)-(.+?)-(?:q)?(\d+)$/);
  if (chapterMatch) {
    return {
      bookSlug: chapterMatch[1],
      chapterSlug: chapterMatch[2],
      questionIndex: parseInt(chapterMatch[3], 10) - 1,
      questionNumber: parseInt(chapterMatch[3], 10),
      type: 'practice'
    };
  }

  // Format: {chapterSlug}-q{number} (e.g., "aerodrome-met-reports-q23")
  // This might not have a bookSlug prefix
  const chapterOnlyMatch = normalized.match(/^(.+?)-q(\d+)$/);
  if (chapterOnlyMatch) {
    return {
      bookSlug: null, // Will need to search
      chapterSlug: chapterOnlyMatch[1],
      questionIndex: parseInt(chapterOnlyMatch[2], 10) - 1,
      questionNumber: parseInt(chapterOnlyMatch[2], 10),
      type: 'practice'
    };
  }

  // Format: simple number or ID (might be PYQ session or question_number)
  const simpleMatch = normalized.match(/^(\d+)$/);
  if (simpleMatch) {
    return {
      questionIndex: parseInt(simpleMatch[1], 10) - 1,
      questionNumber: parseInt(simpleMatch[1], 10),
      type: 'unknown', // Could be PYQ or practice question
      questionId: questionId
    };
  }

  return null;
};

/**
 * Find question file and question by questionId
 */
const findQuestionById = (questionId, bookSlug = null, chapterSlug = null) => {
  try {
    if (!questionId) {
      console.log('[QuestionFinder] No questionId provided');
      return null;
    }

    const qId = String(questionId).trim();

    console.log(`[QuestionFinder] Searching for questionId: "${qId}", bookSlug: "${bookSlug}", chapterSlug: "${chapterSlug}"`);

    // If bookSlug and chapterSlug are provided, prioritize searching in that specific file
    if (bookSlug && chapterSlug) {
      const { filePath } = resolvePracticeQuestionFile(bookSlug, chapterSlug);
      console.log(`[QuestionFinder] Resolved file path: ${filePath}`);
      
      if (filePath && fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.questions && Array.isArray(data.questions)) {
          // Try multiple matching strategies
          for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i];
            
            // 1. Check if question.id matches exactly
            if (q.id && String(q.id).trim() === qId) {
              console.log(`[QuestionFinder] Found by id match at index ${i}`);
              return {
                filePath,
                question: q,
                questionIndex: i,
                fileData: data
              };
            }
            
            // 2. Check if question_number matches exactly (not includes, to avoid "5" matching "15")
            if (q.question_number !== undefined && String(q.question_number).trim() === qId) {
              console.log(`[QuestionFinder] Found by question_number match at index ${i}`);
              return {
                filePath,
                question: q,
                questionIndex: i,
                fileData: data
              };
            }
            
            // 3. Check if question_number contains the ID (for formats like "q23" where we extract "23")
            const numericId = qId.replace(/^q/i, '').replace(/[^\d]/g, '');
            if (numericId && q.question_number !== undefined && String(q.question_number).trim() === numericId) {
              console.log(`[QuestionFinder] Found by numeric question_number match at index ${i}`);
              return {
                filePath,
                question: q,
                questionIndex: i,
                fileData: data
              };
            }
          }
          
          // 4. Try parsing questionId to get index
          const parsed = parseQuestionId(qId);
          if (parsed && parsed.questionIndex !== undefined && parsed.questionIndex >= 0) {
            const question = data.questions[parsed.questionIndex];
            if (question) {
              console.log(`[QuestionFinder] Found by parsed index ${parsed.questionIndex}`);
              return {
                filePath,
                question,
                questionIndex: parsed.questionIndex,
                fileData: data
              };
            }
          }
          
          // 5. If questionId is a simple number, try as 1-based index
          const numericMatch = qId.match(/^(\d+)$/);
          if (numericMatch) {
            const oneBasedIndex = parseInt(numericMatch[1], 10);
            const zeroBasedIndex = oneBasedIndex - 1;
            if (zeroBasedIndex >= 0 && zeroBasedIndex < data.questions.length) {
              const question = data.questions[zeroBasedIndex];
              if (question) {
                console.log(`[QuestionFinder] Found by 1-based index ${oneBasedIndex} (0-based: ${zeroBasedIndex})`);
                return {
                  filePath,
                  question,
                  questionIndex: zeroBasedIndex,
                  fileData: data
                };
              }
            }
          }
        }
      }
    }

    // Try parsing questionId to extract book/chapter info
    const parsed = parseQuestionId(qId);
    if (parsed && parsed.type === 'practice') {
      // If we have chapterSlug but no bookSlug, try to find files matching the chapter
      if (parsed.chapterSlug && !parsed.bookSlug) {
        const files = fs.readdirSync(practiceQuestionsDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const fileBase = file.replace('.json', '');
          // Check if file name contains the chapter slug
          if (fileBase.includes(parsed.chapterSlug) || fileBase.endsWith(`-${parsed.chapterSlug}`)) {
            const filePath = path.join(practiceQuestionsDir, file);
            try {
              const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              if (data.questions && parsed.questionNumber) {
                // Try to find by question_number
                for (let i = 0; i < data.questions.length; i++) {
                  const q = data.questions[i];
                  if (q.question_number === parsed.questionNumber || (q.id && String(q.id).trim() === qId)) {
                    console.log(`[QuestionFinder] Found by chapter slug and question_number in ${file} at index ${i}`);
                    return {
                      filePath,
                      question: q,
                      questionIndex: i,
                      fileData: data
                    };
                  }
                }
              }
            } catch (err) {
              console.warn(`[QuestionFinder] Error reading file ${file}:`, err.message);
              continue;
            }
          }
        }
      }
      
      // If we have both bookSlug and chapterSlug
      if (parsed.bookSlug && parsed.chapterSlug) {
        const { filePath } = resolvePracticeQuestionFile(parsed.bookSlug, parsed.chapterSlug);
        
        if (filePath && fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (data.questions) {
            // Try by question_number first
            if (parsed.questionNumber) {
              for (let i = 0; i < data.questions.length; i++) {
                const q = data.questions[i];
                if (q.question_number === parsed.questionNumber || (q.id && String(q.id).trim() === qId)) {
                  console.log(`[QuestionFinder] Found by parsed book/chapter and question_number at index ${i}`);
                  return {
                    filePath,
                    question: q,
                    questionIndex: i,
                    fileData: data
                  };
                }
              }
            }
            // Fallback to index
            if (parsed.questionIndex >= 0 && parsed.questionIndex < data.questions.length) {
              const question = data.questions[parsed.questionIndex];
              if (question) {
                console.log(`[QuestionFinder] Found by parsed book/chapter at index ${parsed.questionIndex}`);
                return {
                  filePath,
                  question,
                  questionIndex: parsed.questionIndex,
                  fileData: data
                };
              }
            }
          }
        }
      }
    }

    // Search all files for matching questionId or question number
    if (!fs.existsSync(practiceQuestionsDir)) {
      console.log('[QuestionFinder] Practice questions directory does not exist');
      return null;
    }

    const files = fs.readdirSync(practiceQuestionsDir).filter(f => f.endsWith('.json'));
    console.log(`[QuestionFinder] Searching through ${files.length} files`);
    
    for (const file of files) {
      const filePath = path.join(practiceQuestionsDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (!data.questions || !Array.isArray(data.questions)) {
          continue;
        }

        // Try to find by question id, question_number, or index
        for (let i = 0; i < data.questions.length; i++) {
          const q = data.questions[i];
          
          // Check if question.id matches exactly
          if (q.id && String(q.id).trim() === qId) {
            console.log(`[QuestionFinder] Found by id in file ${file} at index ${i}`);
            return {
              filePath,
              question: q,
              questionIndex: i,
              fileData: data
            };
          }
          
          // Check if question_number matches exactly
          if (q.question_number !== undefined && String(q.question_number).trim() === qId) {
            console.log(`[QuestionFinder] Found by question_number in file ${file} at index ${i}`);
            return {
              filePath,
              question: q,
              questionIndex: i,
              fileData: data
            };
          }
          
          // Check for formats like "q23" where we extract "23"
          const numericId = qId.replace(/^q/i, '').replace(/[^\d]/g, '');
          if (numericId && q.question_number !== undefined && String(q.question_number).trim() === numericId) {
            console.log(`[QuestionFinder] Found by numeric question_number in file ${file} at index ${i}`);
            return {
              filePath,
              question: q,
              questionIndex: i,
              fileData: data
            };
          }
        }
      } catch (err) {
        console.warn(`[QuestionFinder] Error reading file ${file}:`, err.message);
        continue;
      }
    }

    console.log(`[QuestionFinder] Question not found: ${questionId}`);
    return null;
  } catch (error) {
    console.error('[QuestionFinder] Error finding question:', error);
    return null;
  }
};

/**
 * Update question in file
 */
const updateQuestionInFile = (filePath, questionIndex, updatedQuestion) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid file format: questions array not found');
    }

    if (questionIndex < 0 || questionIndex >= data.questions.length) {
      throw new Error(`Question index ${questionIndex} out of bounds`);
    }

    // Update the question while preserving other fields
    data.questions[questionIndex] = {
      ...data.questions[questionIndex],
      ...updatedQuestion
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return {
      success: true,
      question: data.questions[questionIndex],
      filePath
    };
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

module.exports = {
  parseQuestionId,
  findQuestionById,
  updateQuestionInFile
};

