import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import Modal from './ui/Modal';
import debugLog from '../utils/debug';
// Meteorology imports
import regularMarch2024Data from '../data/meteorology-regular-march-2024.json';
import regularDecemberAttemptData from '../data/meteorology-regular-december-attempt.json';
import regularSep2023Data from '../data/meteorology-regular-sep-2023.json';
import olodeSession072025Data from '../data/meteorology-olode-session-07-2025.json';
import regularMarch2025Data from '../data/meteorology-regular-march-2025-session.json';
import olodeMay2025Data from '../data/meteorology-olode-may-2025-session.json';
import olodeNov2024Data from '../data/meteorology-olode-nov-2024-session.json';
import regularJuneSessionData from '../data/meteorology-regular-june-session.json';

// Air Regulations imports
import olodeMay2025RegData from '../data/air-regulations/olode-may-2025.json';
import regularSession012025Data from '../data/air-regulations/regular-session-01-2025.json';
import olodeSession22025Data from '../data/air-regulations/olode-session-2-2025.json';
import januaryOndemand2025Data from '../data/air-regulations/january-ondemand-2025.json';
import olode052025Data from '../data/air-regulations/olode-05-2025.json';
import olodeAprilSessionRegulationData from '../data/air-regulations/olode-april-session-regulation.json';
import regulationsJune2025Data from '../data/air-regulations/regulations-june-2025.json';

// Air Navigation imports
import airNavRegularMarch2025Data from '../data/air-navigation-regular-march-2025.json';
import airNavRegularJuneExamData from '../data/air-navigation-regular-june-exam.json';
import airNavOlodeSession1Jan2025Data from '../data/air-navigation-olode-session1-jan-2025.json';
import airNavOlodeSession32025Data from '../data/air-navigation-olode-session3-2025.json';
import airNavRegularDecember2024Data from '../data/air-navigation-regular-december-2024.json';

// Technical General imports
import techGenOlodeMay2025Data from '../data/technical-general-olode-may-2025.json';
import techGenOlodeJan2025Session1Data from '../data/technical-general-olode-jan-2025-session1.json';
import techGenRegularDecember2024Data from '../data/technical-general-regular-december-2024.json';
import techGenRegularJune2025Session2Data from '../data/technical-general-regular-june-2025-session2.json';
import techGenRegularMarch2024Data from '../data/technical-general-regular-march-2024.json';
import techGenRegularMarch2025Data from '../data/technical-general-regular-march-2025.json';

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

