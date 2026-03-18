# DGCA Training Portal (VIMAANNA) – Codebase Analysis

This document summarizes the structure, architecture, and key patterns of the **dgca-training-portal** project (product name: **VIMAANNA**).

---

## 1. Project overview

- **Purpose:** DGCA (Directorate General of Civil Aviation) exam preparation for CPL/ATPL: question banks, PYQ (Previous Year Questions), practice tests, study library, and AI-assisted practice.
- **Product name:** VIMAANNA (used in SEO, copy, and branding).
- **Root package name:** `vimaanna-dgca-training-portal` (client/server packages: `vimaanna-dgca-client` and `vimaanna-dgca-server`).

---

## 2. Tech stack

| Layer   | Technology |
|--------|------------|
| **Client** | React 18, React Router 6, Tailwind CSS, Axios, xlsx, @google/generative-ai (client-side AI usage if any) |
| **Server** | Node.js, Express 4, Mongoose 8, MongoDB |
| **Auth**   | JWT (Bearer), bcrypt, optional Google OAuth (google-auth-library) |
| **AI**     | Google Generative AI (Gemini 1.5 Flash) via @google/generative-ai on server |
| **Validation** | Zod (server), custom validation (client) |
| **Security**   | Helmet, CORS, express-rate-limit, optional Redis (cache) |

---

## 3. Repository structure (high level)

```
dgca-training-portal/
├── client/                 # Create React App (React 18)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Pages & UI (Header, Footer, HomePage, Library, etc.)
│   │   ├── components/admin/
│   │   ├── components/ui/
│   │   ├── config/         # api.js, seo.js, globalAssets.js
│   │   ├── context/        # AuthContext
│   │   ├── data/           # Static JSON (sample papers, some PYQ data)
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── server/
│   ├── index.js            # Express app, middleware, API mount, practice-question endpoints
│   ├── routes/             # auth, subjects, books, questions, results, notes, reports, ai, admin, search
│   ├── models/             # User, Subject, Book, Question, Result, Note, Report, Log
│   ├── middleware/         # auth.js, cache.js
│   ├── utils/              # practiceQuestions.js, cache, passwordValidator, etc.
│   ├── practice-questions/ # JSON files per book/chapter (e.g. oxford-*.json)
│   ├── practiceBooks.json  # List of practice books and subjects
│   ├── data/               # books.json, chapters.json, chapters/<bookSlug>.json overrides
│   ├── scripts/            # DB indexes, PDF extraction, merge scripts
│   └── package.json
└── package.json            # Root: concurrently runs client + server
```

---

## 4. Client architecture

### 4.1 Entry and routing

- **Entry:** `client/src/index.js` → `App.js` (no global router wrapper in index).
- **App.js:** Wraps app in `ErrorBoundary` → `AuthProvider` → `Router`. Uses `ScrollToTop` and lazy-loaded route components. Renders `Header`, `Suspense`-wrapped `Routes`, `WhatsAppFloat`, and `Footer`.

### 4.2 Routes (App.js)

| Path | Component | Purpose |
|------|------------|--------|
| `/` | HomePage | Landing, hero, features, about/question bank/library previews, FAQ, CTA, feedback |
| `/about` | AboutUs | About VIMAANNA, mission, services |
| `/library` | Library | Study materials / library entries from API |
| `/question-bank` | QuestionBank | Subject/book/chapter navigation for practice |
| `/pyq` | PracticeTest | PYQ entry; links to AI practice and book-based practice |
| `/login` | LoginPage | Login/register (modal or page) |
| `/profile` | Profile | User profile, stats, recent activity |
| `/books/:subject` | BookSelection | Book selection per subject (air-regulations, air-navigation, etc.) |
| `/questions/:subjectSlug/:bookSlug` | BookChapters | Chapters for a book |
| `/pyq/ai`, `/pyq/ai/:subjectSlug`, … | AIPracticeSubject, AIPracticeBooks, AIPracticeChapters, AIPracticeRunner | AI-driven practice flow |
| `/pyq/book/:bookSlug`, `/pyq/book/:bookSlug/:chapterSlug` | BookPracticeRunner | Book/chapter practice (server practice-questions JSON) |
| `/sample-papers/...` | SamplePapersList, SamplePaperViewer | Sample paper list and viewer |
| `/practice/:subjectSlug/:bookSlug/:chapterSlug` | ChapterPracticeIntro | Intro for chapter practice |
| `/admin/*` | StudentsLogins, QuestionUpload, Reports | Admin: users, upload questions, reports |
| `/support/contact` | ContactSupport | Contact/support (not in main nav) |

### 4.3 Auth (AuthContext.js)

- **Storage:** JWT in `localStorage` (`token`), user object in `localStorage` (`user`).
- **API:** Login/register via `api.js` endpoints (e.g. `AUTH_LOGIN`, `AUTH_REGISTER`, `AUTH_GOOGLE`). Token sent as `Authorization: Bearer <token>` for protected APIs.
- **Exposed:** `user`, `login`, `logout`, `isAuthenticated`, `isAdmin()`, `loading`. No automatic token refresh; logout clears `adminToken`/`adminUser` too.

