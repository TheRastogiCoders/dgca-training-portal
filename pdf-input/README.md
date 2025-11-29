# PDF Input Folder

## 📁 Place Your PDF Files Here

Simply drop your PDF files into this folder and run the extraction script.

### Requirements

- PDF files must contain **selectable text** (not scanned images)
- Questions should follow standard MCQ format:
  - Question number (e.g., "1.", "Q1", "Question 1")
  - Options labeled A, B, C (e.g., "A)", "A.", "(A)")
  - Answer key (e.g., "Answer: A", "Correct Answer: B")

### Quick Start

1. **Add PDFs**: Copy your PDF files to this folder
2. **Run Script**: 
   - Windows: Double-click `extract-questions.bat` in the project root
   - Or run: `cd server && npm run extract-and-merge`
3. **Check Output**: JSON files will be created in `server/data/extracted-papers/`
4. **Frontend**: Papers will automatically be available in your website!

### Example File Names

- `air-regulations-paper-1.pdf`
- `meteorology-sample-paper.pdf`
- `navigation-questions.pdf`

The script will automatically name the papers based on your PDF filenames.

---

**Note**: After extraction, you can delete PDFs from here or keep them as backup.