const questionBank = {
  'air-regulations': [
    {
      text: 'According to {subject}, what is the minimum visibility required for day VFR departures inside controlled airspace?',
      options: ['1 km', '3 km', '5 km', '10 km'],
      answerIndex: 1,
      explanation: 'DGCA guidelines require at least 3 km day VFR visibility so that pilots can maintain separation visually.'
    },
    {
      text: 'While covering {chapter}, which document must always be carried on board to demonstrate aircraft airworthiness?',
      options: ['Journey log book', 'Certificate of Registration', 'Certificate of Airworthiness', 'Radio license'],
      answerIndex: 2,
      explanation: 'The Certificate of Airworthiness must remain on board to prove the aircraft complies with safety standards.'
    },
    {
      text: 'What phraseology should be used to cancel IFR and continue VFR under {subject}?',
      options: ['Cancel IFR, continuing VFR', 'IFR terminated', 'Switching to VFR now', 'IFR service complete'],
      answerIndex: 0,
      explanation: '“Cancel IFR, continuing VFR” is the concise DGCA-approved call to terminate IFR responsibility.'
    }
  ],
  'air-navigation': [
    {
      text: 'During {chapter}, which instrument provides magnetic bearing information relative to a ground station?',
      options: ['ADF', 'DME', 'HSI', 'VSI'],
      answerIndex: 0,
      explanation: 'An Automatic Direction Finder (ADF) needle points to the station, giving magnetic bearing information.'
    },
    {
      text: 'In a navigation plan showing “W/V 240/20”, what does 20 stand for?',
      options: ['20° drift', '20 knots wind speed', '20 NM track error', '20° variation'],
      answerIndex: 1,
      explanation: 'The second number is wind speed, so 240/20 indicates wind from 240° at 20 kt.'
    },
    {
      text: 'When calculating ETA for {chapter}, which component ensures fuel reserves for contingencies?',
      options: ['Taxi fuel', 'Contingency fuel', 'Holding fuel', 'Trip fuel'],
      answerIndex: 1,
      explanation: 'Contingency fuel is added to cover unforeseen delays and maintain legal reserves.'
    }
  ],
  'meteorology': [
    {
      text: 'Within {chapter}, the standard ISA sea-level pressure equals which value?',
      options: ['991 hPa', '1000 hPa', '1013.2 hPa', '1020 hPa'],
      answerIndex: 2,
      explanation: 'International Standard Atmosphere assumes sea-level pressure of 1013.2 hPa (29.92 inHg).'
    },
    {
      text: 'What cloud family is typically associated with the first stage of thunderstorm development?',
      options: ['Stratus', 'Cumulus', 'Cirrus', 'Nimbostratus'],
      answerIndex: 1,
      explanation: 'Towering cumulus clouds signal the beginning of convective thunderstorm activity.'
    },
    {
      text: 'Icing risk peaks near which temperature band when moisture is present during {chapter}?',
      options: ['0°C to +5°C', '-5°C to -15°C', '-20°C to -30°C', 'Below -40°C'],
      answerIndex: 1,
      explanation: 'Super-cooled droplets in the -5°C to -15°C band adhere rapidly, creating serious icing.'
    }
  ],
  'technical-general': [
    {
      text: 'When leaning a piston engine mixture during {chapter}, which indicator confirms best power?',
      options: ['Decrease in RPM', 'Peak EGT then 50°F rich', 'Peak CHT then lean 100°F', 'Fuel flow minimum'],
      answerIndex: 1,
      explanation: 'Best power is typically achieved slightly rich of peak EGT—about 50°F on most engines.'
    },
    {
      text: 'A fully charged 24V aircraft battery should read approximately what voltage at rest?',
      options: ['22 V', '23.4 V', '24.5 V', '26 V'],
      answerIndex: 2,
      explanation: 'A healthy 24 V battery often indicates around 24.5–25 V with no load.'
    },
    {
      text: 'Hydraulic accumulators primarily serve what purpose in {chapter}?',
      options: ['Store electrical energy', 'Dampen pressure spikes & provide reserve pressure', 'Reduce oil temperature', 'Monitor brake wear'],
      answerIndex: 1,
      explanation: 'Accumulators smooth surges and maintain residual pressure for emergency actuations.'
    }
  ],
  'technical-specific': [
    {
      text: 'For {chapter}, why is best glide speed critical during engine failure?',
      options: ['Maximizes climb', 'Provides minimum sink rate', 'Ensures structural safety speed', 'Maintains most range per altitude lost'],
      answerIndex: 3,
      explanation: 'Best glide delivers the greatest horizontal distance for each unit of altitude lost—vital after failures.'
    },
    {
      text: 'Piper-style fuel selectors typically feature which protective design?',
      options: ['Guarded OFF detent', 'Automatic balancing valve', 'Electric crossfeed only', 'No detents'],
      answerIndex: 0,
      explanation: 'A raised guard protects the OFF detent to prevent accidental shutdown in-flight.'
    },
    {
      text: 'In multi-engine procedures, the mnemonic “Dead Foot, Dead Engine” helps identify what?',
      options: ['Failed magneto', 'Failed alternator', 'Failed engine side', 'Failed hydraulic line'],
      answerIndex: 2,
      explanation: 'The rudder pedal requiring no pressure (“dead foot”) sits on the same side as the failed engine.'
    }
  ],
  'radio-telephony': [
    {
      text: 'Which phrase indicates urgency but not immediate distress when communicating {chapter} items?',
      options: ['Pan Pan', 'Mayday', 'Standby', 'Wilco'],
      answerIndex: 0,
      explanation: '“Pan Pan” is the ICAO radiotelephony prefix for urgency transmissions.'
    },
    {
      text: 'On initial call to a new frequency, which element should precede your message?',
      options: ['Aircraft type then call sign', 'Call sign then position', 'Controller call sign then your call sign', 'Runway in use then call sign'],
      answerIndex: 2,
      explanation: 'Proper etiquette: “<Tower>, <Your Call Sign> …” so ATC knows the message is addressed to them.'
    },
    {
      text: 'What does the instruction “Standby” require during {chapter} communication? ',
      options: ['Change to standby frequency', 'Stop transmitting and wait', 'Switch to guard frequency', 'Report fuel remaining'],
      answerIndex: 1,
      explanation: '“Standby” directs the pilot to pause and wait for further ATC instructions.'
    }
  ]
};

