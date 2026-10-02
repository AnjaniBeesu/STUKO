# STUKO

**Study, but make it yours.**

STUKO is an all-in-one study website designed around one simple idea: studying should not feel like juggling ten different apps.

It brings study planning, focused sessions, notes, document tools, AI-assisted study generation, exam preparation, academic calculators and a personal study library into one workspace.

## What is STUKO?

STUKO is a student-first study platform for people who want a single place to **study, organize, revise, calculate, and track their academic progress**.

The product is designed to stay useful for both everyday studying and high-pressure situations such as exams. It combines practical productivity tools with an interest-first experience rather than trying to become another generic task manager.

### Current study tools

- **Pomodoro Timer** — focused study sessions with a built-in to-do list and clear-all action.
- **Study Room** — reserved workspace for the upcoming study-room experience.
- **Flashcards** — generate and review study cards from uploaded material.
- **Quiz Maker** — create practice questions from study material.
- **Summarizer** — turn uploaded study material into concise revision material.
- **Library** — organize saved notes, flashcards, quizzes and other study resources.
- **Exam Mode** — urgent exam preparation with a short-term study plan, Pomodoro sessions, topic tasks, readiness tracking, past-paper analysis and focus tools.
- **Notes** — create, format, save and edit rich study notes.
- **Search** — discover public notes shared by other students.
- **Upload & Annotate** — open PDFs, DOCX and PPTX material and work with document-focused tools such as highlighting, annotations and text-to-speech.
- **Attendance Calculator** — estimate required attendance and how many classes can be missed while staying above a target percentage.
- **SGPA / CGPA Calculator** — calculate and predict academic performance using configurable grading systems.

## Problems STUKO aims to solve

### 1. Students use too many disconnected tools

A student might use one app for Pomodoro, another for notes, another for PDFs, another for flashcards, another for quizzes and a spreadsheet for CGPA.

STUKO brings those workflows together.

### 2. Study material gets scattered

Notes, PDFs, generated flashcards and quizzes often end up in different folders and applications. STUKO's Library is intended to become a central study repository with folders and organization tools.

### 3. Exam preparation is usually reactive

Students often realize too late that they have not covered enough of the syllabus. Exam Mode turns a short exam window into an actionable plan by breaking syllabus topics into tasks and tracking readiness.

### 4. Attendance calculations are unnecessarily annoying

The classic question — **"How many classes can I skip and still stay above 75%?"** — should have a straightforward answer. STUKO provides a dedicated attendance workflow instead of forcing students to calculate it manually.

### 5. Academic calculators are fragmented

SGPA and CGPA calculations depend on credits, grades and grading systems. STUKO provides a configurable calculator and predictor rather than assuming every university uses exactly the same grading scheme.

### 6. Students need focus, not more noise

STUKO's focus features are intentionally practical: Pomodoro sessions, distraction recovery, focus lock, task lists and optional motivational interactions.

## Product philosophy

STUKO is built around three principles:

**One workspace.** Keep the study workflow together.

**Student control.** Let users choose their study style, themes, organization and motivation preferences.

**Useful over gimmicky.** Gamification and AI should support studying instead of becoming the product itself.

## Tech stack

STUKO is a modern full-stack web application built around the following technologies.

### Frontend

- **Next.js 16** — application framework and routing
- **React** — component-based UI
- **TypeScript** — type safety
- **CSS / CSS-in-JS** — responsive styling and theme-aware UI
- Responsive, laptop-first interface with mobile fallbacks

### Backend / platform

- **Next.js App Router** — pages and application structure
- **Next.js server-side functionality / API routes** where required
- **Vercel** — deployment and hosting

### Authentication and database

- **Firebase Authentication** — user authentication, including Google sign-in
- **Cloud Firestore** — user profiles, notes, study resources and application data
- Firebase Storage can be used for user-uploaded assets where required

### Documents and study material

- **PDF.js / pdfjs-dist** — PDF rendering and text-layer interaction
- **DOCX processing** — document extraction/rendering workflow
- **PPTX processing** — slide-oriented document workflow
- Browser File APIs for local uploads and previews
- Text-to-speech through the browser's Web Speech API where supported

### AI layer

STUKO's AI-powered tools can use an LLM provider for tasks such as:

- summarization
- flashcard generation
- quiz generation
- document question generation
- study insights
- exam-material analysis

The AI provider is intentionally kept behind the application's study-tool layer so the frontend does not need to depend directly on a specific model vendor.

### Deployment / infrastructure

- **Vercel** for production deployments
- **GitHub** for source control and collaboration
- Environment variables for private credentials and API keys
- Production builds run through `next build`

## Project structure

```text
STUKO/
├── app/                 # Next.js routes and pages
├── components/          # Reusable UI components
├── lib/                 # Firebase, utilities and shared application logic
├── public/              # Static assets
├── README.md
├── LICENSE
├── package.json
└── tsconfig.json
```

## Getting started

### Requirements

- Node.js 20+ recommended
- npm
- A Firebase project for authentication/database features
- Required environment variables for Firebase and any enabled AI provider

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

## Environment variables

Do **not** commit private keys or API credentials to GitHub.

Depending on the enabled features, STUKO may require environment variables for:

- Firebase configuration
- Firebase authentication
- Firestore access
- AI/LLM provider credentials
- Other third-party integrations

The exact variable names should match the application's current `lib/` configuration.

## Roadmap

STUKO is still actively evolving. Planned areas include:

- richer Library organization and folders
- stronger public-note discovery
- improved document annotation persistence
- richer flashcard and quiz review systems
- better exam readiness analytics
- attendance tracking across individual subjects
- stronger SGPA/CGPA prediction tools
- study analytics and streaks
- expanded AI study assistance
- collaborative study features
- improved accessibility and keyboard navigation
- performance and SEO improvements

## SEO

STUKO also aims to make genuinely useful student utilities discoverable through search. Examples include:

- attendance calculator
- how many classes can I skip calculator
- SGPA calculator
- CGPA calculator
- SGPA predictor
- study notes
- exam preparation tools
- Pomodoro timer
- PDF study tools

The goal is not simply to rank pages; each SEO-facing tool should provide an actual useful student workflow.

## Contributing

STUKO is primarily developed as a student project, but contributions, bug reports and ideas are welcome.

Before submitting changes:

1. Create a focused branch.
2. Keep changes scoped to one feature or fix.
3. Run `npm run build` before opening a pull request.
4. Do not commit credentials, Firebase secrets or API keys.
5. Explain user-facing changes clearly in the pull request.

## License

STUKO is released under the **MIT License**.

See [`LICENSE`](./LICENSE) for the complete license text.

## Author

**Anjani Beesu**

GitHub: https://github.com/AnjaniBeesu

LinkedIn: https://www.linkedin.com/in/anjanibeesu/
