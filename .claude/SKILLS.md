# CrypticOwl — LLM Contributor Guide

A daily cryptic crossword learning app. One clue per day, gamified with streaks, XP, and levels. React frontend backed by Supabase (Postgres + Auth) and an automated AWS Lambda clue generator.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 + inline `style` props (see Styling section) |
| Animation | `motion/react` (Framer Motion v12) |
| Charts | `recharts` (Interactive line charts for history) |
| Icons | Lucide React |
| Backend | Supabase (Postgres + Google OAuth) |
| Clue Gen | AWS Lambda (Node 24 + Gemini 2.5 Pro generator / 2.5 Flash judge) |
| Analytics | Google Analytics 4 (via `gtag.js`) |
| Persistence | `localStorage` (primary) + Supabase (sync when authenticated) |
| Fonts | Fredoka One (headings), Nunito (body) |

---

## Project Structure

```
src/
  lib/
    supabase.ts              # Supabase client, all DB types, all helper functions
  app/
    App.tsx                  # Root: DarkModeProvider + AuthProvider wrap RouterProvider
    routes.tsx               # Route config: Root > { Home, Learn, Puzzle, Puzzle/:number, History, Privacy, NotFound }
    theme.ts                 # LIGHT + DARK color token objects + getTheme()
    context/
      DarkModeContext.tsx    # isDark state + toggle(), persisted to localStorage
      AuthContext.tsx        # Google OAuth session, user object, signIn/signOut
    hooks/
      useStreak.ts           # XP / streak / level logic — localStorage + Supabase sync
      useClueReaction.ts     # Like/dislike reaction state — localStorage + Supabase sync
    pages/
      Root.tsx               # Layout: sticky nav, dark toggle, mobile menu, streak, auth, footer, <Outlet />
      Home.tsx               # Landing: hero (dynamic puzzle), stats strip, wordplay preview, AppLikeButton
      Learn.tsx              # Guide: 5 sections — Intro, Parts, Wordplay, Indicators, Synonyms
      Puzzle.tsx             # Daily puzzle: dynamic fetching, clue, answer grid, hints, confetti, share
      History.tsx            # Auth-gated: interactive charts (recharts), solve history, puzzle archive
      Privacy.tsx            # Descriptive privacy policy with Google OAuth & Analytics transparency
      NotFound.tsx           # Fun 404 page with mascot "Ollie"
    components/
      Mascot.tsx             # Ollie the Owl — SVG mascot with mood states and speech bubbles
      ui/                    # Radix UI / shadcn components

lambda/
  index.js                   # Lambda entry point — wires pipeline, writes to DB
  constants/
    gemini.js                # Model IDs, base URL, generation configs, headers
    prompts.js               # System prompts, MAX_ATTEMPTS (9), response schemas
    clue.js                  # AUTHOR_MAP, clue type metadata
    alerts.js / sns.js / telegram.js
  clients/
    aiClient.js              # AI provider abstraction
    dbClient.js              # DB provider abstraction (Supabase)
    alertClient.js           # Alert routing
    providers/
      gemini.js              # callGemini() + callGeminiFlash() — 429 retry with retryDelay parsing
      supabase.js
      sns.js / telegram.js
  core/
    pipeline.js              # Orchestrates: lexical → generate → judge → retry → DB write
    generator/
      lexicalPlanner.js      # Selects word + type (avoids recent repeats from DB)
      clueGenerator.js       # Generates clue from word + type; accepts judge feedback
    validator/
      judge.js               # judgeClue() — Gemini 2.5 Flash, score ≥7 required, rejectLexical signal
    builder/
      hintBuilder.js         # constructHints() — builds JSONB hints from lexical + clue objects
  services/
    dbService.js             # getRecentUsage(), writeToDB() — inserts clues + clue_components

supabase/
  migrations/
    001_initial.sql          # Single migration file — full schema, seed data, RLS, functions
```

---

## Routing

```
/               → Home.tsx
/learn          → Learn.tsx
/puzzle         → Puzzle.tsx          (today's dynamic puzzle from DB)
/puzzle/:number → Puzzle.tsx          (archive view by number)
/history        → History.tsx         (requires sign-in — interactive stats)
/privacy        → Privacy.tsx         (legal/contact info)
/*              → NotFound.tsx        (404 handler)
```

---

## Styling — Critical Rules

**This codebase does NOT use Tailwind color classes.** All colors come from the theme system via inline `style` props.

### The theme pattern
```tsx
const { isDark } = useDarkMode();
const T = getTheme(isDark);
style={{ background: T.cardBg, color: T.text }}
```

