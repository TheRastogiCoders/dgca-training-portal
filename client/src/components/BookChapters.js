import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import SiteSidebar from './SiteSidebar';
import Card from './ui/Card';
import { slugifyChapterName, resolveChapterSlug } from '../utils/chapterSlug';
import { fetchChapterQuestionMetadata, resolvePracticeBookSlug } from '../utils/practiceQuestionsApi';
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
      'Revision Questions (Mass & Balance & Performance)',
      'General Principles – Take-off',
      'General Principles – Climb',
      'General Principles – Descent',
      'General Principles – Cruise',
      'General Principles – Landing',
      'Single-engine Class B – Take-off',
      'Single-engine Class B – Climb',
      'Single-engine Class B – En Route & Descent',
      'Single-engine Class B – Landing',
      'Multi-engine Class B – Take-off',
      'Multi-engine Class B – En Route & Descent',
      'Class A Aircraft – Take-off',
      'Landing',
      'Revision Questions',
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
  'performance': {
    'mass-and-balance-and-performance': [
      'Takeoff Performance',
      'Climb Performance',
      'Cruise Performance',
      'Descent Performance',
      'Landing Performance',
      'Obstacle Clearance',
      'Performance Tables',
      'Practical Examples'
    ]
  },
  'mass-and-balance': {
    'mass-and-balance-and-performance': [
      'General Principles',
      'Aircraft Weighing',
      'CG Calculations',
      'Load Planning',
      'Fuel Management',
      'Payload Arrangement',
      'Balance Procedures',
      'Compliance Checking'
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
const operationalProceduresChapterQuestionCounts = {
  'EU-OPS General Requirements': 6
};

// Chapter question counts for RK Bali Air Regulations
const rkBaliChapterQuestionCounts = {
  'Definitions And Abbreviations': 0, // Assuming 0 questions for chapters without specific counts
  'International Organizations and Conventions': 26,
  'Aircraft Nationality and Registration Marks': 13,
  'Airworthiness': 5,
  'Air Traffic Services': 75,
  'Aeronautical Service': 0,
  'Approach Control Service': 10,
  'Aerodrome Control Tower Service': 12,
  'Use of Air Traffic Services Surveillance System': 21,
  'Aeronautical Information Services': 26,
  'Rules of the Air': 103,
  'Visual Aids for Navigation': 50,
  'Meteorological Navigation Services': 0,
  'Aircraft Operations': 100,
  'Personnel Licensing': 25,
  'Aerodromes of Aircraft': 0,
  'Operational Procedures': 0,
  'Environmental Procedures and Hazards (General Aspects)': 109,
  'Communications': 59,
  'National Law': 9,
  'Search and Rescue': 17,
  'Aircraft Accident and Incident': 8,
  'Security': 0,
  'Security-Safeguarding International Civil Aviation Against Acts of Unlawful Interference': 10,
  'Human Performance and Limitations': 110,
  'Sample Question Papers': 0,
  'Revision Question': 0,
  'Facilitation': 14 // Added missing one from original source
};

const BookChapters = () => {
  const { subjectSlug, bookSlug } = useParams();
  const navigate = useNavigate();
  const [revisionQuestions, setRevisionQuestions] = useState({});
  const [chapterAvailability, setChapterAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Check if the current book is RK Bali (the one we want to load instantly)
  const isRkBaliAirRegulations = useMemo(() => {
    return subjectSlug === 'air-regulations' && bookSlug === 'rk-bali';
  }, [subjectSlug, bookSlug]);


  // Define checkRevisionQuestions with useCallback to prevent recreation
  const checkRevisionQuestions = useCallback(async () => {
    try {
      const revisionMetadata = await fetchChapterQuestionMetadata({
        subjectSlug,
        bookSlug,
        chapterSlug: 'revision-questions'
      });

      if (revisionMetadata && revisionMetadata.questionCount > 1) {
        const fallbackSlug = `${resolvePracticeBookSlug(subjectSlug, bookSlug)}-revision-questions`;
        setRevisionQuestions(prev => ({
          ...prev,
          [bookSlug]: {
            questionCount: revisionMetadata.questionCount,
            chapterSlug: revisionMetadata.chapterSlug || fallbackSlug
          }
        }));
      }
    } catch (error) {
      debugLog('Revision questions check failed:', error);
    }
  }, [bookSlug, subjectSlug]);

  const checkChapterAvailability = useCallback(async () => {
    if (!subjectSlug || !bookSlug) return;

    setIsLoading(true);
    try {
      const bySubject = defaultChapters[subjectSlug] || {};
      let list = bySubject[bookSlug] || [];
      if (list.length === 0 && subjectSlug === 'air-regulations' && bookSlug === 'cae-oxford') {
        list = bySubject['oxford'] || [];
      }
      if (list.length === 0 && subjectSlug === 'meteorology' && bookSlug === 'cae-oxford') {
        list = bySubject['cae-oxford'] || [];
      }

      const availabilityMap = {};
      const fetchPromises = list.map(async (chapterTitle) => {
        if (chapterTitle.includes('Revision Question') || chapterTitle === 'Sample Question Papers' || chapterTitle === 'Specimen Questions') {
          return null;
        }

        const baseSlug = slugifyChapterName(chapterTitle);
        const resolvedSlug = resolveChapterSlug(bookSlug, baseSlug);

        try {
          const metadata = await fetchChapterQuestionMetadata({
            subjectSlug,
            bookSlug,
            chapterSlug: resolvedSlug
          });

          const questionCount = metadata?.questionCount || 0;
          return {
            title: chapterTitle,
            questionCount,
            available: questionCount > 0,
            chapterSlug: metadata?.chapterSlug || resolvedSlug
          };
        } catch (error) {
          debugLog(`Concurrent fetch failed for chapter "${chapterTitle}":`, error);
          return {
            title: chapterTitle,
            questionCount: 0,
            available: false,
            chapterSlug: resolvedSlug,
            error: true
          };
        }
      });

      const results = await Promise.all(fetchPromises);
      results.filter(Boolean).forEach(result => {
        availabilityMap[result.title] = {
          questionCount: result.questionCount,
          available: result.available,
          chapterSlug: result.chapterSlug,
          lastChecked: new Date().toISOString()
        };
      });

      setChapterAvailability(availabilityMap);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      debugLog('Error checking chapter availability (Major failure):', error);
      const bySubject = defaultChapters[subjectSlug] || {};
      const list = bySubject[bookSlug] || [];
      const defaultAvailability = list.reduce((acc, title) => {
        const fallbackSlug = resolveChapterSlug(bookSlug, slugifyChapterName(title));
        acc[title] = {
          available: false,
          questionCount: 0,
          isFallback: true,
          chapterSlug: fallbackSlug,
          lastChecked: new Date().toISOString()
        };
        return acc;
      }, {});
      setChapterAvailability(defaultAvailability);
      setLastUpdated(new Date().toISOString());
    } finally {
      setIsLoading(false);
    }
  }, [bookSlug, subjectSlug]);

  // Consolidated useEffect hook for initial load and periodic refresh
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (bookSlug && subjectSlug && isMounted) {
        debugLog('Loading chapter data...');
        await checkChapterAvailability();
        await checkRevisionQuestions();
      }
    };
    
    // Initial load
    loadData();
    
    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      if (isMounted) {
        debugLog('Periodic refresh of chapter data...');
        loadData();
      }
    }, 5 * 60 * 1000);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      debugLog('Cleaned up chapter data refresh interval');
    };
  }, [bookSlug, subjectSlug, checkChapterAvailability, checkRevisionQuestions]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    checkChapterAvailability();
    checkRevisionQuestions();
  }, [checkChapterAvailability, checkRevisionQuestions]);


  const chapters = useMemo(() => {
    // Get the list of chapters for the current subject and book
    const bySubject = defaultChapters[subjectSlug] || {};
    let list = bySubject[bookSlug] || [];
    
    // Handle special cases for different subjects and books
    if (list.length === 0 && subjectSlug === 'air-regulations' && bookSlug === 'cae-oxford') {
      list = bySubject['oxford'] || [];
    }
    if (list.length === 0 && subjectSlug === 'meteorology' && bookSlug === 'cae-oxford') {
      list = bySubject['cae-oxford'] || [];
    }

    
    return list.map((title, index) => {
      // Special handling for 'Sample Question Papers' chapter (RK Bali Air Regs)
      if (title === 'Sample Question Papers') {
        return {
          id: `sample-papers-${bookSlug}`,
          title,
          questionCount: 0,
          status: 'available',
        };
      }
      
      // Special handling for Revision Questions - check dynamically loaded data
      if (title === 'Revision Questions' || title === 'Revision Question' || title === 'Specimen Questions') {
        const revInfo = revisionQuestions[bookSlug];
        if (revInfo && revInfo.questionCount > 1) {
          return {
            id: `revision-${bookSlug}`,
            title: title,
            questionCount: revInfo.questionCount,
            status: 'available',
            chapterSlug: revInfo.chapterSlug
          };
        }
        return null;
      }
      
      // Check chapter availability - first from dynamic check, then fallback to hardcoded counts
      let questionCount = 0;
      let isAvailable = false;
      
      const baseSlug = slugifyChapterName(title);
      const fallbackSlug = resolveChapterSlug(bookSlug, baseSlug);

      // Check dynamically loaded availability first
      const dynamicAvailability = chapterAvailability[title];
      
      if (dynamicAvailability && dynamicAvailability.available && dynamicAvailability.questionCount > 0) { 
        // Case 1: Dynamic data successfully loaded and shows questions (for non-RK Bali)
        questionCount = dynamicAvailability.questionCount;
        isAvailable = true;
      } else {
        // Case 2: Dynamic data failed, returned 0, or hasn't run yet. Fallback to hardcoded count.
        if (subjectSlug === 'meteorology' && bookSlug === 'ic-joshi') {
          questionCount = icJoshiChapterQuestionCounts[title] || 0;
        } else if (subjectSlug === 'air-navigation' && bookSlug === 'operational-procedures') {
          questionCount = operationalProceduresChapterQuestionCounts[title] || 0;
        } else if (isRkBaliAirRegulations) { // 🔑 Use hardcoded count for RK Bali instantly
          questionCount = rkBaliChapterQuestionCounts[title] || 0;
        }
        
        isAvailable = questionCount > 0;
      }
      
      return {
        id: `${index + 1}`,
        title,
        questionCount,
        status: isAvailable ? 'available' : 'coming-soon',
        chapterSlug: dynamicAvailability?.chapterSlug || fallbackSlug
      };
    }).filter(ch => ch !== null); // Filter out null values (revision questions without questions)
  }, [subjectSlug, bookSlug, revisionQuestions, chapterAvailability, isRkBaliAirRegulations]);

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
    if ((chapter?.title === 'Revision Questions' || chapter?.title === 'Revision Question' || chapter?.title === 'Specimen Questions') && chapter?.chapterSlug) {
      navigate(`/pyq/book/${bookSlug}/${chapter.chapterSlug}`);
      return;
    }
    // If Revision Question exists but no chapterSlug, try to construct it
    if (chapter?.title === 'Revision Question' || chapter?.title === 'Revision Questions' || chapter?.title === 'Specimen Questions') {
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
        'cae-oxford-radio-telephony': 'cae-oxford',
        // Mass and Balance & Performance
        'mass-and-balance-and-performance': 'mass-and-balance-and-performance',
        'mass-and-balance': 'mass-and-balance-and-performance'
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
    
    // For mass-and-balance book, ensure we use the correct book slug for API routing
    let actualBookSlug = bookSlug;
    if ((subjectSlug === 'performance' || subjectSlug === 'mass-and-balance') && bookSlug === 'mass-and-balance-and-performance') {
      actualBookSlug = 'mass-and-balance-and-performance';
    }
    
    // Log the generated URL for debugging the navigation issue
    debugLog(`Attempting to navigate to: /pyq/book/${actualBookSlug}/${resolvedSlug}`);
    
    navigate(`/pyq/book/${actualBookSlug}/${resolvedSlug}`);
  };

