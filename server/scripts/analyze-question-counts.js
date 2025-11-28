const fs = require('fs');
const path = require('path');

// Map chapter names to their JSON file slugs
const chapterToFileMap = {
  'Direction, Latitude and Longitude': 'direction-latitude-and-longitude',
  'Great Circles, Rhumb Lines & Directions on the Earth': 'great-circles-rhumb-lines-directions-on-the-earth',
  'Earth Magnetism': 'earth-magnetism',
  'The Navigation Computer - Slide Rule Face': 'the-navigation-computer-slide-rule-face',
  'The Navigation Computer - Distance, Speed, Time and Conversions': 'the-navigation-computer-distance-speed-time-and-conversions',
  'The Navigation Computer - TAS and Altitude Conversions': 'the-navigation-computer-tas-and-altitude-conversions',
  'The Navigation Computer - Triangle of Velocities': 'the-navigation-computer-triangle-of-velocities',
  'The Navigation Computer - Calculation of Heading and Wind Finding': 'the-navigation-computer-calculation-of-heading-and-wind-finding',
  'The Navigation Computer - Multi-drift Winds and Wind Components': 'the-navigation-computer-multi-drift-winds-and-wind-components',
  'The 1 in 60 Rule': 'the-1-in-60-rule',
  'Navigation Using the 1 in 60 Rule': 'navigation-using-the-1-in-60-rule',
  'Other Applications of the 1 in 60 Rule': 'other-applications-of-the-1-in-60-rule',
  'Topographical Maps and Map Reading': 'topographical-maps-and-map-reading-1',
  'Convergency and Conversion Angle': 'convergency-and-conversion-angle',
  'Departure': 'departure',
  'Scale': 'scale',
  'Mercator Charts - Properties': 'mercator-charts-properties',
  'Mercator Charts - Scale': 'mercator-charts-scale',
  'Lambert\'s Conformal Chart - 2': 'lamberts-conformal-chart-2',
  'Mid Course Test': 'mid-course-test',
  'Time (1)': 'time-1',
  'Time (2)': 'time-2',
  'Time (3)': 'time-3',
  'Gridded Charts': 'gridded-charts',
  'Plotting': 'plotting',
  'Aircraft Magnetism': 'aircraft-magnetism'
};

const practiceQuestionsDir = path.join(__dirname, '../practice-questions');
const filePrefix = 'cae-oxford-general-navigation-';

const results = {};

// Get actual question counts from JSON files
Object.entries(chapterToFileMap).forEach(([chapterName, fileSlug]) => {
  const fileName = `${filePrefix}${fileSlug}.json`;
  const filePath = path.join(practiceQuestionsDir, fileName);
  
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const questionCount = Array.isArray(data.questions) ? data.questions.length : 0;
      results[chapterName] = questionCount;
      console.log(`✓ ${chapterName}: ${questionCount} questions`);
    } catch (error) {
      console.error(`✗ Error reading ${fileName}:`, error.message);
      results[chapterName] = 0;
    }
  } else {
    console.warn(`⚠ File not found: ${fileName}`);
    results[chapterName] = 0;
  }
});

// Output as JavaScript object for easy copy-paste
console.log('\n=== Question Counts for QuestionBank.js ===');
console.log(JSON.stringify(results, null, 2));