### Brand color palette
```
Purple:           #7C3AED (primary CTA)    #5B21B6 (gradient end)   #C4B5FD (light text)
Blue (info):      #3B82F6 border           #EFF6FF bg-light          #0D1F35 bg-dark
Green (success):  #10B981 border           #ECFDF5 bg-light          #062010 bg-dark
Red (error):      #FCA5A5 border           #FFF1F2 bg-light          #2A0F15 bg-dark
Orange (streak):  #F97316 border           #FFF7ED bg-light          #2A1505 bg-dark
Amber (revealed): #D97706 (text/border)    #FEF3C7 bg-light
```

### Hint card color sequence (`HINT_STYLES` in Puzzle.tsx)
```tsx
const HINT_STYLES = [
  { color: '#3B82F6', bg: '#EFF6FF', bgDark: '#0D1F35', border: '#93C5FD' }, // Hint 1: definition
  { color: '#7C3AED', bg: '#F5F3FF', bgDark: '#1A0F35', border: '#C4B5FD' }, // Hint 2: indicator
  { color: '#F97316', bg: '#FFF7ED', bgDark: '#2A1505', border: '#FED7AA' }, // Hint 3: fodder
  { color: '#059669', bg: '#ECFDF5', bgDark: '#062010', border: '#6EE7B7' }, // Hint 4: mechanism
];
```

---

## Data Fetching & Architecture

### Dynamic Puzzles
The app is **dynamic-first with local fallback**.
- `Puzzle.tsx` calls `fetchPuzzleByDate(today)` on mount.
- If no puzzle exists for today, `fetchPuzzleByDate` automatically falls back to the previous day's puzzle (one retry only — no chain).
- If the DB is entirely unreachable, it falls back to a hardcoded `DEFAULT_PUZZLE`.
- Archive puzzles (`/puzzle/:number`) are fetched via `fetchPuzzleByNumber(number)`.
- `isArchive` is `requestedNumber !== undefined` — truthy whenever a puzzle number appears in the URL, even if it matches today's number.

### Local date (timezone-safe)
`clientDate` in `useStreak.ts` uses local date construction, **not** `toISOString().split('T')[0]` (which returns UTC and breaks streaks for UTC+ users):
```typescript
const d = new Date();
const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
```

### Solve History & Analytics
Authenticated users see a rich dashboard in `History.tsx`:
- **Solve Insights**: Interactive `LineChart` from `recharts` showing trends for Hints, Wrong Guesses, and Solve Time.
- **Activity Heatmap**: A 12-week grid visualizing solve consistency.
- **Trend Analysis**: Improvement percentages calculated by comparing early vs. recent performance.

---

## Hint System (4 Progressive Hints)

Hints are derived from the normalised `clue_components` table — **never hardcoded**. This means adding/fixing a component row auto-updates hints for all users.

### `buildHintsFromComponents(clue_components, primaryType, legacyHints)` — in `Puzzle.tsx`

| Hint | Label | Source |
|---|---|---|
| 1 | Definition | Component with `role = 'definition'`. For `double_definition`: both definition + indicator components joined. |
| 2 | Indicator | Component with `role = 'indicator'`. For types with no indicator (double_definition, cryptic_definition, andlit): explains why there isn't one. |
| 3 | Fodder / Letters | Component with `role = 'fodder'` or `container_inner`/`container_outer`. For no-fodder types: explains the mechanism instead. |
| 4 | Mechanism | Explains the wordplay type in plain English (anagram, reversal, hidden word, etc.). |

**Three-tier fallback**: `clue_components` → legacy JSONB `hints` field → generic educational text. Users always see 4 hints.

### `double_definition` special handling
The Gemini generator stores the 2nd definition in the `indicator` slot in `clue_parts`. `buildHintsFromComponents` detects `primaryType === 'double_definition'` and:
- Hint 1: shows both definitions (definition + indicator component text)
- Hint 2: "No indicator needed — both parts are definitions"
- Hint 3: "No fodder — find which meaning of the answer fits each definition"

### `explanation` field
`explanation` is **never selected from `clue_components`** in Supabase queries — it would reveal the answer mechanism to users. It is intentionally null for all AI-generated clues; human-authored clues may populate it via the admin UI for future use.

---

## Reveal-Answer State (`wasRevealed`)

When a user clicks "I'm stuck, reveal the answer":
- `wasRevealed` is set to `true`
- The solve is recorded in state (`isCorrect = true`) but **no XP is awarded**, **no streak is counted**, `recordSolve` is **not called**
- Success screen shows: **"Almost there! 🤏"** (amber header) instead of "You got it! 🎊" (purple)
- Mascot says: **"So close! 🤏 Try again tomorrow!"** instead of "Brilliant solve! 🎉"
- Share squares use **🟫** instead of colored emoji
- Share text: "Today's clue stumped me — can you crack it without peeking? 🫣"
- XP card shows amber: "No XP this time 🙈"
- Confetti suppressed

