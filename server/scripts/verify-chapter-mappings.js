const fs = require('fs');
const path = require('path');

const PRACTICE_QUESTIONS_DIR = path.join(__dirname, '..', 'practice-questions');
// Ensure we're in the right directory
if (!fs.existsSync(PRACTICE_QUESTIONS_DIR)) {
  console.error('Practice questions directory not found:', PRACTICE_QUESTIONS_DIR);
  process.exit(1);
}

// Chapter titles from BookChapters.js (simplified)
const chapterMappings = {
  'air-regulations': {
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
  'air-navigation': {
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
    ]
  }
};

function slugifyChapterName(name) {
  return name
    .toLowerCase()
    .replace(/\(([^)]+)\)/g, (_match, acronym) => `-${acronym.toLowerCase()}`)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function resolveChapterSlug(bookSlug, slug) {
  const overrides = {
    'ic-joshi': {
      'clear-air-turbulence': 'cat-and-mountain-waves',
      'mountain-waves': 'cat-and-mountain-waves',
    },
    'operational-procedures': {
      'cs-ops-general-requirements': 'eu-ops-general-requirements',
    },
    'rk-bali': {
      'personnel-licensing': 'personnel-licencing',
      'airworthiness': 'airworthiness-of-aircraft',
      'environmental-procedures-and-hazards-general-aspects': 'special-operational-procedures-and-hazards-general-aspects',
    },
  };
  
  const normalizedSlug = slug.toLowerCase();
  if (overrides[bookSlug] && overrides[bookSlug][normalizedSlug]) {
    return overrides[bookSlug][normalizedSlug];
  }
  return normalizedSlug;
}

function getBookPrefix(bookSlug, subjectSlug) {
  const mapping = {
    'ic-joshi': 'ic-joshi',
    'oxford': 'oxford',
    'cae-oxford': subjectSlug === 'meteorology' ? 'cae-oxford' : 'oxford',
    'air-law': 'oxford',
    'human-performance-and-limitations': 'human-performance',
    'rk-bali': 'rk-bali',
    'cae-oxford-general-navigation': 'cae-oxford-general-navigation',
    'cae-oxford-flight-planning-monitoring': 'cae-oxford-flight-planning',
    'operational-procedures': 'operational-procedures',
  };
  return mapping[bookSlug] || bookSlug;
}

function analyzeFiles() {
  const files = fs.readdirSync(PRACTICE_QUESTIONS_DIR).filter(f => f.endsWith('.json'));
  const fileMap = new Map();
  
  files.forEach(file => {
    const filePath = path.join(PRACTICE_QUESTIONS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      fileMap.set(file, {
        book_name: data.book_name,
        chapter_title: data.chapter_title,
        chapter_slug: data.chapter_slug,
        question_count: data.questions?.length || 0
      });
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  });
  
  return fileMap;
}

function verifyMappings() {
  const fileMap = analyzeFiles();
  const issues = [];
  const verified = [];
  
  Object.entries(chapterMappings).forEach(([subjectSlug, books]) => {
    Object.entries(books).forEach(([bookSlug, chapters]) => {
      const bookPrefix = getBookPrefix(bookSlug, subjectSlug);
      
      chapters.forEach(chapterTitle => {
        if (chapterTitle === 'Revision Question' || chapterTitle === 'Revision Questions' || chapterTitle === 'Sample Question Papers') {
          return; // Skip these
        }
        
        const baseSlug = slugifyChapterName(chapterTitle);
        const resolvedSlug = resolveChapterSlug(bookSlug, baseSlug);
        const expectedFile = `${bookPrefix}-${resolvedSlug}.json`;
        
        const found = fileMap.has(expectedFile);
        if (found) {
          const fileInfo = fileMap.get(expectedFile);
          verified.push({
            subject: subjectSlug,
            book: bookSlug,
            chapter: chapterTitle,
            file: expectedFile,
            questions: fileInfo.question_count
          });
        } else {
          // Try alternative patterns
          const alternatives = [
            `${bookSlug}-${resolvedSlug}.json`,
            `cae-oxford-${resolvedSlug}.json`,
            `oxford-${resolvedSlug}.json`
          ];
          
          let foundAlt = false;
          for (const alt of alternatives) {
            if (fileMap.has(alt)) {
              foundAlt = true;
              issues.push({
                type: 'wrong-prefix',
                subject: subjectSlug,
                book: bookSlug,
                chapter: chapterTitle,
                expected: expectedFile,
                found: alt,
                questions: fileMap.get(alt).question_count
              });
              break;
            }
          }
          
          if (!foundAlt) {
            issues.push({
              type: 'missing',
              subject: subjectSlug,
              book: bookSlug,
              chapter: chapterTitle,
              expected: expectedFile,
              slug: resolvedSlug
            });
          }
        }
      });
    });
  });
  
  return { verified, issues, fileMap };
}

// Run analysis
const result = verifyMappings();

console.log('\n✅ VERIFIED CHAPTERS:', result.verified.length);
result.verified.slice(0, 10).forEach(v => {
  console.log(`  ✓ ${v.book}/${v.chapter} → ${v.file} (${v.questions} questions)`);
});
if (result.verified.length > 10) {
  console.log(`  ... and ${result.verified.length - 10} more`);
}

console.log('\n⚠️  ISSUES FOUND:', result.issues.length);
result.issues.forEach(issue => {
  if (issue.type === 'missing') {
    console.log(`  ✗ MISSING: ${issue.book}/${issue.chapter}`);
    console.log(`    Expected: ${issue.expected}`);
    console.log(`    Slug: ${issue.slug}`);
  } else if (issue.type === 'wrong-prefix') {
    console.log(`  ⚠ WRONG PREFIX: ${issue.book}/${issue.chapter}`);
    console.log(`    Expected: ${issue.expected}`);
    console.log(`    Found: ${issue.found} (${issue.questions} questions)`);
  }
});

console.log('\n📊 SUMMARY:');
console.log(`  Total verified: ${result.verified.length}`);
console.log(`  Total issues: ${result.issues.length}`);
console.log(`  Total JSON files: ${result.fileMap.size}`);

// Export results
fs.writeFileSync(
  path.join(__dirname, '..', 'chapter-verification-results.json'),
  JSON.stringify({ verified: result.verified, issues: result.issues }, null, 2)
);

console.log('\n💾 Results saved to chapter-verification-results.json');

