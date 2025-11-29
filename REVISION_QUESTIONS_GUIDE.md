# 📚 Revision Questions Extraction Guide

## 🎯 Overview

This system extracts **"Revision Questions"** chapters from PDF files and automatically creates practice question files that integrate with your book chapter system. Unlike sample papers, these questions are organized as **chapters within books**.

## 🔑 Key Differences from Sample Papers

| Feature | Sample Papers | Revision Questions (This System) |
|---------|--------------|----------------------------------|
| **Location** | `samplePapers.js` | `server/practice-questions/*.json` |
| **Structure** | Standalone papers | Book chapters |
| **Access** | `/sample-papers/...` | `/practice/[subject]/[book]/[chapter]` |
| **Format** | `{ "Paper Name": { Questions: [...] } }` | `{ book_name, chapter_title: "Revision Questions", questions: [...] }` |
| **Integration** | SamplePaperViewer component | BookPracticeRunner component |

## 📋 How It Works

### Step 1: PDF Naming Convention

**The PDF filename determines which book it belongs to!**

Place your PDFs in `pdf-input/` folder with names that include book identifiers:

```
pdf-input/
  ├── ic-joshi-meteorology-revision.pdf          → IC Joshi Meteorology
  ├── cae-oxford-air-regulations-revision.pdf    → CAE Oxford Air Regulations
  ├── cae-oxford-navigation-revision.pdf         → CAE Oxford Navigation
  ├── rk-bali-revision.pdf                       → RK Bali
  └── operational-procedures-revision.pdf        → Operational Procedures
```

### Step 2: Book Identification

The script automatically identifies the book from the PDF filename using these patterns:

| Book Identifier | Patterns Recognized |
|----------------|-------------------|
| **IC Joshi** | `ic-joshi`, `icjoshi` |
| **CAE Oxford Meteorology** | `cae.*meteorology`, `oxford.*meteorology` |
| **CAE Oxford Air Regulations** | `cae.*air.*regulation`, `oxford.*air.*regulation` |
| **CAE Oxford Navigation** | `cae.*navigation`, `oxford.*navigation` |
| **CAE Oxford General Navigation** | `cae.*general.*navigation` |
| **RK Bali** | `rk.*bali`, `rkbali` |
| **Operational Procedures** | `operational.*procedure`, `ops.*procedure` |
| **Instrument** | `instrument` |

### Step 3: Run Extraction

```bash
cd server
npm run extract-revision
```

### Step 4: Output

The script creates JSON files in `server/practice-questions/` with this format:

```json
{
  "book_name": "MET_IC_Joshi_7 Edition",
  "chapter_number": "N/A",
  "chapter_title": "Revision Questions",
  "chapter_slug": "ic-joshi-revision-questions",
  "source": "ic-joshi",
  "questions": [
    {
      "question_number": "Q1",
      "question": "Your question text?",
      "question_type": "MCQ",
      "options": [
        "(a) Option A",
        "(b) Option B",
        "(c) Option C"
      ],
      "answer": "a",
      "solution": "(a) Option A",
      "explanation": ""
    }
  ]
}
```

## 📁 File Structure

```
dgca-training-portal/
├── pdf-input/                              ← Place PDFs here
│   ├── ic-joshi-meteorology-revision.pdf
│   └── cae-oxford-navigation-revision.pdf
├── server/
│   ├── scripts/
│   │   └── extract-revision-questions.js  ← Extraction script
│   └── practice-questions/                 ← Generated files
│       ├── ic-joshi-revision-questions.json
│       └── cae-oxford-navigation-revision-questions.json
└── client/
    └── src/
        └── components/
            └── BookPracticeRunner.js       ← Displays chapters
```

## 🚀 Quick Start

### 1. Install Dependencies (if not done)

```bash
cd server
npm install
```

### 2. Add PDF Files

Place your PDF files in `pdf-input/` folder with descriptive names:

```
pdf-input/ic-joshi-meteorology-revision.pdf
```

### 3. Run Extraction

```bash
cd server
npm run extract-revision
```

### 4. Verify Output

Check `server/practice-questions/` for generated JSON files.

## 📊 Expected Output

```
🚀 Revision Questions Extractor
============================================================

📚 Found 7 PDF file(s)

📄 Processing: ic-joshi-meteorology-revision.pdf
   📚 Identified Book: MET_IC_Joshi_7 Edition
   Pages: 100
   Extracting Revision Questions...
   ✅ Extracted 1000 questions
   💾 Saved to: server/practice-questions/ic-joshi-revision-questions.json

... (for each PDF)

============================================================
📊 Summary
============================================================
✅ Successfully processed 7 file(s):

   📄 MET_IC_Joshi_7 Edition
      Questions: 1000
      File: ic-joshi-revision-questions.json

📁 All practice question files saved to: server/practice-questions/
```