---

## Anonymous Likes (`AppLikeButton` in Home.tsx)

- Reads live count from `app_likes_count` Supabase view via `fetchAppLikesCount()`
- Posts a like via `addAppLike()` which inserts into `app_likes` table
- Gated by `sessionStorage` key `'tco-app-liked'` — one like per browser session
- No authentication required

---

## Clue Generation Pipeline (AWS Lambda)

The Lambda runs nightly and generates the next day's clue.

### Models
| Role | Model | Temperature |
|---|---|---|
| Lexical Planner | `gemini-2.5-pro` | 1.0 |
| Clue Generator | `gemini-2.5-pro` | 1.0 |
| Judge | `gemini-2.5-flash` | 0.1 (deterministic) |

### Pipeline (`core/pipeline.js`)
1. **Variety check** — `getRecentUsage()` fetches last 14 days; avoids answers seen at all, avoids types used ≥3 times.
2. **Lexical planning** — `lexicalPlanner.js` picks a word + type using Gemini 2.5 Pro.
3. **Attempt loop** (up to `MAX_ATTEMPTS = 9`):
   a. **Stage 1: Rule-based structural check** — validates clue_parts, answer, definition presence.
   b. **Stage 2: Judge** — `judgeClue()` via Gemini 2.5 Flash; requires `score ≥ 7 / 10`.
   c. If judge returns `rejectLexical: true` → abort all remaining attempts for this word, re-plan.
   d. If judge provides feedback → feed it back into the generator for the next attempt.
4. **DB write** — `writeToDB()` inserts into `clues`, `daily_puzzles`, and `clue_components`.

### 429 Rate-Limit Retry (`clients/providers/gemini.js`)
`callGemini()` parses the `google.rpc.RetryInfo.retryDelay` duration string from the error `details[]` array:
```json
{ "@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": "49s" }
```
- Delay is parsed from the proto Duration string (e.g. `"49s"`, `"49.213s"`)
- Capped at `MAX_RETRY_DELAY_MS = 120_000` ms (stays within Lambda timeout)
- Fallback when no RetryInfo: `Math.min(30_000 * (1 + retryCount), MAX_RETRY_DELAY_MS)`
- Max `MAX_RATE_LIMIT_RETRIES = 2` retries per call

### Clue Components written to DB
`writeToDB()` inserts one row per meaningful `clue_part` into `clue_components`:

| `clue_parts` type | `clue_components` role | `indicator_type` |
|---|---|---|
| `definition` | `definition` | null |
| `indicator` | `indicator` | from `INDICATOR_TYPE_MAP` |
| `fodder` | `fodder` | null |
| `container_outer` | `container_outer` | null |
| `container_inner` | `container_inner` | null |
| `result` | `result` | null |
| anything else | `link_word` | null |

`INDICATOR_TYPE_MAP` covers: `anagram`, `reversal`, `container`, `hidden`, `deletion`, `homophone`. Types without a classifiable indicator (charade, double_definition, etc.) get `indicator_type: null`.

**`explanation` is always `null`** for AI-generated clues — never auto-populated.

---

## Database Schema — Key Tables

### `clues`
| Column | Notes |
|---|---|
| `clue_text` | The clue string |
| `answer` | Uppercase answer word |
| `answer_pattern` | Length string e.g. `"5"` or `"4,5"` |
| `primary_type` | `ClueWordplayType` enum |
| `definition_text` | Isolated definition phrase |
| `wordplay_summary` | Plain-English mechanism description |
| `clue_parts` | JSONB array of `{ type, text }` objects |
| `hints` | Legacy JSONB hints (fallback when clue_components absent) |
| `difficulty` | `'easy'` \| `'medium'` \| `'hard'` |
| `judge_score` | 1–10 overall quality (Gemini 2.5 Flash) |
| `judge_surface_quality` | 1–5 surface reading score |
| `judge_wordplay_correct` | Boolean — mechanically valid |
| `judge_indicator_fair` | Boolean — indicator is a known British signal |

### `clue_components`
Normalised breakdown of each clue for the progressive hint system.
| Column | Notes |
|---|---|
| `clue_id` | FK → clues |
| `step_order` | Display order (1-based) |
| `role` | `'definition'` \| `'indicator'` \| `'fodder'` \| `'container_outer'` \| `'container_inner'` \| `'result'` \| `'link_word'` |
| `clue_text` | The actual text span from the clue |
| `indicator_type` | FK → `clue_indicator_types.id`; only set when `role = 'indicator'` |
| `explanation` | Always `null` for AI clues — never sent to frontend |

