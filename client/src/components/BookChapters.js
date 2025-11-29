import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { slugifyChapterName, resolveChapterSlug } from '../utils/chapterSlug';
import debugLog from '../utils/debug';

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

// Subject data matching QuestionBank structure
const subjectData = {
  'air-regulations': {
    title: 'Air Regulations',
    icon: '📋',
    description: 'Civil Aviation Rules & Regulations',
    color: 'from-blue-500 to-blue-600'
  },
  'air-navigation': {
    title: 'Air Navigation',
    icon: '🧭',
    description: 'Navigation Systems & Procedures',
    color: 'from-green-500 to-green-600'
  },
  'meteorology': {
    title: 'Meteorology',
    icon: '🌤️',
    description: 'Weather Systems & Aviation Weather',
    color: 'from-yellow-500 to-orange-500'
  },
  'technical-general': {
    title: 'Technical General',
    icon: '⚙️',
    description: 'Aircraft Systems & General Knowledge',
    color: 'from-red-500 to-red-600'
  },
  'technical-specific': {
    title: 'Technical Specific',
    icon: '✈️',
    description: 'Aircraft Type Specific Knowledge',
    color: 'from-purple-500 to-purple-600'
  },
  'radio-telephony': {
    title: 'Radio Telephony (RTR)-A',
    icon: '🎧',
    description: 'Radio Communication Procedures',
    color: 'from-cyan-500 to-cyan-600'
  }
};

// Book data matching QuestionBank structure
const bookData = {
  'rk-bali': {
    title: 'RK Bali',
    icon: '📗',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-emerald-500 to-green-600'
  },
  'ic-joshi': {
    title: 'IC Joshi',
    icon: '📖',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-indigo-500 to-purple-600'
  },
  'oxford': {
    title: 'CAE Oxford',
    icon: '📘',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-blue-500 to-blue-600'
  },
  'cae-oxford': {
    title: 'CAE Oxford',
    icon: '📘',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-blue-500 to-blue-600'
  }
};

