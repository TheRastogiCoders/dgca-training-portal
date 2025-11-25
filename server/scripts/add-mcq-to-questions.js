const fs = require('fs');
const path = require('path');

const practiceQuestionsDir = path.join(__dirname, '../practice-questions');
const questionsWithoutMCQ = JSON.parse(fs.readFileSync(path.join(__dirname, '../questions-without-mcq.json'), 'utf8'));

// Group questions by file
const questionsByFile = {};
questionsWithoutMCQ.forEach(q => {
  if (!questionsByFile[q.file]) {
    questionsByFile[q.file] = [];
  }
  questionsByFile[q.file].push(q);
});

// Function to extract numeric value from text
function extractNumericValue(text) {
  const match = text.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

// Function to generate distractors for numeric answers
function generateNumericDistractors(correctValue, questionText) {
  if (correctValue === null) return [];
  
  const distractors = [];
  const variations = [
    correctValue * 0.5,
    correctValue * 0.75,
    correctValue * 1.25,
    correctValue * 1.5,
    correctValue * 2,
    correctValue + 5,
    correctValue - 5,
    correctValue + 10,
    correctValue - 10
  ];
  
  // Filter out negative values and duplicates
  const validDistractors = [...new Set(variations.filter(v => v > 0 && v !== correctValue))].slice(0, 3);
  return validDistractors.map(v => {
    // Format based on original format
    if (correctValue % 1 === 0) return Math.round(v).toString();
    return v.toFixed(2);
  });
}

// Function to check if answer requires chart
function requiresChart(answer, solution) {
  const chartKeywords = ['chart', 'refer', 'reference', 'see', 'look up', 'requires'];
  const text = (answer + ' ' + solution).toLowerCase();
  return chartKeywords.some(keyword => text.includes(keyword));
}

// Function to generate options based on question type
function generateOptions(question, answer, solution, explanation) {
  const answerText = String(answer || solution || '').trim();
  const questionText = String(question || '').toLowerCase();
  
  // Check if it's a chart-based question
  if (requiresChart(answer, solution)) {
    return [
      answerText || "Refer to the appropriate chart",
      "See the relevant navigation chart",
      "Check the flight planning chart",
      "Consult the aeronautical chart"
    ];
  }
  
  // Check if answer contains numeric value
  const numericValue = extractNumericValue(answerText);
  if (numericValue !== null) {
    const distractors = generateNumericDistractors(numericValue, questionText);
    if (distractors.length >= 3) {
      const options = [answerText, ...distractors];
      // Shuffle to randomize position
      return options.sort(() => Math.random() - 0.5);
    }
  }
  
  // Check for degree answers (e.g., "7°L", "042°(T)")
  const degreeMatch = answerText.match(/(\d+)°([LR]?)/);
  if (degreeMatch) {
    const degree = parseInt(degreeMatch[1]);
    const direction = degreeMatch[2] || '';
    const distractors = [
      `${degree - 2}°${direction}`,
      `${degree + 2}°${direction}`,
      `${degree - 5}°${direction}`,
      `${degree + 5}°${direction}`
    ].filter(d => {
      const val = parseInt(d);
      return val > 0 && val <= 360 && val !== degree;
    }).slice(0, 3);
    
    return [answerText, ...distractors].sort(() => Math.random() - 0.5);
  }
  
  // Check for time-based answers (e.g., "1038Z", "1126Z")
  const timeMatch = answerText.match(/(\d{4})Z/);
  if (timeMatch) {
    const time = parseInt(timeMatch[1]);
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    
    const distractors = [];
    // Generate time variations
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      let newMinutes = minutes + (i * 15);
      let newHours = hours;
      if (newMinutes < 0) {
        newMinutes += 60;
        newHours--;
      }
      if (newMinutes >= 60) {
        newMinutes -= 60;
        newHours++;
      }
      if (newHours < 0) newHours += 24;
      if (newHours >= 24) newHours -= 24;
      distractors.push(`${String(newHours).padStart(2, '0')}${String(newMinutes).padStart(2, '0')}Z`);
    }
    
    return [answerText, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
  }
  
  // For text-based answers, create generic options
  if (answerText.length > 0 && answerText.length < 100) {
    return [
      answerText,
      "See explanation above",
      "Refer to the relevant documentation",
      "Check the appropriate reference material"
    ];
  }
  
  // Default generic options
  return [
    "Refer to the appropriate chart or documentation",
    "See the relevant reference material",
    "Check the flight planning documentation",
    "Consult the aeronautical information"
  ];
}

// Function to determine correct answer label
function getCorrectAnswerLabel(options, correctAnswer) {
  const correctIndex = options.findIndex(opt => 
    opt.toLowerCase().trim() === correctAnswer.toLowerCase().trim() ||
    opt.includes(correctAnswer) ||
    correctAnswer.includes(opt)
  );
  
  if (correctIndex >= 0) {
    return String.fromCharCode(97 + correctIndex); // 'a', 'b', 'c', 'd'
  }
  
  // If exact match not found, return 'a' (first option should be correct)
  return 'a';
}

// Process each file
let totalUpdated = 0;
const optionLabels = ['a', 'b', 'c', 'd'];

Object.keys(questionsByFile).forEach(fileName => {
  const filePath = path.join(practiceQuestionsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${fileName}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (!data.questions || !Array.isArray(data.questions)) {
      console.log(`Invalid format in ${fileName}`);
      return;
    }
    
    let fileUpdated = false;
    const questionsToUpdate = questionsByFile[fileName];
    
    questionsToUpdate.forEach(({ questionIndex }) => {
      const question = data.questions[questionIndex];
      if (!question) return;
      
      // Skip if already has options
      if (question.options && Array.isArray(question.options) && question.options.length > 0) {
        return;
      }
      
      let answer = question.answer || question.solution || '';
      let solution = question.solution || question.answer || '';
      const explanation = question.explanation || '';
      
      // Handle grouped questions with subQuestions - use first sub-question
      if (question.subQuestions && Array.isArray(question.subQuestions) && question.subQuestions.length > 0) {
        const firstSubQ = question.subQuestions[0];
        answer = firstSubQ.solution || firstSubQ.answer || answer;
        solution = firstSubQ.solution || firstSubQ.answer || solution;
        // Update question text to include first sub-question
        question.question = (question.question || question.question_text) + ' ' + (firstSubQ.subQuestionText || '');
      }
      
      // Handle table questions - create MCQ about completing the table
      if (question.table && typeof question.table === 'object') {
        answer = 'Complete the table using navigation computer';
        solution = 'Complete the table using navigation computer';
      }
      
      // Skip if answer/solution is still an object or array
      if (typeof answer !== 'string' && typeof solution !== 'string') {
        if (typeof answer === 'object' || typeof solution === 'object') {
          return; // Skip complex object-based questions
        }
      }
      
      // Generate options
      const options = generateOptions(question.question || question.question_text, answer, solution, explanation);
      
      // Ensure we have exactly 4 options
      while (options.length < 4) {
        options.push(`Option ${options.length + 1}`);
      }
      const finalOptions = options.slice(0, 4);
      
      // Determine correct answer
      const correctLabel = getCorrectAnswerLabel(finalOptions, answer || solution);
      
      // Update question
      question.options = finalOptions;
      question.answer = correctLabel;
      if (!question.solution) {
        question.solution = solution || answer;
      }
      if (question.question_type === 'Non-MCQ' || question.question_type === 'Free Text') {
        question.question_type = 'MCQ';
      }
      
      fileUpdated = true;
      totalUpdated++;
    });
    
    if (fileUpdated) {
      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log(`Updated ${fileName} - ${questionsToUpdate.length} questions`);
    }
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error.message);
  }
});

console.log(`\nTotal questions updated: ${totalUpdated}`);

