const fs = require('fs');
const path = require('path');

const chapters = [
  { name: 'General Principles', file: 'mass-and-balance-general-principles.json' },
  { name: 'Aircraft Weighing', file: 'mass-and-balance-aircraft-weighing.json' },
  { name: 'CG Calculations', file: 'mass-and-balance-cg-calculations.json' },
  { name: 'Load Planning', file: 'mass-and-balance-load-planning.json' },
  { name: 'Fuel Management', file: 'mass-and-balance-fuel-management.json' },
  { name: 'Payload Arrangement', file: 'mass-and-balance-payload-arrangement.json' },
  { name: 'Balance Procedures', file: 'mass-and-balance-balance-procedures.json' },
  { name: 'Compliance Checking', file: 'mass-and-balance-compliance-checking.json' },
  { name: 'Takeoff Performance', file: 'performance-takeoff-performance.json' },
  { name: 'Climb Performance', file: 'performance-climb-performance.json' },
  { name: 'Cruise Performance', file: 'performance-cruise-performance.json' },
  { name: 'Descent Performance', file: 'performance-descent-performance.json' },
  { name: 'Landing Performance', file: 'performance-landing-performance.json' },
  { name: 'Obstacle Clearance', file: 'performance-obstacle-clearance.json' },
  { name: 'Performance Tables', file: 'performance-performance-tables.json' },
  { name: 'Practical Examples', file: 'performance-practical-examples.json' }
];

console.log('\n' + '='.repeat(100));
console.log('QUESTION NUMBERING AUDIT');
console.log('='.repeat(100) + '\n');

let totalQuestions = 0;
let issues = [];

chapters.forEach((ch, idx) => {
  const filePath = path.join(__dirname, 'practice-questions', ch.file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const questions = data.questions || [];
    totalQuestions += questions.length;
    
    const ids = questions.map(q => parseInt(q.id));
    const isSequential = ids.every((id, i) => id === i + 1);
    
    console.log(`${isSequential ? 'OK' : 'XX'} Ch${(idx+1).toString().padStart(2)}: ${ch.name.padEnd(25)} - ${questions.length} q`);
    
    if (!isSequential) {
      issues.push(`${ch.name}: got [${ids.slice(0,5).join(',')}...]`);
    }
  } catch (err) {
    console.log(`XX Ch${(idx+1).toString().padStart(2)}: ${ch.name.padEnd(25)} - ERROR`);
    issues.push(`${ch.name}: ${err.message}`);
  }
});

console.log('\n' + '='.repeat(100));
console.log(`Total: ${totalQuestions} questions | Issues: ${issues.length}`);

if (issues.length > 0) {
  console.log('\nFound issues:');
  issues.forEach(i => console.log(`  - ${i}`));
}
console.log('='.repeat(100) + '\n');