const defaultChapters = {
  // Subject → Book → Chapters
  'air-regulations': {
    'ic-joshi': [
      'Rules of the Air',
      'ATC Procedures',
      'Licensing & Documents',
      'Flight Planning & Altimeter Settings',
      'Performance & Operations',
      'Revision Question'
    ],
    'oxford': [
      'International Agreements and Organizations',
      'Airworthiness of Aircraft',
      'Aircraft Nationality and Registration Marks',
      'Flight Crew Licensing',
      'Rules of the Air',
      'Instrument Procedures - Departures',
      'Approach Procedures',
      'Circling Approach',
      'Holding Procedures',
      'Altimeter Setting Procedure',
      'Parallel or Near-parallel Runway Operation',
      'SSR and ACAS',
      'Airspace',
      'Air Traffic Services',
      'Separation',
      'Control of Aircraft',
      'Aeronautical Information Service (AIS)',
      'Aerodromes - Physical Characteristics',
      'Aerodromes - Visual Aids, Markings and Signs',
      'Aerodrome Lighting',
      'Obstacle Marking and Aerodrome Services',
      'Facilitation',
      'Search and Rescue',
      'Security',
      'Aircraft Accident and Incident Investigation',
      'Revision Question'
    ],
    'air-law': [
      'International Agreements and Organizations',
      'Airworthiness of Aircraft',
      'Aircraft Nationality and Registration Marks',
      'Flight Crew Licensing',
      'Rules of the Air',
      'Instrument Procedures - Departures',
      'Approach Procedures',
      'Circling Approach',
      'Holding Procedures',
      'Altimeter Setting Procedure',
      'Parallel or Near-parallel Runway Operation',
      'SSR and ACAS',
      'Airspace',
      'Air Traffic Services',
      'Separation',
      'Control of Aircraft',
      'Aeronautical Information Service (AIS)',
      'Aerodromes - Physical Characteristics',
      'Aerodromes - Visual Aids, Markings and Signs',
      'Aerodrome Lighting',
      'Obstacle Marking and Aerodrome Services',
      'Facilitation',
      'Search and Rescue',
      'Security',
      'Aircraft Accident and Incident Investigation',
      'Revision Question'
    ],
    'human-performance-and-limitations': [
      'The Circulation System',
      'Oxygen and Respiration',
      'The Nervous System, Ear, Hearing and Balance',
      'The Eye and Vision',
      'Flying and Health',
      'Stress',
      'Information Processing, Human Error & the Learning Process',
      'Behaviour and Motivation',
      'Cognition in Aviation',
      'Sleep and Fatigue',
      'Individual Differences and Interpersonal Relationships',
      'Communication and Cooperation',
      'Man and Machine',
      'Decision Making and Risk',
      'Human Factors Incident Reporting',
      'Introduction to Crew Resource Management',
      'Specimen Questions',
      'Revision Question'
    ],
    'rk-bali': [
      'Definitions And Abbreviations',
      'International Organizations and Conventions',
      'Aircraft Nationality and Registration Marks',
      'Airworthiness',
      'Air Traffic Services',
      'Aeronautical Service',
      'Approach Control Service',
      'Aerodrome Control Tower Service',
      'Use of Air Traffic Services Surveillance System',
      'Aeronautical Information Services',
      'Rules of the Air',
      'Visual Aids for Navigation',
      'Meteorological Navigation Services',
      'Aircraft Operations',
      'Personnel Licensing',
      'Aerodromes of Aircraft',
      'Operational Procedures',
      'Environmental Procedures and Hazards (General Aspects)',
      'Communications',
      'National Law',
      'Search and Rescue',
      'Aircraft Accident and Incident',
      'Security',
      'Security-Safeguarding International Civil Aviation Against Acts of Unlawful Interference',
      'Human Performance and Limitations',
      'Sample Question Papers',
      'Revision Question'
    ]
  },
  'air-navigation': {
    'ic-joshi': [
      'Basic Nav Concepts',
      'Dead Reckoning',
      'Radio Navigation (VOR/DME/NDB)',
      'RNAV/GNSS',
      'Flight Planning & Wind Triangle',
      'Revision Question'
    ],
    'oxford': [
      'Instruments & Errors',
      'Great Circle & Rhumb Lines',
      'Charts & Projections',
      'Time, Position & ETA',
      'Advanced RNAV',
      'Revision Question'
    ],
    'instrument-2014': [
      'Revision Questions',
      'Revision Question'
    ],
    'cae-oxford-general-navigation': [
      'Direction, Latitude and Longitude',
      'Great Circles, Rhumb Lines & Directions on the Earth',
      'Earth Magnetism',
      'The Navigation Computer - Slide Rule Face',
      'The Navigation Computer - Distance, Speed, Time and Conversions',
      'The Navigation Computer - TAS and Altitude Conversions',
      'The Navigation Computer - Triangle of Velocities',
      'The Navigation Computer - Calculation of Heading and Wind Finding',
      'The Navigation Computer - Multi-drift Winds and Wind Components',
      'The 1 in 60 Rule',
      'Navigation Using the 1 in 60 Rule',
      'Other Applications of the 1 in 60 Rule',
      'Topographical Maps and Map Reading 1',
      'Convergency and Conversion Angle',
      'Departure',
      'Scale',
      'General Chart Properties',
      'Mercator Charts - Properties',
      'Mercator Charts - Scale',
      'Mid Course Test',
      "Lambert's Conformal Chart - 1",
      "Lambert's Conformal Chart - 2",
      'The Polar Stereographic Chart',
      'Time (1)',
      'Time (2)',
      'Time (3)',
      'Gridded Charts',
      'Plotting',
      'The Direct Indicating Compass',
      'Aircraft Magnetism',
      'General Navigation Problems',
      'Revision Questions',
      'Revision Question'
    ],
    'cae-oxford-flight-planning-monitoring': [
      'Air Information Publications',
      'Fuel Policy and Fuel Monitoring',
      'Nautical Air Miles',
      'Single-engine Piston Aeroplane (SEP)',
      'Multi-engine Piston Aeroplane (MEP)',
      'Medium Range Jet Transport planning',
      'MRJT Detailed Flight Planning, En Route Climb, Cruise-Integrated Range, Descent Tables',
      'Topographical Chart',
      'Airways',
      'Airways - Miscellaneous Charts',
      'ATC Flight Plan',
      'Point of Equal Time (PET)',
      'Point of Safe Return (PSR)',
      'Revision Questions',
      'Revision Question'
    ],
    'operational-procedures': [
      'ICAO Annex 6',
      'CS-OPS General Requirements',
      'Operator Supervision and Certification',
      'Operational Procedures',
      'All Weather Operations',
      'Aeroplane Equipment and Instruments',
      'Crew, Logs and Records',
      'Long Range Flight and Polar Navigation',
      'MNPSA',
      'Special Operational Procedures and Hazards',
      'Fire and Smoke',
      'Pressurisation Failure',
      'Windshear and Microburst',
      'Wake Turbulence',
      'Security',
      'Emergency and Precautionary Landings',
      'Fuel Jettison',
      'Transport of Dangerous Goods by Air',
      'Contaminated Runways',
      'Revision Questions',
      'Revision Question'
    ],
    'performance': [
      'Mass and Balance and Performance',
      'Definitions and Calculations',
      'General Principles - Descent',
      'Single-engine Class B Aircraft - Take-off',
      'Multi-engine Class B - Take-off',
      'Class A - En Route',
      'Landing',
      'Revision Questions',
      'Revision Question'
    ]
  },
  'meteorology': {
    'ic-joshi': [
      'Atmosphere',
      'Atmospheric Pressure',
      'Temperature',
      'Air Density',
      'Humidity',
      'Winds',
      'Visibility and Fog',
      'Vertical Motion and Clouds',
      'Stability and Instability of Atmosphere',
      'Optical Phenomena',
      'Precipitation',
      'Ice Accretion',
      'Thunderstorm',
      'Air Masses Fronts and Western Disturbances',
      'Jet Streams',
      'CAT and Mountain Waves',
      'Tropical Systems',
      'Climatology of India',
      'General Circulation',
      'Meteorological Services for Aviation',
      'Weather Radar and Met Satellites',
      'Met Instruments',
      'Station Model',
      'Aerodrome Met Reports and Codes of METAR, SPECI and TREND',
      'Aviation Weather Forecasts (Codes of TAF, ARFOR, ROFOR)',
      'Radar Report, Sigmet Message and Satellite Bulletin',
      'Met Documentation and Briefing',
      'Flight Forecast (Tabular Form) and Cross Section Forecast of Route Conditions',
      'Revision Question'
    ],
    'oxford': [
      'Synoptic Meteorology',
      'Turbulence & Icing',
      'Thunderstorms & Convection',
      'Fog & Low Visibility',
      'Climatology for Aviation',
      'Revision Question'
    ],
    'cae-oxford': [
      'The Atmosphere',
      'Pressure',
      'Density',
      'Pressure Systems',
      'Temperature',
      'Humidity',
      'Adiabatics and Stability',
      'Turbulence',
      'Altimetry',
      'Winds',
      'Upper Winds',
      'Clouds',
      'Cloud Formation and Precipitation',
      'Thunderstorms',
      'Visibility',
      'Icing',
      'Air Masses',
      'Occlusions',
      'Other Depressions',
      'Global Climatology',
      'Local Winds and Weather',
      'Area Climatology',
      'Route Climatology',
      'Satellite Observations',
      'Meteorological Aerodrome Reports (METARs)',
      'Terminal Aerodrome Forecasts (TAFs)',
      'Significant Weather and Wind Charts',
      'Warning Messages',
      'Meteorological Information for Aircraft in Flight',
      'Revision Question'
    ]
  },
  'technical-general': {
    'ic-joshi': [
      'Aerodynamics Basics',
      'Engines & Fuel',
      'Instruments',
      'Electrical & Hydraulic Systems',
      'Revision Question'
    ],
    'oxford': [
      'Performance & Limitations',
      'Aircraft Structures',
      'Stability & Control',
      'Revision Question'
    ]
  },
  'technical-specific': {
    'ic-joshi': [
      'Type Systems Overview',
      'Powerplant & Propellers',
      'Operational Limitations',
      'Revision Question'
    ],
    'oxford': [
      'Type Performance',
      'Avionics & Automation',
      'Revision Question'
    ]
  },
  'radio-telephony': {
    'ic-joshi': [
      'Phraseology Basics',
      'Circuit & Pattern Calls',
      'Emergency & Abnormal',
      'IFR Clearances',
      'Revision Question'
    ],
    'oxford': [
      'Properties of Radio Waves',
      'Radio Propagation Theory',
      'Modulation',
      'Antennae',
      'Doppler Radar Systems',
      'VHF Direction Finder (VDF)',
      'Automatic Direction Finder (ADF)',
      'VHF Omni-directional Range (VOR)',
      'Instrument Landing System (ILS)',
      'Microwave Landing System (MLS)',
      'Radar Principles',
      'Ground Radar',
      'Airborne Weather Radar',
      'Secondary Surveillance Radar (SSR)',
      'Distance Measuring Equipment (DME)',
      'Area Navigation Systems (RNAV)',
      'Electronic Flight Information System (EFIS)',
      'Global Navigation Satellite System (GNSS)',
      'Revision Question'
    ],
    'cae-oxford': [
      'Properties of Radio Waves',
      'Radio Propagation Theory',
      'Modulation',
      'Antennae',
      'Doppler Radar Systems',
      'VHF Direction Finder (VDF)',
      'Automatic Direction Finder (ADF)',
      'VHF Omni-directional Range (VOR)',
      'Instrument Landing System (ILS)',
      'Microwave Landing System (MLS)',
      'Radar Principles',
      'Ground Radar',
      'Airborne Weather Radar',
      'Secondary Surveillance Radar (SSR)',
      'Distance Measuring Equipment (DME)',
      'Area Navigation Systems (RNAV)',
      'Electronic Flight Information System (EFIS)',
      'Global Navigation Satellite System (GNSS)',
      'Communications',
      'Revision Question'
    ]
  }
};

