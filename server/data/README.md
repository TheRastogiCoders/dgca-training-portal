# DGCA Search Assistant - Data Structure Guide

This directory contains all the JSON data files that power the DGCA Search Assistant. The system searches through these files to provide instant suggestions and detailed answers.

## File Structure

### 1. `books.json`
Contains information about all aviation books (CAE Oxford, RK Bali, etc.)

**Structure:**
```json
{
  "id": "unique-book-id",
  "name": "Book Name",
  "author": "Author Name",
  "subject": "Subject Name",
  "chapters": [
    {
      "id": "chapter-id",
      "name": "Chapter Name",
      "pageStart": 1,
      "pageEnd": 50
    }
  ]
}
```

### 2. `topics.json`
Contains all aviation topics that can be searched.

**Structure:**
```json
{
  "id": "topic-id",
  "title": "Topic Title",
  "aliases": ["Alternative Name 1", "Alternative Name 2"],
  "bookId": "book-id",
  "chapterId": "chapter-id",
  "pageNumber": 52,
  "category": "Category Name",
  "relatedTopics": ["related-topic-id-1", "related-topic-id-2"]
}
```

### 3. `definitions.json`
Contains detailed definitions with explanations, formulas, and examples.

**Structure:**
```json
{
  "id": "definition-id",
  "term": "Term Name",
  "simpleExplanation": "Brief explanation",
  "detailedExplanation": "Comprehensive explanation",
  "formulas": [
    {
      "name": "Formula Name",
      "formula": "V = d/t",
      "description": "Formula description"
    }
  ],
  "examples": [
    "Example 1",
    "Example 2"
  ],
  "bookId": "book-id",
  "chapterId": "chapter-id",
  "pageNumber": 52,
  "relatedTerms": ["Related Term 1", "Related Term 2"]
}
```

### 4. `chapters.json`
Contains chapter information with topics.

**Structure:**
```json
{
  "id": "chapter-id",
  "bookId": "book-id",
  "name": "Chapter Name",
  "topics": [
    {
      "id": "topic-id",
      "title": "Topic Title",
      "pageNumber": 52
    }
  ]
}
```

### 5. `questions.json`
Contains practice questions related to topics.

**Structure:**
```json
{
  "id": "question-id",
  "question": "Question text",
  "answer": "Answer text",
  "topicId": "topic-id",
  "bookId": "book-id",
  "chapterId": "chapter-id",
  "pageNumber": 52,
  "difficulty": "Easy|Medium|Hard"
}
```

### 6. `pyq.json`
Contains Previous Year Questions (PYQs) from DGCA exams.

**Structure:**
```json
{
  "id": "pyq-id",
  "year": 2023,
  "exam": "DGCA CPL|ATPL",
  "question": "Question text",
  "answer": "Answer text",
  "topicId": "topic-id",
  "bookId": "book-id",
  "chapterId": "chapter-id",
  "pageNumber": 52,
  "marks": 5
}
```

## Adding New Content

### To add a new topic:
1. Add entry to `topics.json` with unique ID
2. Link to appropriate book and chapter
3. Add related topics if applicable

### To add a new definition:
1. Add entry to `definitions.json`
2. Ensure the `term` matches a topic title or alias
3. Include formulas and examples for better answers

### To add PYQs:
1. Add entry to `pyq.json`
2. Link to relevant topic using `topicId`
3. Include year, exam type, and marks

## Search Functionality

- **Suggestions**: Searches through topics, definitions, chapters, and books
- **Matching**: Uses keyword matching (case-insensitive, partial matches)
- **AI Rewriting**: Only rewrites/simplifies existing content, never generates new information

## Best Practices

1. **Consistent IDs**: Use kebab-case for IDs (e.g., `airwash-effect`)
2. **Aliases**: Add multiple aliases in topics for better search matching
3. **Page Numbers**: Always include accurate page numbers for book references
4. **Related Content**: Link related topics and terms for better navigation
5. **Complete Definitions**: Include simple explanation, detailed explanation, formulas, and examples

