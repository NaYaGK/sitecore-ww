# 90 Days of DevOps — React & TypeScript SPA

A modern, highly-interactive, responsive single-page web application (SPA) migrated from the static, monolithic "90 Days of DevOps" v4 dashboard. Built on top of **React 18**, **TypeScript 5**, and **Vite**, with modular components, reactive state management, Spaced Repetition engine, and Anthropic AI integration.

---

## 🚀 How to Run the Program

Follow these instructions to set up, run, and test the project locally.

### 📋 Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended) installed.

### 🔧 Installation
Extract the project, open your terminal in the project directory `/Users/karthikganji/Downloads/devops-roadmap-v5`, and install the dependencies:
```bash
npm install
```

### 💻 Running Development Server
Start the Vite local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 🧪 Running Automated Tests
To run the Vitest unit and integration suites once:
```bash
npm run test
```
To run tests in watch/interactive mode:
```bash
npm run test:watch
```

### 🧹 Linting & Type Checking
To check the code for TypeScript type correctness across all views and components:
```bash
npm run lint
```

### 🏗️ Compiling for Production
Build the optimized static assets into the `dist/` directory:
```bash
npm run build
```
To preview the production bundle locally:
```bash
npm run preview
```

---

## 🛠️ Technology Stack & Versions

The project uses the following tools and library versions:

| Technology / Library | Version | Description |
| :--- | :--- | :--- |
| **React** | `^18.2.0` | Core UI library for components and views structure |
| **React DOM** | `^18.2.0` | React browser rendering glue |
| **TypeScript** | `^5.2.2` | Strong type checking and developer experience |
| **Vite** | `^5.1.4` | Modern bundler and fast-refresh local development server |
| **Vitest** | `^1.3.1` | Next-generation testing framework |
| **JSDOM** | `^24.0.0` | Virtual browser environment for testing React rendering |
| **canvas-confetti** | `^1.6.0` | Micro-animations and celebrations upon task completion |
| **Vanilla CSS** | — | Clean custom design system using custom CSS variables (no TailwindCSS) |

---

## 📁 Project Structure

```
devops-roadmap-v5/
├── dist/                   # Production build outputs (index.html, JS, CSS assets)
├── public/                 # Static assets copied directly to the output root
│   ├── manifest.json       # PWA application manifest
│   └── sw.js               # Service worker for offline asset caching
├── src/
│   ├── __tests__/          # Automated unit/integration tests
│   │   ├── App.test.tsx    # App shell, routing, navigation, and theme tests
│   │   └── state.test.ts   # Core state hook logic and DORA calculations tests
│   ├── components/         # Reusable core elements & service definitions
│   │   ├── AIService.ts    # Secure client-side Claude prompts and fetch wrapper
│   │   ├── PomodoroModal.tsx # SVG circular Pomodoro timer and notifications modal
│   │   ├── TerminalSimulator.tsx # Stateful, command-interactive labs shell
│   │   └── Toast.ts        # Desktop-style Toast notification manager
│   ├── data/               # Typesafe static application datasets
│   │   ├── labs.ts         # Docker & Linux labs configurations & commands
│   │   ├── phases.ts       # Structured 90 Days schedule tasks & categories
│   │   ├── projects.ts     # Practical project prompts and talk points templates
│   │   └── qbank.ts        # Curated interview questions repository
│   ├── hooks/              # Custom React state hooks
│   │   └── useAppState.ts  # Central state engine: synchronizes tasks, notes, jobs, and stats
│   ├── views/              # Modular screens for page routing
│   │   ├── BuildLogView.tsx      # Production commit tracker and HTML portfolio downloader
│   │   ├── CertsView.tsx         # CKA, SAA, and Terraform progress checklist
│   │   ├── FocusView.tsx         # Focused single day checklist workspaces
│   │   ├── GithubRewriterView.tsx # README generation and profile auditor helper
│   │   ├── JobsView.tsx          # Salary aggregation & job tracking kanban lanes
│   │   ├── KanbanView.tsx        # Tasks status regroup overview
│   │   ├── LabsView.tsx          # Interactive console learning terminal selector
│   │   ├── LinkedInView.tsx      # Social post generator using Claude templates
│   │   ├── MockInterviewView.tsx # Time-boxed custom Q&A AI mock interview simulator
│   │   ├── ProjectsView.tsx      # Spec project logging and talk point checklists
│   │   ├── QbankView.tsx         # Categories questions explorer
│   │   ├── ReadinessView.tsx     # 8 gates check logic indicators
│   │   ├── ReportView.tsx        # Activity heatmap logger & PDF/JSON exports
│   │   ├── ResumeView.tsx        # Resume ATS scanning keyword matcher
│   │   ├── ReviewsView.tsx       # Spaced repetition rating card deck
│   │   ├── RoadmapView.tsx       # Phase statistics, filters, search, and roadmap overview
│   │   ├── SkillGapView.tsx      # JD match scoring audit recommendation paths
│   │   ├── StatsView.tsx         # Readiness meters, streaks, DORA percentages
│   │   └── WeeklyView.tsx        # Streaks, bounceback actions, and notifications toggle
│   ├── App.tsx             # App layout, top/bottom navigation menus, settings, and timers
│   ├── index.css           # Master stylesheet compiling design system rules
│   └── main.tsx            # App bootstrap, mounting point, and PWA Sw registration
├── index.html              # Entry HTML template referencing module script
├── tsconfig.json           # Parent solution-style tsconfig referencing app/node setups
├── tsconfig.app.json       # Browser runtime TypeScript compiler configurations
├── tsconfig.node.json      # Node-oriented configurations (Vite and Vitest)
├── vite.config.ts          # Vite React compiler setup
└── vitest.config.ts        # Vitest environments config
```

---

## 💡 Key Architectural Details

### 1. State Persistence & Parity
The core state logic resides in [useAppState.ts](file:///Users/karthikganji/Downloads/devops-roadmap-v5/src/hooks/useAppState.ts). It automatically reads and writes status values using the original monolithic app keys in `localStorage`:
- **Main Progress**: `devops90_v4` object holding task status and day notes.
- **Jobs**: `_jobs` array containing trackable job cards.
- **Projects & Labs**: Keys starting with `proj_done_` and `labdone_` dynamically mapping completions.
- **Notes**: Notes per day map to keys like `note_[day_index]`.

This preserves all progress data if users upgrade from v4 directly!

### 2. Client-Side Anthropic AI Integration
Isolated inside [AIService.ts](file:///Users/karthikganji/Downloads/devops-roadmap-v5/src/components/AIService.ts), the application performs direct browser queries to Claude models securely. Users can supply their Anthropic API key via:
1. Environment Variable: `VITE_ANTHROPIC_API_KEY` for local development setups.
2. Local Storage Settings: Inputting the key directly inside the settings modal in the application UI (stored in browser local storage for direct client-side execution).

### 3. Styling Principles
The application utilizes Vanilla CSS rules. All colors, layout properties, and aesthetics are declared via HSL custom tokens defined under `:root` in [index.css](file:///Users/karthikganji/Downloads/devops-roadmap-v5/src/index.css), facilitating smooth system-wide Dark / Light mode toggling.