const sessionQuestionSets = {
  'regular-march-2024': {
    bookName: regularMarch2024Data.book_name,
    chapterName: regularMarch2024Data.chapter_title,
    questions: regularMarch2024Data.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'regular-december-attempt': {
    bookName: regularDecemberAttemptData.book_name,
    chapterName: regularDecemberAttemptData.chapter_title,
    questions: regularDecemberAttemptData.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'regular-sep-2023': {
    bookName: regularSep2023Data.book_name,
    chapterName: regularSep2023Data.chapter_title,
    questions: regularSep2023Data.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'regular-june-session': {
    bookName: regularJuneSessionData.book_name || 'Meteorology',
    chapterName: regularJuneSessionData.chapter_title || 'Regular June Session',
    questions: regularJuneSessionData.questions?.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    })) || []
  },
  'olode-session-07-2025': {
    bookName: olodeSession072025Data.book_name,
    chapterName: olodeSession072025Data.chapter_title,
    questions: olodeSession072025Data.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'regular-march-2025': {
    bookName: regularMarch2025Data.book_name,
    chapterName: regularMarch2025Data.chapter_title,
    questions: regularMarch2025Data.questions.map((q) => ({
      text: q.question_text,
      options: q.options,
      answer: q.answer
    }))
  },
  'olode-may-2025': {
    bookName: olodeMay2025Data.book_name,
    chapterName: olodeMay2025Data.chapter_title,
    questions: olodeMay2025Data.questions.map((q) => ({
      text: q.question_text,
      options: q.options,
      answer: q.answer
    }))
  },
  'olode-nov-2024': {
    bookName: olodeNov2024Data.book_name,
    chapterName: olodeNov2024Data.chapter_title,
    questions: olodeNov2024Data.questions.map((q) => ({
      text: q.question_text,
      options: q.options,
      answer: q.answer
    }))
  },
  'olode-nov-2024-session': {
    bookName: olodeNov2024Data.book_name,
    chapterName: olodeNov2024Data.chapter_title,
    questions: olodeNov2024Data.questions.map((q) => ({
      text: q.question_text,
      options: q.options,
      answer: q.answer
    }))
  },
  'olode-may-2025-reg': {
    bookName: olodeMay2025RegData.book_name,
    chapterName: olodeMay2025RegData.chapter_title,
    questions: olodeMay2025RegData.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'regular-session-01-2025-reg': {
    bookName: regularSession012025Data.book_name,
    chapterName: regularSession012025Data.chapter_title,
    questions: regularSession012025Data.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'olode-session-2-2025-reg': {
    bookName: olodeSession22025Data.book_name,
    chapterName: olodeSession22025Data.chapter_title,
    questions: olodeSession22025Data.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'january-ondemand-2025-reg': {
    bookName: januaryOndemand2025Data.book_name,
    chapterName: januaryOndemand2025Data.chapter_title,
    questions: januaryOndemand2025Data.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'olode-05-2025-reg': {
    bookName: olode052025Data.book_name,
    chapterName: olode052025Data.chapter_title,
    questions: olode052025Data.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'olode-april-session-regulation-reg': {
    bookName: olodeAprilSessionRegulationData.book_name,
    chapterName: olodeAprilSessionRegulationData.chapter_title,
    questions: olodeAprilSessionRegulationData.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  'regulations-june-2025': {
    bookName: regulationsJune2025Data.book_name,
    chapterName: regulationsJune2025Data.chapter_title,
    questions: regulationsJune2025Data.questions.map((q) => ({
      text: q.full_question_text,
      options: q.options,
      answer: q.solution
    }))
  },
  
  // Air Navigation sessions
  'nav-regular-march-2025': {
    bookName: airNavRegularMarch2025Data.book.title,
    chapterName: airNavRegularMarch2025Data.book.chapters[0]?.chapter_title || 'Air Navigation',
    questions: airNavRegularMarch2025Data.book.chapters.flatMap(chapter => 
      chapter.questions.map(q => ({
        text: q.question_text,
        options: q.options,
        answer: q.options[parseInt(q.answer) - 1]?.substring(3) || q.answer
      }))
    )
  },
  'nav-regular-june-exam': {
    bookName: airNavRegularJuneExamData.book?.title || 'Air Navigation',
    chapterName: airNavRegularJuneExamData.book?.chapters?.[0]?.chapter_title || 'June Exam',
    questions: airNavRegularJuneExamData.book?.chapters?.flatMap(chapter => 
      chapter.questions?.map(q => ({
        text: q.question_text,
        options: q.options,
        answer: q.options[parseInt(q.answer) - 1]?.substring(3) || q.answer
      })) || []
    )
  },
  'nav-olode-session1-jan-2025': {
    bookName: airNavOlodeSession1Jan2025Data.book?.title || 'Air Navigation',
    chapterName: airNavOlodeSession1Jan2025Data.book?.chapters?.[0]?.chapter_title || 'OLODE Session 1 Jan 2025',
    questions: airNavOlodeSession1Jan2025Data.book?.chapters?.flatMap(chapter => 
      chapter.questions?.map(q => ({
        text: q.question_text,
        options: q.options,
        answer: q.options[parseInt(q.answer) - 1]?.substring(3) || q.answer
      })) || []
    )
  },
  'nav-olode-session3-2025': {
    bookName: airNavOlodeSession32025Data.book?.title || 'Air Navigation',
    chapterName: airNavOlodeSession32025Data.book?.chapters?.[0]?.chapter_title || 'OLODE Session 3 2025',
    questions: airNavOlodeSession32025Data.book?.chapters?.flatMap(chapter => 
      chapter.questions?.map(q => ({
        text: q.question_text,
        options: q.options,
        answer: q.options[parseInt(q.answer) - 1]?.substring(3) || q.answer
      })) || []
    )
  },
  'nav-regular-december-2024': {
    bookName: airNavRegularDecember2024Data.book?.title || 'Air Navigation',
    chapterName: airNavRegularDecember2024Data.book?.chapters?.[0]?.chapter_title || 'Regular December 2024',
    questions: airNavRegularDecember2024Data.book?.chapters?.flatMap(chapter => 
      chapter.questions?.map(q => ({
        text: q.question_text,
        options: q.options,
        answer: q.options[parseInt(q.answer) - 1]?.substring(3) || q.answer
      })) || []
    )
  },
  
  // Technical General sessions
  'tech-regular-march-2025': {
    bookName: techGenRegularMarch2025Data.bookName || 'Technical General',
    chapterName: techGenRegularMarch2025Data.chapterTitle || 'Regular March 2025',
    questions: techGenRegularMarch2025Data.questions?.map(q => ({
      text: q.questionText,
      options: q.options,
      answer: q.answer
    })) || []
  },
  'tech-regular-december-2024': {
    bookName: techGenRegularDecember2024Data.bookName || 'Technical General',
    chapterName: techGenRegularDecember2024Data.chapterTitle || 'Regular December 2024',
    questions: techGenRegularDecember2024Data.questions?.map(q => ({
      text: q.questionText,
      options: q.options,
      answer: q.answer
    })) || []
  },
  'tech-general-march-2024': {
    bookName: techGenRegularMarch2024Data.bookName || 'Technical General',
    chapterName: techGenRegularMarch2024Data.chapterTitle || 'March 2024',
    questions: techGenRegularMarch2024Data.questions?.map(q => ({
      text: q.questionText,
      options: q.options,
      answer: q.answer
    })) || []
  },
  'gen-olode-may-2025': {
    bookName: techGenOlodeMay2025Data.bookName || 'Technical General',
    chapterName: techGenOlodeMay2025Data.chapterTitle || 'OLODE May 2025',
    questions: techGenOlodeMay2025Data.questions?.map(q => ({
      text: q.questionText,
      options: q.options,
      answer: q.answer
    })) || []
  },
  'gen-olode-jan-2025-session1': {
    bookName: techGenOlodeJan2025Session1Data.bookName || 'Technical General',
    chapterName: techGenOlodeJan2025Session1Data.chapterTitle || 'OLODE Jan 2025 Session 1',
    questions: techGenOlodeJan2025Session1Data.questions?.map(q => ({
      text: q.questionText,
      options: q.options,
      answer: q.answer
    })) || []
  },
  'gen-regular-june-2025-session2': {
    bookName: techGenRegularJune2025Session2Data.bookName || 'Technical General',
    chapterName: techGenRegularJune2025Session2Data.chapterTitle || 'Regular June 2025 Session 2',
    questions: techGenRegularJune2025Session2Data.questions?.map(q => ({
      text: q.questionText,
      options: q.options,
      answer: q.answer
    })) || []
  }
};

const fallbackQuestions = [
  {
    text: 'A standardized PYQ session always begins with which good habit?',
    options: ['Skipping briefings', 'Confirming session goals', 'Ignoring timers', 'Practicing random topics'],
    answerIndex: 1,
    explanation: 'Setting goals keeps practice deliberate and mirrors examiner expectations.'
  },
  {
    text: 'Why is reviewing explanations immediately after a question powerful?',
    options: ['It wastes time', 'It hard-codes mistakes', 'It strengthens memory while context is fresh', 'It only helps advanced pilots'],
    answerIndex: 2,
    explanation: 'Neurologically, pairing feedback with the question cements correct reasoning.'
  },
  {
    text: 'What does an adaptive PYQ session adjust in real time?',
    options: ['Screen brightness', 'Question difficulty and topic mix', 'Aircraft weight', 'ATC phrases'],
    answerIndex: 1,
    explanation: 'Adaptive engines tweak difficulty and subjects according to your answers.'
  }
];

const buildSessionQuestions = (sessionSlug) => {
  const sessionConfig = sessionQuestionSets[sessionSlug];
  if (!sessionConfig || !sessionConfig.questions) {
    console.error(`No questions found for session: ${sessionSlug}`);
    return [];
  }

  return sessionConfig.questions.map((item, index) => {
    // Ensure options is an array and trim each option
    const normalizedOptions = Array.isArray(item.options) 
      ? item.options.map(option => option.toString().trim())
      : [];
      
    // Handle different answer formats
    let answerIndex = -1;
    
    // Case 1: answerIndex is directly provided
    if (typeof item.answerIndex === 'number') {
      answerIndex = item.answerIndex;
    } 
    // Case 2: answer is provided as a string (matching option)
    else if (item.answer && normalizedOptions.length > 0) {
      answerIndex = normalizedOptions.findIndex(
        opt => opt.toLowerCase() === item.answer.toString().trim().toLowerCase()
      );
    }
    // Case 3: solution is provided (from Air Regulations format)
    else if (item.solution && normalizedOptions.length > 0) {
      answerIndex = normalizedOptions.findIndex(
        opt => opt.toLowerCase() === item.solution.toString().trim().toLowerCase()
      );
    }
    // Case 4: answer is a letter (A, B, C, D)
    else if (item.answer && typeof item.answer === 'string' && /^[A-Da-d]$/.test(item.answer.trim())) {
      const charCode = item.answer.trim().toUpperCase().charCodeAt(0);
      answerIndex = charCode - 65; // Convert A->0, B->1, etc.
    }

    // Fallback to first option if answer not found
    if (answerIndex < 0 || answerIndex >= normalizedOptions.length) {
      console.warn(`Could not determine correct answer for question ${index + 1} in session ${sessionSlug}. Defaulting to first option.`);
      answerIndex = 0;
    }

    const answerText = normalizedOptions[answerIndex] || 'No answer provided';
    
    return {
      text: item.text || item.full_question_text || `Question ${index + 1}`,
      options: normalizedOptions,
      answerIndex,
      explanation: item.explanation || `Correct answer: ${answerText}.`
    };
  });
};

const generateQuestions = (subjectSlug, chapterSlug, subjectName, chapterName, count) => {
  const templates = questionBank[subjectSlug] || fallbackQuestions;
  const safeSubject = subjectName || friendly(subjectSlug);
  const safeChapter = chapterName || friendly(chapterSlug);

  const personalize = (template) => ({
    text: template.text.replace(/{subject}/g, safeSubject).replace(/{chapter}/g, safeChapter),
    options: [...template.options],
    answerIndex: template.answerIndex,
    explanation: template.explanation.replace(/{subject}/g, safeSubject).replace(/{chapter}/g, safeChapter)
  });

  return Array.from({ length: count }).map((_, index) => personalize(templates[index % templates.length]));
};

const AIPracticeRunner = () => {
  const { subjectSlug, bookSlug, chapterSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [questionToReport, setQuestionToReport] = useState(null);
  const [questionIndexToReport, setQuestionIndexToReport] = useState(null);
  
  // Get data from location state
  const practiceSettings = location.state?.practiceSettings || {
    questionCount: 10,
    difficulty: 'adaptive',
    timeLimit: 'unlimited',
    showExplanations: true
  };
  const chapter = location.state?.chapter;
  const subject = location.state?.subject;
  const book = location.state?.book;
  const sessionInfo = location.state?.session;
  const sessionOverride = sessionInfo?.slug ? sessionQuestionSets[sessionInfo.slug] : null;

  const subjectName = sessionOverride?.subjectName || subject?.name || friendly(subjectSlug);
  const bookName = sessionOverride?.bookName || book?.name || friendly(bookSlug);
  const chapterName = sessionOverride?.chapterName || chapter?.name || friendly(chapterSlug);

  const timerRef = useRef(null);
  const totalQuestions = questions.length || practiceSettings.questionCount;

  const initializeSession = useCallback(() => {
    setLoading(true);
    setStartTime(Date.now());
    
    try {
      let generated;
      
      if (sessionInfo?.slug) {
        console.log(`Initializing session: ${sessionInfo.slug}`);
        generated = buildSessionQuestions(sessionInfo.slug);
        console.log(`Generated ${generated?.length || 0} questions for session:`, sessionInfo.slug);
        
        if (!generated || generated.length === 0) {
          console.warn('No questions generated, falling back to default questions');
          generated = generateQuestions(subjectSlug, chapterSlug, subjectName, chapterName, practiceSettings.questionCount);
        }
      } else {
        console.log('No session info, generating default questions');
        generated = generateQuestions(subjectSlug, chapterSlug, subjectName, chapterName, practiceSettings.questionCount);
      }
      
      console.log('Setting questions:', generated);
      setQuestions(generated);
      setAnswers({});
      setCurrent(0);
      setSelectedAnswer(null);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setDone(false);
      setTimeLeft(practiceSettings.timeLimit !== 'unlimited' ? parseInt(practiceSettings.timeLimit) : null);
    } catch (error) {
      console.error('Error initializing session:', error);
      // Fallback to default questions on error
      const fallback = generateQuestions(subjectSlug, chapterSlug, subjectName, chapterName, practiceSettings.questionCount);
      setQuestions(fallback);
    } finally {
      setLoading(false);
    }
  }, [
    subjectSlug,
    chapterSlug,
    subjectName,
    chapterName,
    practiceSettings.questionCount,
    practiceSettings.timeLimit,
    sessionInfo?.slug
  ]);

  // Initialize practice session
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    initializeSession();
  }, [isAuthenticated, authLoading, navigate, initializeSession]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Auto-submit current question if time runs out
    if (selectedAnswer === null) {
      setSelectedAnswer(-1); // Mark as unanswered
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
  }, [selectedAnswer]);

  // Timer logic
  useEffect(() => {
    if (practiceSettings.timeLimit !== 'unlimited' && !done && !loading) {
      const timePerQuestion = parseInt(practiceSettings.timeLimit);
      setTimeLeft(timePerQuestion);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [current, done, loading, practiceSettings.timeLimit, handleTimeUp]);

  const selectAnswer = (idx) => {
    if (selectedAnswer !== null) return; // Prevent changing answer after selection
    
    setSelectedAnswer(idx);
    const isAnswerCorrect = idx === questions[current].answerIndex;
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(prevMax => Math.max(prevMax, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    
    setAnswers(prev => ({ ...prev, [current]: idx }));
    
    // no-op for explanation display
  };

  const saveResults = async () => {
    try {
      debugLog('Saving PYQ session results...', { score, total: totalQuestions, subjectName, bookName, chapterName });
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const resultData = {
        testType: 'ai',
        subjectName: subjectName,
        bookName: bookName,
        chapterName: chapterName,
        score: score,
        total: totalQuestions,
        timeSpent: Math.round((Date.now() - startTime) / 1000),
        difficulty: practiceSettings.difficulty,
        answers: questions.map((question, index) => ({
          questionText: question.text,
          selected: question.options[answers[index]] || '',
          correct: answers[index] === question.answerIndex,
          explanation: question.explanation
        }))
      };

      debugLog('Result data to save:', resultData);

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resultData)
      });

      debugLog('Save response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save results:', errorText);
      } else {
        const savedResult = await response.json();
        debugLog('Results saved successfully:', savedResult);
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const nextQuestion = () => {
    if (current >= totalQuestions - 1) {
      setDone(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Save results when test is completed
      saveResults();
      return;
    }
    
    setCurrent(prev => prev + 1);
    setTimeLeft(practiceSettings.timeLimit !== 'unlimited' ? parseInt(practiceSettings.timeLimit) : null);
  };

  const previousQuestion = () => {
    if (current === 0) return;
    setCurrent(prev => prev - 1);
    setTimeLeft(practiceSettings.timeLimit !== 'unlimited' ? parseInt(practiceSettings.timeLimit) : null);
  };

  const restart = () => {
    initializeSession();
  };

  useEffect(() => {
    if (!questions.length) return;
    const savedAnswer = answers[current];
    if (typeof savedAnswer === 'number') {
      setSelectedAnswer(savedAnswer);
    } else {
      setSelectedAnswer(null);
    }
  }, [current, questions.length, answers]);

  const handleReportClick = (question, questionIndex) => {
    // Store the question and index directly to avoid stale state
    setQuestionToReport(question);
    setQuestionIndexToReport(questionIndex);
    setShowReportModal(true);
    setReportType('');
    setReportComment('');
    setReportSubmitted(false);
  };

  const handleReportClose = () => {
    setShowReportModal(false);
    setReportType('');
    setReportComment('');
    setReportSubmitted(false);
    setQuestionToReport(null);
    setQuestionIndexToReport(null);
  };

  const handleReportSubmit = async () => {
    // Validation
    if (!reportType) {
      return;
    }
    if (reportType === 'Other' && !reportComment.trim()) {
      return;
    }

    setIsSubmittingReport(true);
    
    try {
      // Use the stored question instead of reading from state to avoid stale data
      const questionToReportNow = questionToReport || questions[questionIndexToReport ?? current];
      if (!questionToReportNow) {
        throw new Error('Question not found');
      }
      
      const questionIndex = questionIndexToReport ?? current;
      
      // Format the report details for Gmail compose
      const supportEmail = 'contactvimaanna@gmail.com';
      const subject = `Question Report: ${reportType}`;
      
      let body = `Report Type: ${reportType}\n\n`;
      body += `Question: ${questionIndex + 1} of ${totalQuestions}\n`;
      body += `Subject: ${subjectName}\n`;
      if (bookName) {
        body += `Book: ${bookName}\n`;
      }
      if (chapterName) {
        body += `Chapter: ${chapterName}\n`;
      }
      body += `\nQuestion Text:\n${questionToReportNow.text}\n\n`;
      
      if (reportComment.trim()) {
        body += `Additional Details:\n${reportComment.trim()}\n\n`;
      }
      
      body += `---\nReported from: ${window.location.href}`;
      
      // Open Gmail compose window
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
      
      // Show success message
      setReportSubmitted(true);
      setTimeout(() => {
        handleReportClose();
      }, 2000);
    } catch (error) {
      console.error('Error preparing report:', error);
      alert('Failed to prepare report. Please try again.');
      setIsSubmittingReport(false);
    }
  };

  const getScorePercentage = () => {
    if (totalQuestions === 0) return 0;
    return Math.round((score / totalQuestions) * 100);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great job! Well done!';
    if (percentage >= 70) return 'Good work! Keep practicing!';
    if (percentage >= 60) return 'Not bad! Room for improvement.';
    return 'Keep studying! You can do better!';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-28 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Preparing Your PYQ Session</h2>
                <p className="text-gray-600">Loading curated DGCA questions...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                <p className="text-gray-600 mb-6">Please log in to access PYQ practice sessions.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (done) {
    const percentage = getScorePercentage();
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="max-w-6xl mx-auto">
              {/* Results Header */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6">
                  🎉
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  Practice Complete!
                </h1>
                <p className="text-xl text-gray-600">
                  {subjectName} • {chapterName}
                </p>
              </div>

              {/* Score Overview */}
              <Card className="p-8 mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                <div className="text-center mb-8">
                  <div className={`text-6xl font-bold mb-4 ${getScoreColor(percentage)}`}>
                    {percentage}%
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{getScoreMessage(percentage)}</h2>
                  <p className="text-gray-600">
                    You scored {score} out of {totalQuestions} questions correctly
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">{score}</div>
                    <div className="text-sm text-gray-500">Correct Answers</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-red-600">{totalQuestions - score}</div>
                    <div className="text-sm text-gray-500">Incorrect Answers</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-purple-600">{maxStreak}</div>
                    <div className="text-sm text-gray-500">Best Streak</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{minutes}:{seconds.toString().padStart(2, '0')}</div>
                    <div className="text-sm text-gray-500">Total Time</div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={restart}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </div>
                </button>
                <button
                  onClick={() => navigate(`/pyq/ai/${subjectSlug}`)}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Try Another Chapter
                  </div>
                </button>
                <button
                  onClick={() => {
                    // Trigger a custom event to refresh the practice test page
                    window.dispatchEvent(new CustomEvent('refreshPracticeResults'));
                    navigate('/pyq');
                  }}
                  className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    View Results Dashboard
                  </div>
                </button>
              </div>
            </div>
          </main>
            </div>
          </div>
    );
  }

  // If there are no questions, show a graceful empty state
  if (!loading && (!questions || questions.length === 0)) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="flex">
          <SiteSidebar />
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions Coming Soon</h1>
                <p className="text-gray-600 mb-6">
                  PYQ sets are not available right now for this chapter.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => navigate(`/pyq/ai/${subjectSlug}`)} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                    Choose Another Chapter
                  </button>
                 
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Current question interface
  const currentQuestion = questions[current];
  const progress = totalQuestions ? ((current + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        <SiteSidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="max-w-4xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{subjectName}</h1>
                  <p className="text-gray-600">{chapterName} • {bookName}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Question {current + 1} of {totalQuestions}</div>
                  <div className="text-lg font-bold text-blue-600">Score: {score}</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
            </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress: {Math.round(progress)}%</span>
                <span>Streak: {streak}</span>
                {timeLeft !== null && (
                  <span className={timeLeft <= 10 ? 'text-red-600 font-bold' : ''}>
                    Time: {timeLeft}s
                  </span>
                )}
                  </div>
                </div>

            {/* Question Card */}
            <Card className="p-0 mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Question {current + 1} of {questions.length}
                  </div>
                </div>
                
                <div className="flex items-start gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 leading-relaxed flex-1">
                  {currentQuestion.text}
                </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReportClick(currentQuestion, current)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                      title="Report an issue with this question"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Report
                    </button>
                    <button
                      onClick={() => window.history.back()}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-300 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                      title="Close test and return to previous page"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Close Test
                    </button>
                  </div>
                </div>
              </div>
              
                <div className="p-6">
                <div className="space-y-3">
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, idx) => {
                    let buttonClass = "w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ";
                    
                    if (selectedAnswer !== null) {
                      if (idx === currentQuestion.answerIndex) {
                        buttonClass += "border-green-500 bg-green-50 text-green-800 font-medium";
                      } else if (idx === selectedAnswer && idx !== currentQuestion.answerIndex) {
                        buttonClass += "border-red-500 bg-red-50 text-red-800";
                      } else {
                        buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                      }
                    } else {
                      buttonClass += "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => selectAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        className={buttonClass}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedAnswer !== null && idx === currentQuestion.answerIndex ? 'border-green-500 bg-green-500' :
                            selectedAnswer !== null && idx === selectedAnswer && idx !== currentQuestion.answerIndex ? 'border-red-500 bg-red-500' :
                            'border-gray-300'
                          }`}>
                            {selectedAnswer !== null && idx === currentQuestion.answerIndex && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {selectedAnswer !== null && idx === selectedAnswer && idx !== currentQuestion.answerIndex && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                    })
                  ) : (
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> This is a non-MCQ question. You can proceed to the next question directly.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Correct Answer Summary */}
                {selectedAnswer !== null && currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    {(() => {
                      const correctIndex = currentQuestion.answerIndex;
                      const correctOption = currentQuestion.options[correctIndex] || '';
                      const label = String.fromCharCode(65 + correctIndex);
                      return (
                        <p className="text-sm font-semibold text-blue-900">
                          Correct Answer: {label}{correctOption ? ` • ${correctOption}` : ''}
                        </p>
                      );
                    })()}
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={previousQuestion}
                    disabled={current === 0}
                    className={`w-full sm:w-auto px-8 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                      current === 0 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-white text-gray-800 hover:bg-gray-100 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    Previous Question
                  </button>
                  <button
                    onClick={nextQuestion}
                    disabled={currentQuestion.options && currentQuestion.options.length > 0 && selectedAnswer === null}
                    className={`w-full sm:w-auto px-8 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                      (currentQuestion.options && currentQuestion.options.length > 0 && selectedAnswer === null)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    {current >= totalQuestions - 1 ? 'Finish Practice' : 'Next Question'}
                  </button>
                </div>
                </div>
              </Card>
          </div>
        </main>
      </div>

      {/* Report Modal */}
      <Modal
        open={showReportModal}
        onClose={handleReportClose}
        title="Report an Issue"
        footer={
          <>
            <button
              onClick={handleReportClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReportSubmit}
              disabled={!reportType || (reportType === 'Other' && !reportComment.trim()) || isSubmittingReport || reportSubmitted}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                !reportType || (reportType === 'Other' && !reportComment.trim()) || isSubmittingReport || reportSubmitted
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isSubmittingReport ? 'Submitting...' : reportSubmitted ? 'Submitted!' : 'Submit Report'}
            </button>
          </>
        }
      >
        <div className="py-4">
          {reportSubmitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Opening Gmail...</p>
              <p className="text-sm text-gray-600 mt-2">Your report has been prepared. A Gmail compose window will open. Please send the email to submit your report.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6 text-sm">
                Help us improve by reporting any issues with this question. Please select the type of issue:
              </p>
              
              <div className="space-y-3 mb-6">
                {['Wrong Answer', 'Incorrect Question', 'Formatting Issue', 'Missing Data', 'Other'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      reportType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type}
                      checked={reportType === type}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-3 text-gray-900 font-medium">{type}</span>
                  </label>
                ))}
              </div>

              {reportType === 'Other' && (
                <div className="mb-4 transition-all duration-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide details:
                  </label>
                  <textarea
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  />
                  {reportType === 'Other' && !reportComment.trim() && (
                    <p className="mt-1 text-xs text-red-600">Please provide details when selecting "Other"</p>
                  )}
                </div>
              )}

              {!reportType && (
                <p className="text-xs text-red-600 mb-4">Please select an issue type</p>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AIPracticeRunner;