### 4.4 API usage (config/api.js)

- **Base URL:** Production uses `REACT_APP_API_URL` or default Render URL; dev uses proxy or `http://localhost:5000`.
- **Endpoints:** Centralized in `API_ENDPOINTS`: auth, admin, questions, results, notes, reports, AI chat, practice-books, practice-questions, search suggest/ask.

### 4.5 UI and styling

- **Global:** `App.css` defines gradient background (`.gradient-bg`), glass cards (`.site-card`, `.site-card-glass`), institute buttons (`.btn-institute-primary`, etc.). `index.css` includes Tailwind and any overrides.
- **Home:** HomePage currently uses `gradient-bg` and multiple `site-card` sections (About, Question Bank, Library, Feedback). Other pages (Library, QuestionBank, Profile, PracticeTest, AboutUs, Login, ContactSupport, Admin, etc.) also use `gradient-bg` and `site-card` for a consistent “institute” glass look.
- **Icons:** `client/src/components/ui/Icons.js` exports SVG icon components (e.g. IconPlane, IconBook, IconClipboard). Some components still use emojis (e.g. in practiceBooks.json and possibly elsewhere).
- **SEO:** `SEO.js` and `config/seo.js` used for titles/descriptions; HomePage and likely others set meta per page.

### 4.6 Key client components (by role)

- **Layout:** Header (logo, nav, Get Started / Login or Profile/Logout), Footer (multi-column links, contact), WhatsAppFloat.
- **Home:** HomePage with HeroCarousel, FeaturesStrip, AboutSection, QuestionBankSection, LibrarySection, SubjectsStrip, HowItWorks, StatsStrip, FAQSection, FinalCTA, FeedbackSection.
- **Practice flow:** QuestionBank → BookSelection → BookChapters → ChapterPracticeIntro / BookPracticeRunner; or PYQ → AIPracticeSubject → AIPracticeBooks → AIPracticeChapters → AIPracticeRunner.
- **Data:** Practice question metadata/counts via `practiceQuestionsApi.js` (calls `/api/practice-questions/:book/count?chapter=...`). Full questions loaded by BookPracticeRunner / AIPracticeRunner from server.

---

## 5. Server architecture

### 5.1 Entry and middleware (index.js)

- **Stack:** express, cors (origin: true, credentials), helmet (CSP, etc.), body parsers (json/urlencoded, 10mb), rate limiters (auth, AI).
- **Logging:** Request logging middleware writes to `Log` model (method, url, status, ip, userId, userAgent, responseMs).
- **DB:** Mongoose connects to `process.env.MONGODB_URI`; server continues without DB if connection fails (no crash).
- **Static:** `/uploads` served from `server/uploads`.
- **Routes:** All under `/api/*`: auth, subjects, books, questions, results, notes, reports, ai, admin, search. Practice data: `/api/practice-books`, `/api/practice-books/:book/chapters`, `/api/practice-questions/:book` and `/api/practice-questions/:book/count` implemented in index.js using `resolvePracticeQuestionFile` and files in `practice-questions/`.

### 5.2 Auth (routes/auth.js, middleware/auth.js)

- **Local:** Register (username, email, password with validation), login (JWT). Passwords hashed with bcrypt (e.g. 12 rounds).
- **Google:** Optional Google OAuth (GOOGLE_CLIENT_ID); token verified with google-auth-library.
- **Middleware:** `auth` verifies JWT from `Authorization: Bearer` and sets `req.user`; `requireAdmin` checks `req.user.isAdmin`.

### 5.3 Models (MongoDB/Mongoose)

- **User:** username, email, password, isAdmin, isActive.
- **Result:** user, subject/book refs or testType (book/admin/ai), subjectName/bookName/chapterName, score, total, timeSpent, difficulty, answers array (question ref or questionText, selected, correct, explanation).
- **Others:** Subject, Book, Question, Note, Report, Log (structure implied by routes and index).

### 5.4 Practice questions (file-based)

- **Source:** JSON files in `server/practice-questions/` (e.g. `oxford-*.json`, `cae-oxford-*-*.json`). Naming: `<bookPrefix>-<chapterSlug>.json` or `<bookPrefix>.json`.
- **Mapping:** `server/utils/practiceQuestions.js` defines `PRACTICE_BOOK_SLUG_MAPPING` (e.g. air-law → oxford, general-navigation → cae-oxford-general-navigation). `resolvePracticeQuestionFile(bookParam, chapterParam)` returns the file path (or null) with fallbacks and spelling variants.
- **Chapters:** From `server/data/chapters.json` + `server/data/books.json`, or overrides in `server/data/chapters/<bookSlug>.json`. Index.js endpoint `/api/practice-books/:book/chapters` returns chapter list with question counts by reading the corresponding JSON files.
- **Env:** `PRACTICE_QUESTIONS_DISABLED=true` causes practice-question endpoints to return empty/count 0 without reading files.