// Chapter question counts for IC Joshi Meteorology
const icJoshiChapterQuestionCounts = {
  'Atmosphere': 45,
  'Atmospheric Pressure': 41,
  'Temperature': 39,
  'Air Density': 10,
  'Humidity': 10,
  'Winds': 45,
  'Visibility and Fog': 20,
  'Vertical Motion and Clouds': 20,
  'Stability and Instability of Atmosphere': 20,
  'Optical Phenomena': 20,
  'Precipitation': 20,
  'Ice Accretion': 19,
  'Thunderstorm': 34,
  'Air Masses Fronts and Western Disturbances': 15,
  'Jet Streams': 25,
  'CAT and Mountain Waves': 10,
  'Tropical Systems': 39,
  'Climatology of India': 32,
  'General Circulation': 15,
  'Meteorological Services for Aviation': 45,
  'Station Model': 20,
  'Aerodrome Met Reports and Codes of METAR, SPECI and TREND': 42,
  'Aviation Weather Forecasts (Codes of TAF, ARFOR, ROFOR)': 42,
  'Met Documentation and Briefing': 10,
  'Flight Forecast (Tabular Form) and Cross Section Forecast of Route Conditions': 0
};

// Chapter question counts for Operational Procedures (CAE Oxford)
// Extend this map as more operational procedures chapters get JSON sets
const operationalProceduresChapterQuestionCounts = {
  'EU-OPS General Requirements': 6
};