return (
<div className="min-h-screen gradient-bg flex flex-col items-center">
  <Header />
  <SiteSidebar />
  <div className="w-full flex justify-center">
    <main className="w-full max-w-6xl p-4 md:p-8 pt-20 md:pt-24 pb-32 md:pb-12 md:ml-56 lg:ml-64 xl:ml-72 mobile-content-wrapper">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-3xl text-center mb-8">
          <button 
            onClick={() => navigate('/question-bank')}
            className="text-blue-600 hover:underline inline-flex items-center cursor-pointer bg-transparent border-none p-0 mx-auto"
          >
            <span className="mr-1">←</span> Back to {subject.title} Books
          </button>
          
          <div className={`w-20 h-20 bg-gradient-to-r ${subject.color} rounded-2xl flex items-center justify-center text-white text-4xl mx-auto my-6`}>
            {subject.icon}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{subject.title}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{subject.description}</p>
          
          <div className="flex items-center justify-center mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm">
            <div className={`w-12 h-12 bg-gradient-to-r ${book.color} rounded-xl flex items-center justify-center text-white text-2xl mr-4`}>
              {book.icon}
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600">{book.description}</p>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Loading chapters...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 max-w-md mx-auto">
              <p className="font-bold">No chapters found</p>
              <p className="text-sm">We couldn't load any chapters for this book.</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center mx-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <p className="text-sm text-gray-500 mt-4">Subject: {subject.title}, Book: {book.title}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
            {chapters.map((ch) => {
              const isAvailable = ch.status === 'available';
              const hasQuestions = ch.questionCount > 0;
              
              // Return chapter overview card for chapters without questions
              if (!hasQuestions) {
                return (
                  <Card 
                    key={ch.id}
                    className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-slate-200 rounded-2xl hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      {/* Chapter overview icon */}
                      <div className="mb-4">
                        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      
                      {/* Chapter title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{ch.title}</h3>
                      
                      {/* Chapter overview label */}
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full">
                          📋 Chapter overview
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-center text-slate-600 text-sm leading-relaxed">
                        This chapter does not include questions.
                      </p>
                    </div>
                  </Card>
                );
              }
              
              // Return regular practice card for chapters with questions
              return (
                <Card 
                  key={ch.id} 
                  className={`p-6 hover:shadow-lg transition-all duration-300`}
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
                          <span className="mr-2"></span> 
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