### 5.5 AI (routes/ai.js)

- **Model:** Google Generative AI (Gemini 1.5 Flash) when `GOOGLE_API_KEY` is set.
- **Endpoint:** POST `/api/ai/chat` with body `{ message }`. Prompt frames the bot as “VIMAANNA AI” for aviation/DGCA. On missing key or API errors, a fallback aviation reply is returned. Rate limited (e.g. 50/min).

### 5.6 Other routes (brief)

- **questions:** CRUD for Question model; cache middleware; admin-only create/update.
- **books / subjects:** Likely read-only or CRUD for Book/Subject.
- **results:** Save and retrieve user results (linked to User, Subject/Book or testType).
- **notes / reports:** User notes and reports.
- **admin:** Admin login, users, question upload/find/update, etc.
- **search:** suggest/ask (e.g. search suggestions and possibly AI-backed “ask”).

---

## 6. Data flow (summary)

1. **Practice questions (book/chapter):** Client calls `/api/practice-books` and `/api/practice-books/:book/chapters`; then for a chapter, GET `/api/practice-questions/:book?chapter=...`. Server uses `practiceQuestions.js` to resolve to a JSON file and returns it. Client `practiceQuestionsApi.js` maps subject/book to server book slug and fetches counts.
2. **Auth:** Client login/register → server auth routes → JWT and user returned → client stores in localStorage and sets AuthContext. Subsequent API calls send Bearer token; server `auth` middleware attaches `req.user`.
3. **Results:** Client submits result payload to `/api/results` (with auth); server stores in Result model.
4. **AI chat:** Client sends message to `/api/ai/chat`; server uses Gemini or fallback and returns response.

---

## 7. Configuration and environment

- **Server:** `server/.env` (not committed); `server/.env.example` lists: `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_API_KEY`, `ADMIN_HOST`.
- **Client:** Uses `REACT_APP_API_URL` in production; dev relies on proxy in client package.json (e.g. `"proxy": "http://localhost:5000"`).
- **Security:** JWT secret must be set in production. Auth and AI rate limiters are applied. Helmet CSP allows Google auth/apis; CORS allows all origins (suitable for dev; may want to restrict in prod).

---

## 8. Inconsistencies and notes

1. **Naming:** Root and client/server package names have been aligned with the VIMAANNA DGCA training portal branding.
2. **Home design:** HomePage currently uses `gradient-bg` and `site-card` for About, Question Bank, Library, and Feedback. If the target is a “normal” marketing site with content on a white background (no glass overlay), those sections and the home wrapper would need to be updated to a white/light layout and non-glass blocks (as previously discussed in design iterations).
3. **Design system:** Most non-home pages use `gradient-bg` + `site-card` consistently. Any move to a white, “content on page” style for the home page only would create a split: home = white, rest = glass. A site-wide design pass could unify this.
4. **Icons vs emojis:** Practice books and some content still use emoji (e.g. in practiceBooks.json). UI components have been partially migrated to SVG icons from `Icons.js`.
5. **Commented code:** Server index and routes contain commented middleware (e.g. csrf, mongoSanitize, swagger, errorHandler). Useful for future hardening; currently inactive.
6. **Cache:** Server uses Redis-capable cache (middleware/cache.js, utils/cache.js). If Redis is not configured, cache may no-op or use in-memory; verify for production.
7. **Admin vs student auth:** Admin login may use separate adminToken/adminUser in localStorage; logout in AuthContext clears both to avoid conflicts.

---

## 9. File count (approximate)

- **Client:** ~52 JS files under `client/src` (components, config, context, hooks, utils, data).
- **Server:** ~29 JS files (index, routes, models, middleware, utils, scripts). Large number of JSON files in `practice-questions/` and under `data/`.

---

## 10. Quick reference – important files

| File | Role |
|------|------|
| `client/src/App.js` | Router, lazy routes, layout |
| `client/src/context/AuthContext.js` | Auth state, login/logout |
| `client/src/config/api.js` | API base URL and endpoints |
| `client/src/components/HomePage.js` | Landing and all home sections |
| `client/src/components/Header.js` | Nav, logo, Get Started / Login |
| `client/src/utils/practiceQuestionsApi.js` | Practice book slug mapping, chapter metadata fetch |
| `server/index.js` | Express app, practice-books and practice-questions endpoints |
| `server/routes/auth.js` | Register, login, Google OAuth |
| `server/middleware/auth.js` | JWT verification, requireAdmin |
| `server/utils/practiceQuestions.js` | Book/chapter → JSON file path resolution |
| `server/practiceBooks.json` | Practice book list and subject mapping |
| `server/.env.example` | Required env vars for server |

This analysis reflects the codebase as of the last inspection. For design or feature changes (e.g. home page redesign, new routes, or API changes), update this document accordingly.
