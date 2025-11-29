const fs = require('fs');
const path = require('path');

/**
 * Merge extracted JSON papers into samplePapers.js format
 */
function mergeExtractedPapers() {
  const extractedDir = path.join(__dirname, '..', 'data', 'extracted-papers');
  const samplePapersPath = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'samplePapers.js');

  console.log('🔄 Merging Extracted Papers');
  console.log('='.repeat(50));

  // Check if extracted papers directory exists
  if (!fs.existsSync(extractedDir)) {
    console.log(`\n⚠️  No extracted papers directory found: ${extractedDir}`);
    console.log(`\nPlease run 'npm run extract-pdf' first to extract questions from PDFs.`);
    return;
  }

  // Read all JSON files from extracted-papers directory
  const jsonFiles = fs.readdirSync(extractedDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(extractedDir, file));

  if (jsonFiles.length === 0) {
    console.log(`\n⚠️  No JSON files found in: ${extractedDir}`);
    console.log(`\nPlease run 'npm run extract-pdf' first.`);
    return;
  }

  console.log(`\n📚 Found ${jsonFiles.length} extracted paper(s)\n`);

  // Read existing samplePapers.js
  let existingData = {};
  if (fs.existsSync(samplePapersPath)) {
    try {
      const fileContent = fs.readFileSync(samplePapersPath, 'utf8');
      // Extract the data object using regex and safe parsing
      const match = fileContent.match(/export const samplePapersData = ({[\s\S]*});/);
      if (match) {
        // Use Function constructor for safer evaluation (better than eval)
        const dataString = match[1];
        try {
          existingData = JSON.parse(dataString);
        } catch (jsonError) {
          // If JSON.parse fails, try Function constructor (for JS object literals)
          const func = new Function('return ' + dataString);
          existingData = func();
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not read existing samplePapers.js: ${error.message}`);
      console.log(`   Creating new file...`);
    }
  }

  // Merge extracted papers
  let mergedCount = 0;
  let updatedCount = 0;

  for (const jsonFile of jsonFiles) {
    try {
      const jsonContent = fs.readFileSync(jsonFile, 'utf8');
      const paperData = JSON.parse(jsonContent);
      const paperName = Object.keys(paperData)[0];

      if (existingData[paperName]) {
        console.log(`   ⚠️  "${paperName}" already exists. Skipping...`);
        continue;
      }

      existingData[paperName] = paperData[paperName];
      mergedCount++;
      console.log(`   ✅ Merged: ${paperName} (${paperData[paperName].Questions?.length || 0} questions)`);
    } catch (error) {
      console.log(`   ❌ Error reading ${path.basename(jsonFile)}: ${error.message}`);
    }
  }

  if (mergedCount === 0) {
    console.log(`\n⚠️  No new papers to merge. All papers already exist in samplePapers.js`);
    return;
  }

  // Generate new samplePapers.js content
  const newContent = `// Sample Paper Data
export const samplePapersData = ${JSON.stringify(existingData, null, 2)};
`;

  // Write to samplePapers.js
  fs.writeFileSync(samplePapersPath, newContent, 'utf8');

  console.log(`\n${'='.repeat(50)}`);
  console.log('✅ Merge Complete!');
  console.log(`${'='.repeat(50)}`);
  console.log(`\n📊 Summary:`);
  console.log(`   • Merged ${mergedCount} new paper(s)`);
  console.log(`   • Total papers in samplePapers.js: ${Object.keys(existingData).length}`);
  console.log(`\n📁 Updated file: ${path.relative(process.cwd(), samplePapersPath)}`);
  console.log(`\n🎉 Your frontend will now display the new papers!`);
}

// Run the script
if (require.main === module) {
  mergeExtractedPapers();
}

module.exports = { mergeExtractedPapers };

