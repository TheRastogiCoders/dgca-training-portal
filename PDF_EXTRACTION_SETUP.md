# PDF Question Extraction Setup Guide

This guide will help you extract questions from PDF files and integrate them into your website automatically.

## 📋 Overview

The system extracts MCQ (Multiple Choice Questions) from PDF files and converts them into the JSON format used by your website. You just need to:
1. Place PDF files in the `pdf-input` folder
2. Run the extraction script
3. Merge the extracted data (optional, automatic)

## 🚀 Quick Start

### Step 1: Install Dependencies

Navigate to the server directory and install the required package:

```bash
cd server
npm install
```

This will install `pdf-parse` which is needed for PDF text extraction.

### Step 2: Add Your PDF Files

1. Place all your PDF files (up to 7 PDFs as mentioned) in the `pdf-input` folder at the root of the project:
   ```
   pdf-input/
     ├── paper-1.pdf
     ├── paper-2.pdf
     ├── paper-3.pdf
     └── ...
   ```

2. **Important**: Ensure your PDFs:
   - Contain selectable text (not scanned images)
   - Follow a standard MCQ format with:
     - Question number (e.g., "1.", "Q1", "Question 1")
     - Options labeled A, B, C (e.g., "A)", "A.", "(A)")
     - Answer key (e.g., "Answer: A", "Correct Answer: B")

### Step 3: Extract Questions from PDFs

Run the extraction script:

```bash
cd server
npm run extract-pdf
```

Or from the project root:

```bash
cd server && npm run extract-pdf
```

The script will:
- Process all PDF files in the `pdf-input` folder
- Extract questions, options, and answers
- Save JSON files to `server/data/extracted-papers/`

### Step 4: Merge with Frontend (Automatic)

After extraction, merge the papers into your frontend:

```bash
cd server
npm run merge-papers
```

This will automatically update `client/src/data/samplePapers.js` with the extracted questions.

## 📁 File Structure

```
dgca-training-portal/
├── pdf-input/                    # ← Place your PDFs here
│   ├── paper-1.pdf
│   ├── paper-2.pdf
│   └── ...
├── server/
│   ├── scripts/
│   │   ├── extract-pdf-questions.js    # Main extraction script
│   │   └── merge-extracted-papers.js   # Merge script
│   └── data/
│       └── extracted-papers/           # Generated JSON files
│           ├── paper-1.json
│           └── ...
└── client/
    └── src/
        └── data/
            └── samplePapers.js         # Final merged data
```

## 🔧 How It Works

### Question Format Detection

The script recognizes various question formats:

**Question Number Formats:**
- `1. Question text...`
- `Q1 Question text...`
- `Question 1: Question text...`
- `(1) Question text...`

**Option Formats:**
- `A) Option text`
- `A. Option text`
- `(A) Option text`
- `A Option text`

**Answer Formats:**
- `Answer: A`
- `Correct Answer: B`
- `Key: C`
- `Solution: A`

### Output Format

Each extracted question follows this structure:

```json
{
  "ID": 1,
  "Question": "Your question text here?",
  "Options": {
    "A": "First option",
    "B": "Second option",
    "C": "Third option"
  },
  "Correct_Answer": "A"
}
```

## 🎯 Usage Examples

### Example 1: Extract from Single PDF

1. Place `my-paper.pdf` in `pdf-input/`
2. Run: `npm run extract-pdf`
3. Check `server/data/extracted-papers/my-paper.json`

### Example 2: Batch Processing

1. Place all 7 PDFs in `pdf-input/`
2. Run: `npm run extract-pdf`
3. All PDFs will be processed automatically
4. Run: `npm run merge-papers` to integrate with frontend

### Example 3: Update Existing Papers

If you update a PDF:
1. Replace the old PDF in `pdf-input/`
2. Run extraction again
3. The script will create a new JSON file
4. Merge to update the frontend

## ⚠️ Troubleshooting

### Issue: "No questions found"

**Possible causes:**
- PDF contains scanned images (not text)
- PDF format doesn't match expected patterns
- PDF is password protected

**Solutions:**
- Use OCR software to convert scanned PDFs to text
- Check PDF format matches the expected structure
- Remove password protection from PDF

### Issue: "Options not detected"

**Possible causes:**
- Options use non-standard formatting
- Options are in a table format
- Options span multiple lines incorrectly

**Solutions:**
- Manually review and edit the generated JSON files
- Adjust the extraction patterns in `extract-pdf-questions.js`

### Issue: "Correct answers missing"

**Possible causes:**
- Answer key is in a separate section
- Answer format doesn't match expected patterns

**Solutions:**
- Manually add answers to the JSON files
- Update the answer detection patterns in the script

## 🔍 Manual Review & Editing

After extraction, you should review the generated JSON files:

1. Open `server/data/extracted-papers/[filename].json`
2. Check:
   - Questions are complete
   - Options are correctly extracted
   - Correct answers are present
3. Edit manually if needed
4. Run merge script to update frontend

## 📊 Integration with Frontend

The extracted papers are automatically integrated into:

- **Component**: `SamplePaperViewer.js`
- **Data Source**: `client/src/data/samplePapers.js`
- **Route**: `/sample-papers/[subject]/[book]/[paper]`

After merging, your papers will be available in the frontend immediately!

## 🎨 Customization

### Adjusting Extraction Patterns

Edit `server/scripts/extract-pdf-questions.js` to customize:

- Question number detection (line ~50)
- Option extraction (line ~60)
- Answer detection (line ~100)

### Changing Output Format

Modify the `parseQuestions` function to change the output structure.

## 📝 Best Practices

1. **Test with one PDF first** before processing all 7
2. **Review extracted data** before merging to frontend
3. **Keep original PDFs** as backup
4. **Name PDFs descriptively** (e.g., `air-regulations-paper-1.pdf`)
5. **Check question count** matches expected numbers

## 🆘 Support

If you encounter issues:

1. Check the console output for error messages
2. Verify PDF format matches expected structure
3. Review the generated JSON files manually
4. Check that all dependencies are installed

## ✅ Checklist

Before running extraction:
- [ ] Dependencies installed (`npm install` in server folder)
- [ ] PDF files placed in `pdf-input/` folder
- [ ] PDFs contain selectable text (not images)
- [ ] PDFs follow standard MCQ format

After extraction:
- [ ] Review generated JSON files
- [ ] Verify question count matches expectations
- [ ] Check options and answers are correct
- [ ] Run merge script to integrate with frontend
- [ ] Test papers in the frontend

---

**Happy extracting! 🚀**

