# Lingova — Comprehensive Feature Inventory

A complete, design-PRD-ready description of every feature currently implemented in the app, organized by page. Tech: Next.js 15 App Router · React Server Components · Prisma + PostgreSQL · NextAuth (JWT) · Groq `llama-3.3-70b-versatile` · ElevenLabs TTS · Browser Web Speech.

---

## 1. Global / Cross-cutting Systems

These power every page. Designers must account for them everywhere.

### 1.1 Languages

- **Native language (UI language)**: 12 supported — English, Russian, Arabic, Chinese, German, Portuguese, Italian, Hindi, Turkish, Japanese, Korean, Armenian. Drives all UI copy via `lib/i18n.ts`.
- **Target language (what you're learning)**: 3 supported — French (`fr`), Spanish (`es`), English (`en`). Stored on `User.targetLanguage`; flips all content across the app.
- **Per-language content**: separate data files for vocab (`*-vocabulary.ts`), stories (`*-stories.ts`), and learning paths (`learning-path*.ts`).

### 1.2 Auth (NextAuth + Credentials + Google OAuth)

- Email + password signup with optional phone, OTP email verification
- Google OAuth login
- Session via JWT (`session: { strategy: "jwt" }`)
- Roles: `STUDENT`, `TEACHER`, `ADMIN` (different routes/permissions)
- Delete-account flow

### 1.3 Gamification core

- **XP system**: 50-level ladder, threshold = `100 * (n-1)^1.5`. Stored on `Progress.xp`.
- **Level milestones** (unlock features): L3 unlocks AI Tutor, L5 unlocks all games, L10 advanced stories, L15 2× XP weekends, L20 custom tutor scenarios, L25 mastery tracking, L30 grammar deep-dive, L40 leaderboard title badge, L50 Master crown frame.
- **XP rewards**: complete story +50, perfect quiz +30, quiz answer +5, save word +2, tutor session +25, game win +20, game play +10, daily streak +10.
- **Streak**: daily login counter on `Progress.streak`. Decays if user misses a day.
- **Streak Shields**: earned every 7-day streak (cap 3), automatically consumed to prevent streak break.
- **Badges (14 total)**: Story Starter, Streak Starter (3d), Streak Hero (7d), Word Collector (10 words), Word Hoarder (50 words), Conversation Starter, Quiz Master, Rising Star (L5), Apprentice (L10), Fluent Speaker (L20), Advanced Learner (L30), Language Master (L50), Game On, Story Finisher.
- **Daily Goals widget**: 3 daily tasks — read 1 story, play 1 game, do AI tutor/writing once. Each rendered with completion check.
- **Skill tree**: 3 numeric skill axes — vocabulary, grammar, speaking (0-100) on `Progress.skillTree`.

### 1.4 Sidebar (left-rail nav)

Persistent on every dashboard page. 256px wide, glassmorphic.

- Emerald logo block + serif-italic "Lingova" wordmark + target-language flag
- 12 nav items: Dashboard, Learning Path, Games Hub, AI Tutor, Stories, Writing, Dictionary, My Words, Review, Progress, Leaderboard, Community
- Bottom: profile widget (gradient avatar ring + name + level), Settings icon, Theme toggle (dark/light), Sign out

### 1.5 Theming

- **Dark mode** (default): near-black `#050505` background, emerald `#10B981` accent, Cormorant Garamond italic headings, JetBrains Mono numbers, Inter body
- **Light mode**: `#FAFAFA` bg, `#FFFFFF` cards, emerald accent preserved
- Toggle persists in localStorage

---

## 2. Auth & Onboarding Pages

### 2.1 `/` — Landing page (unauth)

- Hero: large italic serif "Lingova" wordmark + emerald logo block
- 3 feature cards: Adaptive Path, AI Immersion, Global Leagues
- CTA buttons: "Get Started" → register, "Sign In" → login
- Footer: legal links

### 2.2 `/login` — Login page

- Email or phone field (toggle)
- Password field
- "Continue with Google" OAuth button
- "Forgot password" link
- Demo account banner (student@demo.com / teacher@demo.com)
- Link to `/register`

### 2.3 `/register` — Sign up page

- Name, email, password, optional phone
- Native language picker (12 options, flag grid)
- Target language picker (3 cards: FR/ES/EN with flags)
- Form validation (Zod)
- "Continue with Google" OAuth
- Auto-redirects to `/onboarding` after sign up

### 2.4 `/verify` — OTP verification

- 6-digit OTP input (email or SMS)
- Resend countdown
- Skip option

### 2.5 `/onboarding` — 5-step wizard

Fires once after sign-up. Required before dashboard access.

- **Step 1 — Age group**: under 18, 18-24, 25-34, 35-49, 50+
- **Step 2 — Native language**: 12 options (auto-pre-filled from register)
- **Step 3 — Learning goal**: Travel, Career, Casual, Heritage, Full fluency, Academic
- **Step 4 — Proficiency**: Absolute beginner, Some basics, Intermediate, Conversational, Advanced
- **Step 5 — Daily goal**: 5 / 10 / 20 / 30 minutes per day
- Progress dots, back/next nav, validation per step
- Persists to `User` and triggers OnboardingModal on first home visit

---

## 3. Dashboard Pages

### 3.1 `/home` — Dashboard

**Purpose**: morning landing pad. Surfaces today's goals + progress at a glance.

Contains:

- **Hero greeting**: `{greeting}, {firstName}.` — large serif italic (Bonjour/Hola/Hello based on target language) + target-flag emoji
- **Sub-greeting**: streak-aware ("{N}-day streak — keep it going!") or onboarding ("Ready to start learning {Language}?")
- **Badges-earned widget** (top right): stacked badge emojis + count
- **4 stat cards** (grid):
  - Today's XP / Level (with progress bar to next level + Zap icon)
  - Current Streak (Flame + day count)
  - Level (Trophy + level number)
  - Words saved (BookMarked + count)
- **2-column grid (lg:8/4)**:
  - **Left col**:
    - Quick Actions (4 buttons): AI Tutor, Games Hub, Dictionary, Stories
    - Today's Plan: words-due-for-review count, suggested game (rotates daily, skips already played), goals progress
    - Daily Goals: 3 tasks (read story / play game / tutor or writing) with completion checks
    - Recommended Games preview (4 cards linking to games)
    - Leaderboard preview (top 4 by XP)
  - **Right col**:
    - Continue Learning card (resumes last story or links to learning path)
    - Word of Day (rotates daily by target language) with TTS playback
    - Progress rings (4 skills: Vocabulary, Listening, Grammar, Writing — SVG donuts)
    - Active Unit (current chapter progress)
- **Onboarding modal**: fires once for new users — 3-step intro

### 3.2 `/learn` — Learning Path

**Purpose**: curriculum journey. Vertical path of topics organized by phase.

Contains:

- **Header**: big italic "The Path to Mastery" + subtitle, GraduationCap icon
- **3 Phases** (per target language):
  - Phase 1 — The Basics: alphabet, pronunciation, greetings, numbers, essentials
  - Phase 2 — Core Grammar: articles/gender, pronouns, key verbs, tenses, adjectives, negation, questions
  - Phase 3 — Real World: food/drinks, directions, time/days, past, future
- **Topic nodes**: circular nodes (locked / in-progress / completed) connected by vertical lines (gray → emerald as completed)
- **Topic hover card**: lesson count, "Exam at end" badge, description
- **Progress dot bar**: overall % across all chapters
- **Celebration modal**: fires on chapter / phase / course completion with XP reward (10-1000 XP)
- **Reset Progress button**: clears localStorage tracking for dev/testing
- **Fixed bottom CTA**: "Continue Learning →" jumps to next unlocked topic

### 3.3 `/learn/[lessonId]` — Individual lesson

**Purpose**: deliver one lesson's content + practice + completion.

3-phase flow:

- **LEARN phase**: section cards with heading + body + optional table (e.g. verb conjugation grid) + example pairs (target/English) + optional tip box
- **PRACTICE phase**: progress bar + question card with 3 exercise types:
  - Multiple choice (tap option, immediate green/red feedback)
  - Fill in the blank (typed input + hint)
  - Translate (typed input)
  - Answer revealed after submission; next question button
- **DONE phase**: score circle (XX/XX) + percent + XP earned + Review Lesson / Next Lesson / Back to Path buttons
- Localstorage tracks `completedLessons_${targetLang}`
- Fires `lesson-completed` event to update sidebar / home

### 3.4 `/games` — Games Hub

**Purpose**: 25 mini-games organized by skill category.

Contains:

- **Header**: "Practice Games" + subtitle
- **Filter pills**: All / Vocabulary / Grammar / Listening / Immersive (white-on-black active)
- **Grid of 25 game cards** — see [Section 4](#4-individual-games) for the full inventory. Each card:
  - Icon tile (12×12, emerald glow on hover)
  - Category badge (uppercase) + XP-reward amber badge
  - Bold serif italic title
  - 2-line description
  - Fake avatar stack ("200+ Playing") + circular play arrow on hover

### 3.5 `/tutor` — AI Tutor

**Purpose**: real conversational practice with AI roleplay characters.

Locked until Level 3. Contains:

- **Locked screen** (if L<3): lock icon + "Reach Level 3" message + XP-earning tips card + "Start Learning" / "Play Games" CTAs
- **Scenario picker** (when unlocked):
  - Hero: BrainCircuit icon + "AI Immersion Tutor" serif italic h1 + subtitle
  - 3 Persona cards: Sofia (Language Coach, emerald), Marcus (Street Expert, blue), Elara (Academic Scholar, purple). Active = emerald ring.
  - 4 Scenario cards: At the Café (waiter — Pierre/Carlos/Tom), Exploring the City (traveler — Sophie/Elena/Emma), Language Class (teacher — Mme Dubois/Sra. García/Ms. Johnson), Free Chat (free — Alex/Diego/James). Names auto-swap per target language.
  - Pill CTA: "Start Immersion Session"
- **Chat screen**:
  - Header: avatar circle + persona name + pulsing emerald status dot + scenario label, ShieldCheck button + End button (rose)
  - Messages: streaming AI replies via Groq `/api/tutor` SSE — assistant bubbles `bg-white/5` + user bubbles emerald solid black-text
  - Footer: Mic icon button (voice — reserved), text input with emerald send button (when input has content)
  - Footer caption: "AI Tutor may provide grammar corrections in character. · Powered by Groq"
  - Sidebar tip card: cycles language-specific grammar tip every 30s
- **End Session**: triggers `/api/tutor/feedback` → analyze with Groq → JSON feedback panel:
  - Grammar score (0-100) + accuracy %
  - Strengths bullet list
  - Corrections list (original → corrected + rule explanation)
  - Recommendation sentence
  - XP earned banner
- **Loading screen**: between End and Feedback — "Analysing your session…" spinner

### 3.6 `/stories` — Stories library

**Purpose**: graded reading + listening.

Contains:

- **Header**: "Immersive Stories" + subtitle
- **3-column story card grid**:
  - Difficulty badge (A1/A2/B1/B2 — black on white pill or rose for advanced)
  - BookOpen icon top-right
  - Story title (`text-4xl font-bold italic serif`)
  - Description
  - Big rotating emoji on hover (e.g. ☕, 💼, 🚀)
  - Chapter count + circular Play arrow
- Stories per language: French 7 / Spanish 3 / English 3 (currently)

### 3.7 `/stories/[id]` — Story reader

- Header: back to library + chapter X of Y + Heart (save)
- Centered big emoji cover
- "Listen to Chapter" pill button (TTS playback)
- Story text: large serif italic, vocabulary words highlighted emerald-underlined — tappable to look up
- Chapter progress dots (emerald for done)
- "Next Chapter →" pill CTA
- **Quiz at end**: multiple choice questions → score → XP earned
- Tracks `StoryProgress.completed`, score, XP

### 3.8 `/writing` — Writing Lab

**Purpose**: AI critique of free writing or guided prompts.

3 tabs:

- **Check (default)**:
  - Big textarea (your sentence) + char count
  - "Check Grammar" emerald button → streams Groq feedback
  - Feedback panel with notes
- **Prompts**:
  - 6+ themed prompts per language (Introduce yourself, At the Restaurant, Describe your family, Daily routine, Last trip, Shopping list), beginner/intermediate badges
  - Tap prompt → enter writing view: prompt card + textarea + Show Hints (helpful phrases + useful words) + Submit for Critique
  - Feedback panel: huge letter grade (A-F), Key Strengths (emerald pills), Critical Edits (line-through original → emerald corrected + italic rule), Overall Feedback italic quote
  - Rewrite button to start fresh
- **History**: list of past writing sessions (date + prompt + level badge) → expand to see writing + feedback

### 3.9 `/dictionary` — Dictionary

**Purpose**: search target-language words and add to personal collection.

Contains:

- **Header**: "Omnilingual Dictionary" + subtitle
- **Big rounded search bar**: `text-2xl` input with Search icon, focus emerald
- **Empty state**: Library icon + "Type something to search the global database"
- **Result card**:
  - Huge word display (`text-6xl mono lowercase`)
  - Speaker button (TTS) + "Add to Collection" emerald button
  - Pronunciation in italic serif
  - 2-column grid: Translation + Usage Example
  - Related matches mini-cards
- Per-language word pools: ~100 words each (French/Spanish/English)

### 3.10 `/dictionary/[id]` — Word detail page

Full word view: word, translation, definition, example in target + English, mini-story, category, difficulty badge, save button.

### 3.11 `/my-words` — My Collection (Saved Words)

**Purpose**: personal vocabulary bank with spaced-repetition stats.

Contains:

- **Header**: "My Collection" + "Mastering N terms" subtitle, "Review History" + emerald "Smart Review" CTAs
- **3 stat cards**: Overall Mastery (% + progress bar), New Words this week, Next Session (next review time + overdue count)
- **Words list** (row layout):
  - Speaker icon (TTS) + word (lowercase mono) + translation + category badge
  - Mastery progress bar (emerald >80%, amber <80%) + mastery %
  - Level number
  - Delete + chevron details (hidden until hover)
- **Smart Review mode** (modal): cards flip through due words, you tap "Forgot / Hard / Good / Easy" → updates SM-2 spaced repetition (interval, ease, repetitions, nextReviewAt)

### 3.12 `/review` — Review / Practice (legacy)

Quiz-mode review of saved words. 3 modes: setup / quiz / result. Score celebration emoji at the end (😵/😬/😉/🤩 based on score).

### 3.13 `/pronunciation` — Pronunciation practice

- 30 beginner words from your target language
- Category filter
- Each word: emoji + word + translation + TTS playback button
- Mic button: records your speech via Web Speech API → compares with target → accuracy score
- Optional Voice Session save (transcript, score, duration, XP)

### 3.14 `/progress` — Progress page

**Purpose**: deep-dive on your stats.

Contains:

- Header: "Your Progress" + subtitle
- 2-column grid:
  - **Left (2-col span)**:
    - Weekly XP chart (`recharts` line/area) — last 7 days
    - Milestones Achieved grid (4-col, each `card-premium` with badge emoji + name + date)
  - **Right**:
    - Streak hero card: big Flame + "{N} Day Streak" serif italic + dot row M-T-W-T-F-S-S with amber for completed
    - Skill Breakdown: Vocabulary, Listening, Grammar, Writing progress bars
    - Estimated Level card: Target icon + level number

### 3.15 `/leaderboard` — Elite Leagues

**Purpose**: weekly competition ranking.

Contains:

- Header: "Elite Leagues" + avatar stack + league name (Gold, Diamond, etc.)
- **Filter pills**: Global / League / Friends
- **Top 3 Podium**: 3 cards with absolute rank medals (gold/silver/bronze), 1st place raised + emerald glow, each with avatar, name (serif italic), country, big mono XP
- **Rest of leaderboard table**: Rank / Learner (avatar + name + country) / Skill Level (B1 badge) / Weekly XP / Status (Promotion green, Stable gray, Demotion rose). Highlights current user row in emerald.

### 3.16 `/community` — Community feed

**Purpose**: social/discovery hub.

4-column grid:

- **Left**: Study Groups list, Live Practice card (LIVE badge + thumbnail + Join Room btn)
- **Main 2-col**: 
  - Compose card (avatar + textarea + post button)
  - Posts feed (each: gradient avatar + name + Expert badge + level + time + body text + Heart/MessageSquare/Share with counts)
- **Right**: Top Contributors list, Weekly Challenge card with Enter Challenge btn

### 3.17 `/community/[userId]` — Public profile

- Centered avatar block: gradient ring (emerald-to-blue) with initial inside, Camera hover button
- Big italic name + "Learner since {date} • Premium Member"
- 2-card row: Native Language + Targeting (flag + language name italic + change link)
- Account Information rows (Display Name, Email, Location, Timezone)

### 3.18 `/teacher` — Teacher dashboard (placeholder)

Currently "coming soon" page with planned features list. (To be replaced with: class management, assignments, student progress tracking, completion rates, send feedback.)

### 3.19 `/settings` — Settings + Profile combined

Contains:

- Profile hero: large avatar (emoji picker, 30 options) + display name + email + Joined date + role badge (STUDENT/TEACHER) + emerald "Premium" mark
- **Profile fields**: Display name (50 char), Native language picker (10), Target language flag-card picker (FR/ES/EN — bordered emerald when active with "✓ Selected" pill)
- **Stats overview**: 6 stat tiles — Level, Streak (days), Words, Stories done, Games played, XP. XP progress bar below.
- **Earned Badges** section with link to /progress
- **Quick navigation**: Progress, Analytics, Leaderboard, My Words
- **Danger Zone**: Delete account flow with confirm step

### 3.20 `/analytics` — Personal analytics (dynamic-imported)

- 4 stat cards (XP, level, games played, accuracy)
- Weekly chart
- Game category breakdown
- Time-spent stats
- Recently played list

---

## 4. Individual Games (25 games)

Each game route is `/games/{slug}`. All games:
- Award XP via `/api/games/score` on completion
- Use vocabulary from `Word` table filtered by `User.targetLanguage`
- Score 0-100 mapped to XP (40-50 max per game)
- Most have a results screen with Play Again / Back to Games

### Vocabulary (6)

1. **`/games/flashcards`** — **Flashcards** (A1, +20 XP). Flip cards, 4-option multiple choice. Front: target word + emoji + speaker button. Back: translation + example. Progress bar + 20-card session.
2. **`/games/true-false`** — **True or False** (A1, +20 XP). Show "{word} = {translation}" — is it right? Quick-fire judgment.
3. **`/games/matching`** — **Word Match** (A2, +30 XP). Two columns: tap matching target-word ↔ English pair against the clock.
4. **`/games/word-scramble`** — **Word Scramble** (A2, +25 XP). Letters scrambled, drag/tap to unscramble.
5. **`/games/speed-typing`** — **Speed Typing** (B1, +30 XP). See meaning, type the word as fast as possible.
6. **`/games/memory-palace`** — **Memory Palace** (B2, +50 XP). Place words in virtual room slots, recall via spatial memory.

### Grammar (6)

7. **`/games/fill-blank`** — **Fill the Blank** (A2, +25 XP). Sentence with blank, tap correct word from options.
8. **`/games/sentence-builder`** — **Sentence Builder** (B1, +30 XP). Tap word tiles in order to construct the correct sentence.
9. **`/games/dialog-adventure`** — **Dialog Adventure** (B1, +40 XP). Scenario-based dialog tree (café, train station, lost). Player picks responses, NPC reacts with emoji reaction.
10. **`/games/word-association`** — **Word Association** (A2, +35 XP). Tap all words related to a target word before timer expires.
11. **`/games/error-detective`** — **Error Detective** (B1, +35 XP). Find grammar mistake in a sentence and correct it.
12. **`/games/tense-challenge`** — **Tense Challenge** (B1, +35 XP). Rewrite a sentence in a different tense.

### Listening (6)

13. **`/games/immersion`** — **Immersion Room** (A2, +40 XP). 3D room (Three.js) — find object matching a voice command.
14. **`/games/listen-quiz`** — **Listen & Choose** (B1, +35 XP). Hear word via TTS, pick correct translation from 4.
15. **`/games/dictation`** — **Dictation** (A2, +35 XP). Listen to audio, type exact sentence (spelling + accents count).
16. **`/games/story-audio`** — **Story Audio** (B1, +35 XP). Listen to a short story, answer comprehension questions.
17. **`/games/speed-listening`** — **Speed Listening** (B2, +50 XP). Audio at 1.5× speed, comprehension challenge.
18. **`/games/accent-challenge`** — **Accent Challenge** (B1, +35 XP). Same word in 3 regional accents — identify it.

### Immersive (7)

19. **`/games/interview`** — **Job Interview** (B2, +40 XP). 3D interviewer (Three.js) — answer questions in target language. AI-generated questions via Groq.
20. **`/games/city-explorer`** — **City Explorer** (B2, +50 XP). 2D top-down RPG. WASD to walk, find NPCs around the map (cafe, market, restaurant, hotel, etc.), press E to talk, answer 3 vocab questions per NPC, clear all 5 to win.
21. **`/games/city-3d`** — **Word Blaster 3D** (C1, +60 XP). Neon 3D arena (Three.js), shoot the correct translation cube.
22. **`/games/airport`** — **Airport** (B1, +40 XP). Venue conversation tree: check-in agent, security, boarding. AI-generated via Groq with shuffled choices.
23. **`/games/doctor-office`** — **Doctor's Office** (B1, +40 XP). Describe symptoms, understand diagnosis, get prescription.
24. **`/games/market-bazaar`** — **Market Bazaar** (A2, +35 XP). Browse stalls, ask prices, haggle with vendors.
25. **`/games/hotel`** — **Hotel** (B1, +40 XP). Check in, order room service, handle requests.

**Venue games shared mechanics** (Airport / Doctor's Office / Market / Hotel / City Explorer):
- AI-generated 5-node conversation scenarios per playthrough (Groq)
- Static fallback content per language if AI fails
- 3 multiple-choice responses per NPC node (1 correct, server-shuffled)
- NPC reaction text after each choice
- XP scales: 90+ → 50 XP, 70+ → 35 XP, 50+ → 20 XP, else 10 XP

---

## 5. Admin pages (role: ADMIN)

### 5.1 `/admin` — Overview

- 12 stat cards: user count, locations, active today/week, total XP, AI interactions, games played, writing sessions, groups, student/teacher/admin counts
- Target language breakdown (FR/ES/EN counts)
- Recent users list (last 6)
- Recent games list
- Auto-refresh every 30s

### 5.2 `/admin/users` — User management

- Searchable user table
- Role assignment (STUDENT/TEACHER/ADMIN)
- Delete user
- View user progress

### 5.3 `/admin/groups` — Classroom groups

- All groups with invite codes
- Teacher + member counts

### 5.4 `/admin/locations` — User location map

- Geolocation data per user (lat, lng, city, country, accuracy)

### 5.5 `/admin/analytics` — Platform analytics

- Aggregate analytics across all users — XP distribution, language breakdown, retention chart

---

## 6. APIs (47 endpoints)

### Auth
- `POST /api/auth/register` — sign up
- `POST /api/auth/verify-otp` — OTP code check
- `[…nextauth]` — NextAuth handlers

### User
- `PATCH /api/user` — update name, avatar, languages
- `DELETE /api/user` — delete account
- `POST /api/user/location` — save geolocation
- `POST /api/user/spend-xp` — spend XP for features
- `POST /api/onboarding` — complete onboarding wizard
- `GET /api/progress` — current XP/level/streak/badges/skillTree

### Learning
- `POST /api/learn` — complete a lesson + score → XP
- `GET /api/daily-goals` — today's task progress
- `GET /api/stories/[id]` — story content + quizzes + saved status
- `POST /api/stories/[id]/progress` — submit quiz answers + completion

### Dictionary / Words
- `GET /api/dictionary/[id]` — word details
- `POST /api/dictionary/save` — save to collection
- `GET /api/my-words` — saved words list
- `DELETE /api/my-words/[id]` — remove from collection
- `POST /api/my-words/quiz-complete` — quiz result for SM-2 update
- `GET /api/review/words` — words due for review
- `POST /api/review/rate` — rate review difficulty (Forgot/Hard/Good/Easy)

### AI
- `POST /api/tutor` — streaming chat completion (Groq SSE)
- `POST /api/tutor/feedback` — end-session JSON analysis
- `POST /api/writing/feedback` — streaming writing critique
- `GET /api/writing/history` — past writing sessions
- `POST /api/pronunciation/tts` — ElevenLabs TTS audio synthesis

### Games
- `POST /api/games/score` — submit score, award XP
- `GET /api/games/airport` — AI-gen airport scenario
- `GET /api/games/doctor-office` — AI-gen doctor scenario
- `GET /api/games/hotel` — AI-gen hotel scenario
- `GET /api/games/market-bazaar` — AI-gen market scenario
- `GET /api/games/dictation` — AI-gen dictation
- `GET /api/games/word-association` — AI-gen word associations
- `GET /api/games/tense-challenge` — AI-gen tense rewrite
- `GET /api/games/error-detective` — AI-gen sentence with error
- `GET /api/games/accent-challenge` — TTS variations
- `GET /api/games/speed-listening` — AI-gen sped audio
- `GET /api/games/story-audio` — AI-gen audio story + questions

### Community / Classroom
- `GET /api/community/learners` — searchable learner directory
- `GET /api/community/monthly` — monthly leaderboard
- `GET /api/community/profile/[userId]` — public profile data
- `GET /api/teacher/classes` — teacher's groups
- `POST /api/teacher/assignments` — create assignment
- `POST /api/voice-session` — save voice session result

### Analytics / Admin
- `GET /api/analytics` — personal analytics
- `GET /api/admin/analytics` — platform analytics
- `GET /api/admin/users` — user list
- `PATCH /api/admin/users/[id]` — update user
- `DELETE /api/admin/users/[id]` — delete user
- `POST /api/admin/users/[id]/role` — change role
- `GET /api/admin/groups` — group list
- `GET /api/admin/locations` — locations map data

---

## 7. Content scale (current)

- **Vocabulary**: ~100 words × 3 languages = 300 in seeded dictionary (`Word` table); plus 350-line dictionary-words.ts pool
- **Stories**: French 7, English 3, Spanish 3 = 13 stories total (each with paragraphs + highlighted vocab + 4-6 comprehension quizzes)
- **Learning Path lessons**: 42 lesson IDs across French path; similar for ES/EN paths
- **Tutor scenarios**: 4 (Café / City / Class / Free Chat) × 3 target languages × 3 personas
- **Games**: 25 distinct games

---

## 8. Tech & integrations

- **Hosting**: Vercel (Fluid Compute)
- **Database**: PostgreSQL via Prisma
- **Auth**: NextAuth (Credentials + Google OAuth)
- **AI**: Groq `llama-3.3-70b-versatile` (chat, feedback, content gen) — SSE streaming
- **TTS**: ElevenLabs (voice mapping per language)
- **STT**: Browser Web Speech API
- **3D**: Three.js (City Explorer 3D, Job Interview, Word Blaster, Immersion Room)
- **Charts**: Recharts
- **Icons**: lucide-react
- **PWA**: manifest.webmanifest (installable, with shortcuts to Games + Review)
- **Fonts**: Inter (body), Cormorant Garamond italic (display), JetBrains Mono (numbers)

---

## 9. Things explicitly NOT yet built

- Teacher dashboard interior (page exists, content is "coming soon")
- Real-time voice chat with AI tutor (`VoiceSession` model reserved; only Web Speech browser TTS+STT shipped)
- Custom tutor scenarios (locked behind L20)
- Mastery tracking UI (locked behind L25)
- Real Community feed posts (currently mock data — backend in `/api/community/learners` returns real users though)
- Push notifications
- Friends / following system (data model not added)
- In-app purchases / subscriptions UI (settings shows "Premium Member" badge but no payment flow)
- Mobile app — currently a PWA only
