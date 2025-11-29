import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Stepper from './ui/Stepper';
import Card from './ui/Card';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import debugLog from '../utils/debug';

const normalize = (str) => {
  if (!str) return '';
  // Handle special cases like "Directional Gyro Indicator (DGI)" -> "directional-gyro-indicator-dgi"
  return str
    .toLowerCase()
    .replace(/\(([^)]+)\)/g, (match, acronym) => `-${acronym.toLowerCase()}`) // Extract acronyms from parentheses
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
};

const friendly = (slug) => (slug || '')
  .split('-')
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(' ');

const defaultChapters = {
  // Subject → Book → Chapters
  'air-regulations': {
    'ic-joshi': [
      'Rules of the Air',
      'ATC Procedures',
      'Licensing & Documents',
      'Flight Planning & Altimeter Settings',
      'Performance & Operations'
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
      'Aircraft Accident and Incident Investigation'
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
      'Aircraft Accident and Incident Investigation'
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
      'Specimen Questions'
    ]
  },
  'air-navigation': {
    'ic-joshi': [
      'Basic Nav Concepts',
      'Dead Reckoning',
      'Radio Navigation (VOR/DME/NDB)',
      'RNAV/GNSS',
      'Flight Planning & Wind Triangle'
    ],
    'oxford': [
      'Instruments & Errors',
      'Great Circle & Rhumb Lines',
      'Charts & Projections',
      'Time, Position & ETA',
      'Advanced RNAV'
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
      'General Navigation Problems'
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
      'Point of Safe Return (PSR)'
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
      'Revision Questions'
    ],
    'performance': [
      'Mass and Balance and Performance',
      'Definitions and Calculations',
      'General Principles - Descent',
      'Single-engine Class B Aircraft - Take-off',
      'Multi-engine Class B - Take-off',
      'Class A - En Route',
      'Landing'
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
      'Flight Forecast (Tabular Form) and Cross Section Forecast of Route Conditions'
    ],
    'oxford': [
      'Synoptic Meteorology',
      'Turbulence & Icing',
      'Thunderstorms & Convection',
      'Fog & Low Visibility',
      'Climatology for Aviation'
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
      'Meteorological Information for Aircraft in Flight'
    ]
  },
  'technical-general': {
    'ic-joshi': [
      'Aerodynamics Basics',
      'Engines & Fuel',
      'Instruments',
      'Electrical & Hydraulic Systems'
    ],
    'oxford': [
      'Performance & Limitations',
      'Aircraft Structures',
      'Stability & Control'
    ]
  },
  'technical-specific': {
    'ic-joshi': [
      'Type Systems Overview',
      'Powerplant & Propellers',
      'Operational Limitations'
    ],
    'oxford': [
      'Type Performance',
      'Avionics & Automation'
    ]
  },
  'radio-telephony': {
    'ic-joshi': [
      'Phraseology Basics',
      'Circuit & Pattern Calls',
      'Emergency & Abnormal',
      'IFR Clearances'
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
      'Global Navigation Satellite System (GNSS)'
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
      'Communications'
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

const BookChapters = () => {
  const { subjectSlug, bookSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

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
    // Debug: log what we're looking for
    if (list.length === 0) {
      debugLog('No chapters found for:', { subjectSlug, bookSlug, availableBooks: Object.keys(bySubject) });
    }
    return list.map((title, index) => {
      // Check if chapter has questions available (per-book chapter maps)
      let questionCount = 0;
      if (subjectSlug === 'meteorology' && bookSlug === 'ic-joshi') {
        questionCount = icJoshiChapterQuestionCounts[title] || 0;
      } else if (subjectSlug === 'air-navigation' && bookSlug === 'operational-procedures') {
        questionCount = operationalProceduresChapterQuestionCounts[title] || 0;
      }
      const isAvailable = questionCount > 0;
      
      return {
      id: `${index + 1}`,
      title,
        questionCount,
        status: isAvailable ? 'available' : 'coming-soon',
      };
    });
  }, [subjectSlug, bookSlug]);

  const subjectName = friendly(subjectSlug);
  const bookName = (subjectSlug === 'air-regulations' && (bookSlug === 'oxford' || bookSlug === 'cae-oxford'))
    || (subjectSlug === 'meteorology' && (bookSlug === 'cae-oxford' || bookSlug === 'oxford'))
    ? 'CAE Oxford' 
    : friendly(bookSlug);

  const startChapter = (chapter) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    // Navigate to practice page
    const chapterSlug = normalize(chapter.title);
    navigate(`/pyq/book/${bookSlug}/${chapterSlug}`);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <div className="flex">
        <nav className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 min-h-screen sticky top-16 hidden md:block">
          <div className="p-6">
            <div className="space-y-2">
              <Link to="/" className="sidebar-item">Home</Link>
              <Link to="/question-bank" className="sidebar-item">Question Bank</Link>
              <Link to={`/books/${subjectSlug}`} className="sidebar-item">Back to Books</Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <Stepper steps={["Subject", "Book", "Chapter", "Practice"]} current={2} />
            <div className="mb-6 mt-2">
              <Link to={`/books/${subjectSlug}`} className="text-blue-600 hover:underline">← Back to {subjectName} Books</Link>
            </div>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{bookName}</h1>
              <p className="text-gray-600">Chapters for {subjectName}</p>
            </div>

            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">No chapters found for this book.</p>
                <p className="text-sm text-gray-500">Subject: {subjectSlug}, Book: {bookSlug}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((ch) => {
                  const isAvailable = ch.status === 'available';
                  return (
                  <Card key={ch.id} className="p-6 flex flex-col">
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">Chapter {ch.id}</h3>
                          <div className="flex gap-2">
                            {!isAvailable && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                Coming Soon
                              </span>
                            )}
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Medium
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{ch.title}</p>
                        {isAvailable ? (
                          <p className="text-sm text-gray-600 mb-2">
                            {ch.questionCount} questions
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 mb-2 flex items-center">
                            <span className="mr-1">📄</span>
                            Chapter overview
                          </p>
                        )}
                    </div>
                    <div className="mt-4">
                        {isAvailable ? (
                          <Button 
                            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold" 
                            onClick={() => startChapter(ch)}
                          >
                            <span className="flex items-center justify-center">
                              <span className="mr-2">▶</span>
                        Start Practice
                            </span>
                      </Button>
                        ) : (
                          <button
                            className="w-full py-3 px-6 bg-amber-50 text-amber-700 font-semibold rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors cursor-not-allowed flex items-center justify-center"
                            disabled
                          >
                            <span className="mr-2">📁</span>
                            Coming Soon
                          </button>
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
      {showLogin && (
        <LoginModal onLogin={() => setShowLogin(false)} onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
};

export default BookChapters;