// Chapter question counts for RK Bali Air Regulations
const rkBaliChapterQuestionCounts = {
  'Approach Control Service': 10,
  'Aircraft Nationality and Registration Marks': 13,
  'Air Traffic Services': 75,
  'Rules of the Air': 103,
  'Area Control': 30,
  'International Organizations and Conventions': 26,
  'Aerodrome Control Tower Service': 12,
  'Use of Air Traffic Services Surveillance System': 21,
  'Aeronautical Information Services': 26,
  'Search and Rescue': 17,
  'Visual Aids for Navigation': 50,
  'Aircraft Operations': 100,
      'Personnel Licensing': 25,
      'Airworthiness': 5,
      'Environmental Procedures and Hazards (General Aspects)': 109,
  'Communications': 59,
      'National Law': 9,
      'Aircraft Accident and Incident': 8,
      'Security-Safeguarding International Civil Aviation Against Acts of Unlawful Interference': 10,
      'Human Performance and Limitations': 110,
      'Facilitation': 14
};

const BookChapters = () => {
  const { subjectSlug, bookSlug } = useParams();
  const navigate = useNavigate();
  const [revisionQuestions, setRevisionQuestions] = useState({});

  // Load revision questions dynamically
  useEffect(() => {
    const checkRevisionQuestions = async () => {
      const revisionSlug = 'revision-questions';
      // Map book slugs to match file naming convention
      // This map should include ALL possible book slugs that might have revision questions
      const bookSlugMap = {
        // Air Regulations books
        'ic-joshi': 'ic-joshi',
        'oxford': 'oxford',
        'cae-oxford': 'oxford', // CAE Oxford Air Regulations uses oxford prefix
        'air-law': 'oxford',
        'human-performance-and-limitations': 'human-performance',
        'rk-bali': 'rk-bali',
        // Air Navigation books
        'cae-oxford-general-navigation': 'cae-oxford-general-navigation',
        'general-navigation': 'cae-oxford-general-navigation',
        'cae-oxford-flight-planning-monitoring': 'cae-oxford-flight-planning',
        'cae-oxford-flight-planning': 'cae-oxford-flight-planning',
        'cae-oxford-performance': 'cae-oxford-performance',
        'performance': 'cae-oxford-performance',
        'cae-oxford-radio-navigation': 'cae-oxford-radio-navigation',
        'cae-oxford-navigation': 'cae-oxford-navigation',
        'operational-procedures': 'operational-procedures',
        'instrument-2014': 'instrument',
        'instrument': 'instrument',
        // Meteorology books
        'cae-oxford-meteorology': 'cae-oxford',
        // Technical books
        'cae-oxford-powerplant': 'cae-oxford-powerplant',
        'powerplant': 'cae-oxford-powerplant',
        'cae-oxford-principles-of-flight': 'cae-oxford-principles-of-flight',
        'principles-of-flight': 'cae-oxford-principles-of-flight',
        // Radio Telephony
        'cae-oxford-radio-telephony': 'cae-oxford'
      };
      
      const mappedBookSlug = bookSlugMap[bookSlug] || bookSlug;
      
      try {
        const response = await fetch(`/api/practice-questions/${mappedBookSlug}?chapter=${revisionSlug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.questions && data.questions.length > 0) {
            // Use chapter_slug from JSON file, or construct it if not available
            const chapterSlug = data.chapter_slug || `${mappedBookSlug}-${revisionSlug}`;
            debugLog(`[BookChapters] Loaded revision questions for ${bookSlug}:`, {
              questionCount: data.questions.length,
              chapterSlug: chapterSlug,
              bookName: data.book_name
            });
            setRevisionQuestions({
              [bookSlug]: {
                questionCount: data.questions.length,
                chapterSlug: chapterSlug
              }
            });
          } else {
            debugLog(`[BookChapters] No revision questions found for ${bookSlug} (mapped: ${mappedBookSlug})`);
          }
        } else {
          debugLog(`[BookChapters] API response not OK for ${bookSlug}:`, response.status);
        }
      } catch (error) {
        // Silently fail - revision questions may not exist for this book
        debugLog('[BookChapters] Revision questions check failed:', error);
      }
    };
    
    if (bookSlug) {
      checkRevisionQuestions();
    }
  }, [bookSlug]);

  const chapters = useMemo(() => {
    const bySubject = defaultChapters[subjectSlug] || {};
    // Handle both 'oxford' and 'cae-oxford' slugs for air-regulations
    let list = bySubject[bookSlug] || [];
    if (list.length === 0 && subjectSlug === 'air-regulations' && bookSlug === 'cae-oxford') {
      list = bySubject['oxford'] || [];
    }
    // Handle 'cae-oxford' slug for meteorology
    if (list.length === 0 && subjectSlug === 'meteorology' && bookSlug === 'cae-oxford') {
      list = bySubject['cae-oxford'] || [];
    }
    
    // Add Revision Questions if available (even if book has no other chapters)
    const revisionInfo = revisionQuestions[bookSlug];
    // Check if list already has Revision Question or Revision Questions
    const hasRevisionChapter = list.some(ch => ch === 'Revision Question' || ch === 'Revision Questions');
    if (revisionInfo && !hasRevisionChapter) {
      list = [...list, 'Revision Questions'];
    }
    
    // If no chapters found but revision questions exist, show only revision questions
    if (list.length === 0 && revisionInfo) {
      list = ['Revision Questions'];
    }
    
    // Debug: log what we're looking for
    if (list.length === 0) {
      debugLog('No chapters found for:', { subjectSlug, bookSlug, availableBooks: Object.keys(bySubject) });
    }
    return list.map((title, index) => {
      // Special handling for Sample Question Papers - always available
      if (title === 'Sample Question Papers') {
        return {
          id: `${index + 1}`,
          title,
          questionCount: 0,
          status: 'available',
        };
      }
      
      // Special handling for Revision Questions - check dynamically loaded data
      if (title === 'Revision Questions' || title === 'Revision Question') {
        const revInfo = revisionQuestions[bookSlug];
        if (revInfo) {
          return {
            id: `revision-${bookSlug}`,
            title: title, // Keep original title (Revision Question or Revision Questions)
            questionCount: revInfo.questionCount,
            status: 'available',
            chapterSlug: revInfo.chapterSlug
          };
        }
        // Even if no questions loaded yet, make it available so it can be clicked
        // The navigation will construct the slug if needed
        return {
          id: `revision-${bookSlug}`,
          title: title, // Keep original title (Revision Question or Revision Questions)
          questionCount: 0,
          status: 'available', // Changed from 'coming-soon' to 'available' so it's clickable
        };
      }
      
      // Check if chapter has questions available (per-book chapter maps)
      let questionCount = 0;
      if (subjectSlug === 'meteorology' && bookSlug === 'ic-joshi') {
        questionCount = icJoshiChapterQuestionCounts[title] || 0;
      } else if (subjectSlug === 'air-navigation' && bookSlug === 'operational-procedures') {
        questionCount = operationalProceduresChapterQuestionCounts[title] || 0;
      } else if (subjectSlug === 'air-regulations' && bookSlug === 'rk-bali') {
        questionCount = rkBaliChapterQuestionCounts[title] || 0;
      }
      // Only mark chapters as available if they have questions
      const isAvailable = questionCount > 0;
      
      return {
      id: `${index + 1}`,
      title,
        questionCount,
        status: isAvailable ? 'available' : 'coming-soon',
      };
    });
  }, [subjectSlug, bookSlug, revisionQuestions]);

  const subject = subjectData[subjectSlug] || {
    title: friendly(subjectSlug),
    icon: '📚',
    description: '',
    color: 'from-gray-500 to-gray-600'
  };
  
  const book = bookData[bookSlug] || {
    title: (subjectSlug === 'air-regulations' && (bookSlug === 'oxford' || bookSlug === 'cae-oxford'))
      || (subjectSlug === 'meteorology' && (bookSlug === 'cae-oxford' || bookSlug === 'oxford'))
      ? 'CAE Oxford' 
      : (bookSlug === 'rk-bali' ? 'RK Bali' : friendly(bookSlug)),
    icon: '📖',
    description: 'CPL/ATPL Ground Training Series',
    color: 'from-blue-500 to-blue-600'
  };

  const startChapter = (chapter) => {
    // Special handling for Sample Question Papers chapter
    if (chapter?.title === 'Sample Question Papers') {
      navigate(`/sample-papers/${subjectSlug}/${bookSlug}`);
      return;
    }
    // Special handling for Revision Questions - use the chapter slug from API
    if ((chapter?.title === 'Revision Questions' || chapter?.title === 'Revision Question') && chapter?.chapterSlug) {
      navigate(`/pyq/book/${bookSlug}/${chapter.chapterSlug}`);
      return;
    }
    // If Revision Question exists but no chapterSlug, try to construct it
    if (chapter?.title === 'Revision Question' || chapter?.title === 'Revision Questions') {
      const revisionSlug = 'revision-questions';
      // Use the same comprehensive mapping as in useEffect
      const bookSlugMap = {
        // Air Regulations books
        'ic-joshi': 'ic-joshi',
        'oxford': 'oxford',
        'cae-oxford': 'oxford',
        'air-law': 'oxford',
        'human-performance-and-limitations': 'human-performance',
        'rk-bali': 'rk-bali',
        // Air Navigation books
        'cae-oxford-general-navigation': 'cae-oxford-general-navigation',
        'general-navigation': 'cae-oxford-general-navigation',
        'cae-oxford-flight-planning-monitoring': 'cae-oxford-flight-planning',
        'cae-oxford-flight-planning': 'cae-oxford-flight-planning',
        'cae-oxford-performance': 'cae-oxford-performance',
        'performance': 'cae-oxford-performance',
        'cae-oxford-radio-navigation': 'cae-oxford-radio-navigation',
        'cae-oxford-navigation': 'cae-oxford-navigation',
        'operational-procedures': 'operational-procedures',
        'instrument-2014': 'instrument',
        'instrument': 'instrument',
        // Meteorology books
        'cae-oxford-meteorology': 'cae-oxford',
        // Technical books
        'cae-oxford-powerplant': 'cae-oxford-powerplant',
        'powerplant': 'cae-oxford-powerplant',
        'cae-oxford-principles-of-flight': 'cae-oxford-principles-of-flight',
        'principles-of-flight': 'cae-oxford-principles-of-flight',
        // Radio Telephony
        'cae-oxford-radio-telephony': 'cae-oxford'
      };
      const mappedBookSlug = bookSlugMap[bookSlug] || bookSlug;
      const constructedSlug = `${mappedBookSlug}-${revisionSlug}`;
      navigate(`/pyq/book/${bookSlug}/${constructedSlug}`);
      return;
    }
    // Navigate directly to practice page - matching QuestionBank behavior
    // Authentication will be handled by BookPracticeRunner if needed
    const baseSlug = slugifyChapterName(chapter?.title || 'overview');
    const resolvedSlug = resolveChapterSlug(bookSlug, baseSlug);
    navigate(`/pyq/book/${bookSlug}/${resolvedSlug}`);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <SiteSidebar />
      <div className="flex">
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button 
                onClick={() => navigate('/question-bank')}
                className="text-blue-600 hover:underline inline-flex items-center cursor-pointer bg-transparent border-none p-0"
              >
                <span className="mr-1">←</span> Back to {subject.title} Books
              </button>
            </div>
            
            {/* Header matching QuestionBank style */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4`}>
                {subject.icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{subject.title}</h2>
              <p className="text-gray-600 mb-4">{subject.description}</p>
              <div className="flex items-center justify-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${book.color} rounded-xl flex items-center justify-center text-white text-2xl mr-3`}>
                  {book.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-900">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600">{book.description}</p>
                </div>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-300 rounded-full">
                <span className="text-blue-800 font-medium text-sm">
                  📚 Practice information available
                </span>
              </div>
            </div>

            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">No chapters found for this book.</p>
                <p className="text-sm text-gray-500">Subject: {subject.title}, Book: {book.title}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chapters.map((ch) => {
                  const isAvailable = ch.status === 'available';
                  const hasQuestions = ch.questionCount > 0;
                  return (
                    <Card 
                      key={ch.id} 
                      className={`p-6 hover:shadow-lg transition-all duration-300 ${!isAvailable ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{ch.title}</h3>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              {hasQuestions ? `${ch.questionCount} questions` : 'Chapter overview'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        {isAvailable ? (
                          <button
                            onClick={() => startChapter(ch)}
                            className={`w-full py-3 px-6 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform bg-gradient-to-r ${book.color} text-white hover:shadow-lg hover:scale-[1.02] ${bookSlug === 'rk-bali' ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'}`}
                            title={`Practice with ${book.title}`}
                          >
                            <div className="flex items-center justify-center">
                              <span className="mr-2">{book.icon}</span>
                              Start Practice
                            </div>
                          </button>
                        ) : (
                          <div className="w-full py-3 px-6 bg-gray-100 text-gray-500 rounded-lg text-center">
                            <div className="flex items-center justify-center">
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                            This chapter does not include questions.
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookChapters;