**CHECK constraint**: `CHECK (role = 'indicator' OR indicator_type IS NULL)` — allows indicator rows to have a null indicator_type (e.g. charade, double_definition).

### `daily_puzzles`
| Column | Notes |
|---|---|
| `date` | Publication date (UTC) |
| `puzzle_number` | Sequential, never null, unique |
| `clue_id` | FK → clues |
| `published` | Boolean gate |

### `app_likes` / `app_likes_count` view
Anonymous heart-button likes. One insert per like. `app_likes_count` view exposes the aggregate count.

---

## Supabase Helper Functions (`src/lib/supabase.ts`)

| Function | Purpose |
|---|---|
| `fetchPuzzleByDate(isoDate, allowFallback?)` | Fetch today's puzzle; falls back to yesterday if missing |
| `fetchPuzzleByNumber(puzzleNumber)` | Fetch an archive puzzle by number |
| `recordSolve(params)` | Calls `record_solve` RPC — never upsert `user_stats` directly |
| `fetchAppLikesCount()` | Returns integer count from `app_likes_count` view |
| `addAppLike()` | Inserts into `app_likes`; returns boolean success |

Both fetch functions:
- Join `daily_puzzles → clues → clue_components (step_order, role, clue_text)` — note: `explanation` is **excluded**
- Sort `clue_components` by `step_order` in JS (PostgREST nested selects are unordered)
- Return a flat `DbDailyPuzzle` object

---

## Deployment & CI/CD

### Web Deployment (S3 + CloudFront)
Managed via `.github/workflows/deploy.yml`.
- Builds static site with Vite.
- Syncs to S3 and invalidates CloudFront cache.
- Requires: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`, `VITE_GA_ID`.

### Lambda Deployment
Managed via `.github/workflows/deploy-lambda.yml`.
- **Idempotent**: Attempts to `update-function-code` first, falls back to `create-function` if not found.
- Packages code + dependencies into a zip.
- Injects `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` as environment variables.
- **AWS Lambda timeout must be set to 10 minutes** — the 429 retry logic (up to 2 × 120 s sleeps) requires it. The default 3 s timeout will kill retried calls.

---

## Analytics & Tracking

### Google Analytics 4
- Integrated in `index.html` via `gtag.js`.
- Uses `VITE_GA_ID` environment variable (e.g., `G-XXXXXXXXXX`).
- `VITE_GA_ID` is only defined in the production deploy environment — the `%VITE_GA_ID% is not defined` Vite warning during local builds is expected and non-blocking.
- Only anonymous usage data is collected (page views, solve events).

---

## Common Dev Tasks

### Running Locally
1. `npm install`
2. Create `.env` from `.env.example`
3. `npm run dev`
4. For Lambda testing: `cd lambda && npm install && node test-local.js` (if created).

### Linting & Formatting
```bash
npm run format            # Prettier auto-fix (writes files)
npm run format:check      # Prettier check only (CI mode)
npm run lint              # ESLint with --max-warnings 0
npm run typecheck         # tsc --noEmit
npm run build             # Vite production build
```
All five must pass before any production deploy. Unused variables must be prefixed with `_` or removed — ESLint enforces `@typescript-eslint/no-unused-vars`.

### Adding a Clue Manually
Insert into `clues` table in Supabase, then map it in `daily_puzzles` with a `date` and `puzzle_number`. Optionally add rows to `clue_components` for full hint support.

---

## Core Guidelines for LLMs
1. **Never use Tailwind color classes** (e.g., `bg-purple-500`). Use `style={{ background: T.cardBg }}`.
2. **Follow the Mascot mood system**: Use `thinking` for loading, `correct` for success, `wrong` for errors, `hint` when the user revealed an answer.
3. **Keep the footer in Root.tsx**: It contains critical copyright and legal links.
4. **Use `record_solve` RPC**: Never upsert `user_stats` directly; use the Supabase function to maintain atomicity.
5. **Responsive first**: Use `flex`, `grid`, and `clamp()` for all layouts.
6. **`explanation` is private**: Never select or expose `clue_components.explanation` to the frontend — it reveals the answer mechanism.
7. **`isArchive` detection**: Use `requestedNumber !== undefined`, not a comparison against a specific puzzle number.
8. **Local date for streaks**: Always compute `clientDate` using local `getFullYear/getMonth/getDate`, never `toISOString().split('T')[0]`.
9. **Hint count is always 4**: `buildHintsFromComponents` guarantees 4 hints for every clue type via 3-tier fallback. Never hardcode hints or show fewer than 4.
10. **`wasRevealed` gates all rewards**: XP, streak, confetti, share text, mascot mood, and header color all branch on `wasRevealed`. Don't add any new reward without checking it.
