# Dictionary & My Words — Feature Plan

## Current state
- Words live in `Word` table (shared dictionary)
- `SavedWord` links user ↔ word with `masteryLevel` + `lastReviewed`
- Quiz pulls random saved words, no per-word stats, no exclusion control

---

## 1. Quiz word count — user chooses

**Where:** "Saved Words" / dictionary page, before quiz starts
**UI:** Slider or pill buttons: `5 · 10 · 20 · All`
**Default:** 10
**Filter:** Only words the user has saved (`SavedWord`)

---

## 2. Per-word stats

**DB change — add to `SavedWord`:**
```prisma
quizAttempts  Int  @default(0)   // total times this word appeared in quiz
quizCorrect   Int  @default(0)   // times answered correctly
```
Derived client-side: `accuracy = quizCorrect / quizAttempts`

**UI:** On each word card:
- Accuracy bar (green/yellow/red)
- "X / Y correct" label
- "Hard word" badge if accuracy < 40%

**API:** `PATCH /api/saved-words/[id]/stat` — increment attempts + correct

---

## 3. Include/exclude from next quiz

**DB change — add to `SavedWord`:**
```prisma
skipNextQuiz  Boolean  @default(false)
```

**UI:** Toggle on each word card — "✓ Include" / "⏭ Skip next quiz"
Auto-resets to `false` after the word appears in a quiz (so it comes back eventually)

**Logic:** Quiz builder filters `where: { skipNextQuiz: false }`

---

## 4. Core architecture (future-proof)

`SavedWord` becomes the central progress record per user per word:
```
SavedWord
  masteryLevel    0-5   (spaced repetition tier)
  quizAttempts    Int
  quizCorrect     Int
  skipNextQuiz    Boolean
  lastReviewed    DateTime
```
This powers:
- Spaced repetition (review words that are due)
- Streak / badge logic ("mastered 10 words")
- Teacher dashboard (see which words students struggle with)
- Export / progress report

---

## 5. Word practice — creative exercises

**New section: "Practice with Words"**
User selects N words from their saved list → chooses an exercise:

| Mode | What happens |
|------|-------------|
| **Sentence builder** | AI generates a French sentence using 1 selected word; user translates |
| **Fill-in-story** | AI writes a 3-sentence micro-story with blanks where the selected words go |
| **Describe it** | AI gives the English meaning; user types the French word (spelling check) |
| **Use it** | User types their own French sentence using the word; AI grades it |

**Tech:** Route `POST /api/practice/generate` — takes `{ words[], mode }`, calls AI (same pattern as `/api/tutor`), streams response.
**XP reward:** 5–15 XP per exercise depending on mode difficulty.

---

## Implementation order

1. DB migration — add `quizAttempts`, `quizCorrect`, `skipNextQuiz` to `SavedWord`
2. Quiz count picker UI
3. Per-word stat tracking (API + card display)
4. Skip toggle UI + quiz filter
5. Practice section (AI exercises)

---

## Files to touch

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add 3 fields to `SavedWord` |
| `app/api/saved-words/[id]/stat/route.ts` | New — increment stats |
| `app/(dashboard)/dictionary/page.tsx` | Quiz count picker, skip toggle, stat display |
| `app/api/practice/generate/route.ts` | New — AI exercise generator |
| `app/(dashboard)/practice/page.tsx` | New — practice UI |
