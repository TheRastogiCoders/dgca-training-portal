# 🚀 Quick Start: Extract Questions from PDFs

## One-Command Setup

### Windows Users:
Double-click `extract-questions.bat` in the project root folder.

### Mac/Linux Users:
```bash
chmod +x extract-questions.sh
./extract-questions.sh
```

### Manual Method:
```bash
cd server
npm install
npm run extract-and-merge
```

## 📝 Step-by-Step

### 1. Install Dependencies (First Time Only)
```bash
cd server
npm install
```

### 2. Add Your PDF Files
Place your 7 PDF files in the `pdf-input/` folder:
```
pdf-input/
  ├── paper-1.pdf
  ├── paper-2.pdf
  └── ...
```

### 3. Run Extraction
```bash
cd server
npm run extract-and-merge
```

That's it! Your questions are now in the frontend.

## ✅ What Happens

1. **Extraction**: Script reads all PDFs and extracts questions
2. **Conversion**: Questions converted to JSON format
3. **Integration**: Automatically merged into `client/src/data/samplePapers.js`
4. **Frontend**: Papers appear in your website immediately!

## 📊 Check Results

- **Extracted JSON**: `server/data/extracted-papers/*.json`
- **Frontend Data**: `client/src/data/samplePapers.js`
- **Console Output**: Shows number of questions extracted

## ⚠️ Troubleshooting

**No questions found?**
- Check PDFs contain selectable text (not images)
- Verify PDF format matches expected structure

**Options not detected?**
- Review generated JSON files manually
- Edit JSON files if needed

**Need help?**
- See `PDF_EXTRACTION_SETUP.md` for detailed guide

---

**That's all! Your papers are ready to use! 🎉**