## 🔍 Question Format Detection

The script recognizes various question formats:

### Question Number Formats:
- `1. Question text...`
- `Q1 Question text...`
- `Question 1: Question text...`
- `(1) Question text...`

### Option Formats:
- `(a) Option text`
- `A) Option text`
- `A. Option text`
- `a Option text`

### Answer Formats:
- `Answer: (a)`
- `Correct Answer: (b)`
- `Key: c`
- `Solution: (a)`

## 🎨 Integration with Frontend

### Automatic Integration

Once extracted, the revision questions automatically appear in:

1. **Book Chapter List**: `/practice/[subject]/[book]`
   - Shows "Revision Questions" as a chapter
   - Displays question count

2. **Chapter Practice**: `/practice/[subject]/[book]/[chapter-slug]`
   - Full practice interface
   - Progress tracking
   - Answer checking

### Example URLs

- IC Joshi Meteorology: `/practice/meteorology/ic-joshi/ic-joshi-revision-questions`
- CAE Oxford Navigation: `/practice/air-navigation/cae-oxford/cae-oxford-navigation-revision-questions`

## ⚙️ Configuration

### Adding New Book Mappings

Edit `server/scripts/extract-revision-questions.js` and add to `BOOK_MAPPING`:

```javascript
'new-book': {
  patterns: [/new-book/i, /newbook/i],
  bookName: 'New Book Name',
  source: 'new-book',
  slugPrefix: 'new-book'
}
```

### Customizing Chapter Title

The chapter title is hardcoded as "Revision Questions". To change:

```javascript
const chapterTitle = 'Your Custom Title';
```

## ⚠️ Troubleshooting

### Issue: "No questions found"

**Possible causes:**
- PDF contains scanned images (not text)
- PDF format doesn't match expected patterns
- PDF is password protected

**Solutions:**
- Use OCR software to convert scanned PDFs
- Check PDF format matches expected structure
- Remove password protection

### Issue: "Book not identified"

**Possible causes:**
- PDF filename doesn't contain book identifier
- Book mapping not configured

**Solutions:**
- Rename PDF to include book identifier (e.g., `ic-joshi-...pdf`)
- Add book mapping in `BOOK_MAPPING` object

### Issue: "Options not detected"

**Possible causes:**
- Options use non-standard formatting
- Options are in a table format

**Solutions:**
- Manually review and edit generated JSON files
- Adjust extraction patterns in script

## 📝 Manual Review Process

After extraction:

1. **Review JSON files** in `server/practice-questions/`
2. **Check question count** matches expectations
3. **Verify options** are correctly extracted
4. **Check answers** are present and correct
5. **Test in frontend** to ensure proper display

## 🔄 Updating Existing Chapters

If you update a PDF:

1. Replace the old PDF in `pdf-input/`
2. Run extraction again: `npm run extract-revision`
3. The script will **overwrite** the existing JSON file
4. Changes appear immediately in frontend

## 📊 Best Practices

1. **Name PDFs descriptively**: Include book identifier in filename
2. **Test with one PDF first**: Verify format before processing all
3. **Review extracted data**: Always check generated JSON files
4. **Keep original PDFs**: As backup for future reference
5. **Document book mappings**: If adding custom books

## 🆘 Support

### Common Questions

**Q: Can I extract multiple chapters from one PDF?**  
A: Currently, each PDF creates one "Revision Questions" chapter. For multiple chapters, split into separate PDFs.

**Q: How do I add a new book?**  
A: Add entry to `BOOK_MAPPING` in `extract-revision-questions.js`.

**Q: Can I change the chapter title?**  
A: Yes, modify `chapterTitle` variable in the script.

**Q: Where do questions appear in the frontend?**  
A: In the book chapter list under the respective book.

## ✅ Checklist

Before running extraction:
- [ ] Dependencies installed (`npm install` in server folder)
- [ ] PDF files placed in `pdf-input/` folder
- [ ] PDF filenames include book identifiers
- [ ] PDFs contain selectable text (not images)
- [ ] PDFs follow standard MCQ format

After extraction:
- [ ] Review generated JSON files
- [ ] Verify question count matches expectations
- [ ] Check options and answers are correct
- [ ] Test chapters in frontend
- [ ] Verify questions appear in book chapter list

---

**Ready to extract revision questions! 🚀**

Just name your PDFs correctly and run `npm run extract-revision`!

