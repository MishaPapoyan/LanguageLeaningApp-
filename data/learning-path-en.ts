/**
 * English learning path — full lesson content for all topics in learning-path-en-meta.ts.
 * Mirrors the shape of `data/learning-path.ts` (French) and `data/learning-path-es.ts`.
 *
 * NOTE: The `fr` field in examples holds the English (target-language) text;
 * `en` holds the explanation/translation for the learner's reference.
 */

import type { Lesson, Topic } from "./learning-path";

export const LEARNING_PATH_EN: Topic[] = [
  // ── Phase 1: The Basics ─────────────────────────────────────────────────────
  {
    id: "alphabet",
    title: "The English Alphabet",
    description: "Learn all 26 letters and their English pronunciation",
    emoji: "🔤",
    lessons: [
      {
        id: "en-alphabet-1",
        title: "Letters A–M",
        titleFr: "Letters A–M",
        description: "The first half of the English alphabet",
        emoji: "🅰️",
        type: "alphabet",
        content: [
          {
            heading: "The English Alphabet — A to M",
            body: "English has 26 letters. Each letter has a name (how we say it in the alphabet) and a sound (how it appears in words). Let's start with the first 13.",
            examples: [
              { fr: "A", en: "ay — apple, ant" },
              { fr: "B", en: "bee — ball, book" },
              { fr: "C", en: "see — cat, car" },
              { fr: "D", en: "dee — dog, door" },
              { fr: "E", en: "ee — egg, elephant" },
              { fr: "F", en: "eff — fish, family" },
              { fr: "G", en: "jee — girl, go" },
              { fr: "H", en: "aitch — house, hello" },
              { fr: "I", en: "eye — ice, island" },
              { fr: "J", en: "jay — juice, jump" },
              { fr: "K", en: "kay — king, key" },
              { fr: "L", en: "ell — lion, love" },
              { fr: "M", en: "emm — moon, money" },
            ],
            tip: "In English every letter is pronounced in the alphabet name. 'H' is said 'aitch', not silent like in French.",
          },
          {
            heading: "Vowels & Consonants",
            body: "The letters A, E, I, O, U are called vowels. All other letters are consonants. Every English word needs at least one vowel.",
            examples: [
              { fr: "Vowels", en: "A, E, I, O, U" },
              { fr: "Consonants", en: "B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z" },
            ],
            tip: "The letter Y can sometimes act as a vowel — for example in the word 'gym' or 'sky'.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Which letter comes after D in the alphabet?",
            options: ["C", "E", "F", "B"],
            answer: "E",
          },
          {
            type: "multiple-choice",
            question: "Which of these is a vowel?",
            options: ["B", "M", "I", "K"],
            answer: "I",
          },
          {
            type: "multiple-choice",
            question: "How do you say the letter H in English?",
            options: ["aitch", "ah", "hah", "hay"],
            answer: "aitch",
          },
          {
            type: "fill-blank",
            question: "Fill in the missing letter: A, B, C, D, ___, F",
            answer: "E",
            hint: "It's a vowel",
          },
          {
            type: "multiple-choice",
            question: "Which letter starts the word 'juice'?",
            options: ["G", "J", "Y", "I"],
            answer: "J",
          },
        ],
      },
      {
        id: "en-alphabet-2",
        title: "Letters N–Z",
        titleFr: "Letters N–Z",
        description: "The second half of the English alphabet",
        emoji: "🇿",
        type: "alphabet",
        content: [
          {
            heading: "The English Alphabet — N to Z",
            body: "Now we complete the alphabet with the remaining 13 letters.",
            examples: [
              { fr: "N", en: "en — night, name" },
              { fr: "O", en: "oh — open, orange" },
              { fr: "P", en: "pee — park, people" },
              { fr: "Q", en: "cue — queen, quiet" },
              { fr: "R", en: "ar — road, rain" },
              { fr: "S", en: "ess — sun, school" },
              { fr: "T", en: "tee — tree, time" },
              { fr: "U", en: "you — umbrella, under" },
              { fr: "V", en: "vee — voice, video" },
              { fr: "W", en: "double-you — water, world" },
              { fr: "X", en: "ex — box, fox" },
              { fr: "Y", en: "why — year, yellow" },
              { fr: "Z", en: "zee (US) / zed (UK) — zero, zoo" },
            ],
            tip: "Q is almost always followed by U in English words: queen, question, quiet, quiz.",
          },
          {
            heading: "Capital and Small Letters",
            body: "Every letter has two forms: uppercase (capital) and lowercase (small). You use capitals at the start of sentences and for names.",
            examples: [
              { fr: "My name is Anna.", en: "Capital M at the start; capital A for the name" },
              { fr: "She lives in New York.", en: "Capital S at the start; capitals N and Y for the proper name" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Which letter always comes with U in English words?",
            options: ["Z", "Q", "X", "W"],
            answer: "Q",
          },
          {
            type: "multiple-choice",
            question: "What is the last letter of the English alphabet?",
            options: ["Y", "X", "W", "Z"],
            answer: "Z",
          },
          {
            type: "fill-blank",
            question: "Fill in the missing letter: R, S, T, ___, V",
            answer: "U",
            hint: "It's a vowel between T and V",
          },
          {
            type: "multiple-choice",
            question: "Which letter starts the word 'world'?",
            options: ["V", "W", "U", "Y"],
            answer: "W",
          },
          {
            type: "multiple-choice",
            question: "Which of these sentences is correctly capitalised?",
            options: ["my name is tom.", "My name is Tom.", "my Name is tom.", "My name is tom."],
            answer: "My name is Tom.",
          },
        ],
      },
    ],
  },

  // ── PRONUNCIATION ───────────────────────────────────────────────────────────
  {
    id: "pronunciation",
    title: "English Sounds & Phonics",
    description: "Master the core sounds of English",
    emoji: "🔊",
    lessons: [
      {
        id: "en-sounds-vowels",
        title: "Short & Long Vowels",
        titleFr: "Short & Long Vowels",
        description: "Learn how vowels change their sound",
        emoji: "🗣️",
        type: "pronunciation",
        content: [
          {
            heading: "Short Vowel Sounds",
            body: "Each vowel has a short sound, used when the vowel is followed by a consonant in a short word.",
            examples: [
              { fr: "A — cat, man, bag", en: "short 'a' sounds like 'æ'" },
              { fr: "E — bed, red, ten", en: "short 'e' sounds like 'eh'" },
              { fr: "I — big, sit, pin", en: "short 'i' sounds like 'ih'" },
              { fr: "O — dog, hot, box", en: "short 'o' sounds like 'oh'" },
              { fr: "U — cup, bus, mud", en: "short 'u' sounds like 'uh'" },
            ],
          },
          {
            heading: "Long Vowel Sounds",
            body: "Long vowels 'say their name'. They often appear when a word ends in a silent E (magic E rule).",
            examples: [
              { fr: "A — cake, name, late", en: "long 'a' — the vowel says 'ay'" },
              { fr: "E — theme, these, eve", en: "long 'e' — the vowel says 'ee'" },
              { fr: "I — bike, time, fine", en: "long 'i' — the vowel says 'eye'" },
              { fr: "O — home, note, hope", en: "long 'o' — the vowel says 'oh'" },
              { fr: "U — cube, tune, cute", en: "long 'u' — the vowel says 'you'" },
            ],
            tip: "Magic E rule: add a silent E at the end and the vowel becomes long. 'cap' → 'cape', 'pin' → 'pine', 'hop' → 'hope'.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "The word 'cake' has which type of vowel sound?",
            options: ["Short A", "Long A", "Short E", "Long E"],
            answer: "Long A",
          },
          {
            type: "multiple-choice",
            question: "Which word has a short vowel sound?",
            options: ["bike", "home", "cup", "tune"],
            answer: "cup",
          },
          {
            type: "multiple-choice",
            question: "Adding a silent E to 'pin' makes it...",
            options: ["pane", "pine", "pone", "pune"],
            answer: "pine",
          },
          {
            type: "multiple-choice",
            question: "The word 'red' has which short vowel sound?",
            options: ["A", "I", "E", "O"],
            answer: "E",
          },
          {
            type: "fill-blank",
            question: "The word 'c_pe' has a long A sound. What is the missing letter?",
            answer: "a",
            hint: "It's a vowel that says its own name",
          },
        ],
      },
      {
        id: "en-sounds-consonants",
        title: "Tricky Consonant Rules",
        titleFr: "Tricky Consonant Rules",
        description: "Silent letters, CH, SH, TH and more",
        emoji: "🤫",
        type: "pronunciation",
        content: [
          {
            heading: "Consonant Digraphs",
            body: "A digraph is two letters that make one sound together.",
            examples: [
              { fr: "SH — ship, shop, fish", en: "'sh' sound as in 'shh'" },
              { fr: "CH — chair, cheese, much", en: "'ch' sound as in 'choo-choo'" },
              { fr: "TH — the, this, think", en: "two sounds: voiced (the, this) and voiceless (think, bath)" },
              { fr: "WH — where, when, what", en: "usually sounds like 'w'" },
              { fr: "PH — phone, photo", en: "sounds like 'f'" },
            ],
          },
          {
            heading: "Silent Letters",
            body: "Some letters in English words are not pronounced at all.",
            examples: [
              { fr: "knife, know, knock", en: "silent K before N" },
              { fr: "write, wrong, wrap", en: "silent W before R" },
              { fr: "lamb, climb, comb", en: "silent B after M" },
              { fr: "castle, listen, whistle", en: "silent T in some words" },
            ],
            tip: "When you see 'kn' at the start of a word, only say the 'n'. 'Know' sounds just like 'no'.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "What sound do the letters 'SH' make together?",
            options: ["ss + hh", "s", "sh (as in ship)", "ks"],
            answer: "sh (as in ship)",
          },
          {
            type: "multiple-choice",
            question: "The word 'knife' — which letter is silent?",
            options: ["N", "I", "F", "K"],
            answer: "K",
          },
          {
            type: "multiple-choice",
            question: "'PH' in 'phone' makes the sound of which letter?",
            options: ["P", "H", "F", "B"],
            answer: "F",
          },
          {
            type: "multiple-choice",
            question: "Which word contains a silent B?",
            options: ["build", "lamb", "table", "club"],
            answer: "lamb",
          },
          {
            type: "fill-blank",
            question: "The word '___ite' meaning to compose text is 'write'. Which first letter is silent?",
            answer: "W",
            hint: "It's the letter that comes before R",
          },
        ],
      },
    ],
  },

  // ── GREETINGS ───────────────────────────────────────────────────────────────
  {
    id: "greetings",
    title: "Greetings & Introductions",
    description: "Learn how to say hello and introduce yourself",
    emoji: "👋",
    lessons: [
      {
        id: "en-greetings-hello",
        title: "Saying Hello & Goodbye",
        titleFr: "Saying Hello & Goodbye",
        description: "Essential greetings for any situation",
        emoji: "👋",
        type: "conversation",
        content: [
          {
            heading: "Greetings",
            body: "English has many ways to greet people depending on the time of day and how formal the situation is.",
            examples: [
              { fr: "Hello", en: "universal, neutral greeting" },
              { fr: "Hi", en: "informal, friendly" },
              { fr: "Hey", en: "very casual, with friends" },
              { fr: "Good morning", en: "from wake-up until about noon" },
              { fr: "Good afternoon", en: "noon until about 6 pm" },
              { fr: "Good evening", en: "6 pm until bedtime" },
            ],
          },
          {
            heading: "Saying Goodbye",
            body: "Here are the most common ways to end a conversation.",
            examples: [
              { fr: "Goodbye / Bye", en: "standard farewell" },
              { fr: "See you later", en: "casual, when you'll meet again" },
              { fr: "See you tomorrow", en: "when you'll meet the next day" },
              { fr: "Take care", en: "warm farewell to someone you care about" },
              { fr: "Good night", en: "when someone is going to sleep" },
            ],
            tip: "'Good night' is only used as a goodbye — never to greet someone at night. To greet in the evening, say 'Good evening'.",
          },
          {
            heading: "How Are You?",
            body: "After greeting someone it's polite to ask how they are.",
            examples: [
              { fr: "How are you?", en: "formal / standard" },
              { fr: "How are you doing?", en: "slightly informal" },
              { fr: "How's it going?", en: "casual" },
              { fr: "What's up?", en: "very casual" },
              { fr: "I'm fine, thank you.", en: "common reply" },
              { fr: "I'm doing well, thanks.", en: "slightly formal reply" },
              { fr: "Not bad!", en: "casual positive reply" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Which greeting is used in the morning?",
            options: ["Good evening", "Good night", "Good morning", "Good afternoon"],
            answer: "Good morning",
          },
          {
            type: "multiple-choice",
            question: "What does 'See you later' mean?",
            options: ["I will watch you later", "Goodbye, we'll meet again", "Look at me again", "I'm going later"],
            answer: "Goodbye, we'll meet again",
          },
          {
            type: "multiple-choice",
            question: "Which is the most casual greeting?",
            options: ["Good morning", "Hello", "Hey", "Good evening"],
            answer: "Hey",
          },
          {
            type: "translate",
            question: "Translate: 'Добрый вечер' / 'Bonsoir' → English",
            answer: "Good evening",
            hint: "Use it from 6pm onwards",
          },
          {
            type: "multiple-choice",
            question: "Someone says 'How are you?' — what is a common reply?",
            options: ["Good night", "I'm fine, thank you", "See you later", "Good morning"],
            answer: "I'm fine, thank you",
          },
        ],
      },
      {
        id: "en-greetings-intro",
        title: "Introducing Yourself",
        titleFr: "Introducing Yourself",
        description: "Tell people your name, where you're from, and what you do",
        emoji: "🙋",
        type: "conversation",
        content: [
          {
            heading: "Your Name",
            body: "The simplest way to introduce yourself in English.",
            examples: [
              { fr: "My name is Alex.", en: "formal / standard" },
              { fr: "I'm Alex.", en: "casual and very common" },
              { fr: "Nice to meet you.", en: "said after learning someone's name" },
              { fr: "Nice to meet you too.", en: "the reply to 'nice to meet you'" },
            ],
          },
          {
            heading: "Where You're From",
            body: "Talking about your country or city.",
            examples: [
              { fr: "I'm from Armenia.", en: "home country" },
              { fr: "I live in Yerevan.", en: "current city" },
              { fr: "I'm originally from Russia.", en: "birthplace, now living elsewhere" },
              { fr: "Where are you from?", en: "asking someone's origin" },
            ],
          },
          {
            heading: "What You Do",
            body: "Talking about your job or studies.",
            examples: [
              { fr: "I'm a student.", en: "currently studying" },
              { fr: "I work as a teacher.", en: "job title" },
              { fr: "I'm an engineer.", en: "profession" },
              { fr: "What do you do?", en: "asking about someone's job" },
            ],
            tip: "Use 'a' before a consonant sound: 'a teacher', 'a student'. Use 'an' before a vowel sound: 'an engineer', 'an actor'.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "How do you say your name casually in English?",
            options: ["I call myself Alex.", "My name is being Alex.", "I'm Alex.", "Call me be Alex."],
            answer: "I'm Alex.",
          },
          {
            type: "fill-blank",
            question: "Complete: 'Nice to meet ___.'",
            answer: "you",
            hint: "A small pronoun",
          },
          {
            type: "multiple-choice",
            question: "Which sentence correctly says where you are from?",
            options: ["I from France.", "I am from France.", "Me from France.", "From France I."],
            answer: "I am from France.",
          },
          {
            type: "multiple-choice",
            question: "'What do you do?' — what is this question asking about?",
            options: ["Your hobbies", "Your current action", "Your job or studies", "Your name"],
            answer: "Your job or studies",
          },
          {
            type: "multiple-choice",
            question: "Which is correct? 'I'm ___ engineer.'",
            options: ["a", "an", "the", "—"],
            answer: "an",
          },
        ],
      },
    ],
  },

  // ── NUMBERS ─────────────────────────────────────────────────────────────────
  {
    id: "numbers",
    title: "Numbers & Counting",
    description: "Count and use numbers in everyday English",
    emoji: "🔢",
    lessons: [
      {
        id: "en-numbers-1-20",
        title: "Numbers 1–20",
        titleFr: "Numbers 1–20",
        description: "Learn to say and write numbers 1 to 20",
        emoji: "1️⃣",
        type: "vocabulary",
        content: [
          {
            heading: "Numbers 1–10",
            body: "The first ten numbers are unique words — you must memorise each one.",
            examples: [
              { fr: "1 — one", en: "wun" },
              { fr: "2 — two", en: "too" },
              { fr: "3 — three", en: "three" },
              { fr: "4 — four", en: "for" },
              { fr: "5 — five", en: "fyve" },
              { fr: "6 — six", en: "siks" },
              { fr: "7 — seven", en: "SEV-en" },
              { fr: "8 — eight", en: "ayt" },
              { fr: "9 — nine", en: "nyn" },
              { fr: "10 — ten", en: "ten" },
            ],
          },
          {
            heading: "Numbers 11–20",
            body: "These numbers are also irregular. Pay attention to 'eleven' and 'twelve' — they don't follow a pattern.",
            examples: [
              { fr: "11 — eleven", en: "e-LEV-en" },
              { fr: "12 — twelve", en: "twelv" },
              { fr: "13 — thirteen", en: "thir-TEEN" },
              { fr: "14 — fourteen", en: "for-TEEN" },
              { fr: "15 — fifteen", en: "fif-TEEN" },
              { fr: "16 — sixteen", en: "siks-TEEN" },
              { fr: "17 — seventeen", en: "sev-en-TEEN" },
              { fr: "18 — eighteen", en: "ay-TEEN" },
              { fr: "19 — nineteen", en: "nyn-TEEN" },
              { fr: "20 — twenty", en: "TWEN-tee" },
            ],
            tip: "Numbers 13–19 all end in '-teen'. The stress is on the last syllable: thir-TEEN, four-TEEN.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "How do you write the number 'fifteen' in digits?",
            options: ["5", "50", "15", "51"],
            answer: "15",
          },
          {
            type: "multiple-choice",
            question: "Which number comes after 'eleven'?",
            options: ["ten", "thirteen", "twelve", "twenty"],
            answer: "twelve",
          },
          {
            type: "fill-blank",
            question: "Write out the number 8 in words.",
            answer: "eight",
            hint: "Sounds like 'ate'",
          },
          {
            type: "multiple-choice",
            question: "What is 'seventeen' in digits?",
            options: ["7", "70", "17", "71"],
            answer: "17",
          },
          {
            type: "translate",
            question: "Write out the number 13 in English words.",
            answer: "thirteen",
            hint: "Ends in -teen",
          },
        ],
      },
      {
        id: "en-numbers-21-100",
        title: "Numbers 21–100",
        titleFr: "Numbers 21–100",
        description: "Tens, compound numbers, and 100",
        emoji: "💯",
        type: "vocabulary",
        content: [
          {
            heading: "The Tens",
            body: "Learn the multiples of 10 from 20 to 100.",
            examples: [
              { fr: "20 — twenty", en: "TWEN-tee" },
              { fr: "30 — thirty", en: "THUR-tee" },
              { fr: "40 — forty", en: "FOR-tee (no 'u'!)" },
              { fr: "50 — fifty", en: "FIF-tee" },
              { fr: "60 — sixty", en: "SIK-stee" },
              { fr: "70 — seventy", en: "SEV-en-tee" },
              { fr: "80 — eighty", en: "AY-tee" },
              { fr: "90 — ninety", en: "NYN-tee" },
              { fr: "100 — one hundred", en: "wun HUN-dred" },
            ],
            tip: "Note: 'forty' has no U — it is NOT 'fourty'. This is one of the most common spelling mistakes in English.",
          },
          {
            heading: "Compound Numbers",
            body: "For numbers between the tens, combine the ten + the unit with a hyphen.",
            examples: [
              { fr: "21 — twenty-one", en: "twenty + hyphen + one" },
              { fr: "35 — thirty-five", en: "thirty + hyphen + five" },
              { fr: "47 — forty-seven", en: "forty + hyphen + seven" },
              { fr: "99 — ninety-nine", en: "ninety + hyphen + nine" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "How do you spell 40 in English?",
            options: ["fourty", "forty", "fourtee", "fortie"],
            answer: "forty",
          },
          {
            type: "fill-blank",
            question: "Write out the number 35 in words.",
            answer: "thirty-five",
            hint: "Tens + hyphen + unit",
          },
          {
            type: "multiple-choice",
            question: "What is 'eighty' in digits?",
            options: ["18", "8", "80", "88"],
            answer: "80",
          },
          {
            type: "multiple-choice",
            question: "Which number comes between sixty and eighty?",
            options: ["fifty", "seventy", "ninety", "forty"],
            answer: "seventy",
          },
          {
            type: "translate",
            question: "Write out 100 in English words.",
            answer: "one hundred",
            hint: "Two words",
          },
        ],
      },
    ],
  },

  // ── ESSENTIALS ──────────────────────────────────────────────────────────────
  {
    id: "essentials",
    title: "Survival Phrases",
    description: "Must-know phrases for any situation",
    emoji: "🆘",
    lessons: [
      {
        id: "en-essentials",
        title: "Must-Know Phrases",
        titleFr: "Must-Know Phrases",
        description: "Phrases you'll need in real life right away",
        emoji: "🆘",
        type: "conversation",
        content: [
          {
            heading: "Polite Expressions",
            body: "These phrases will help you in almost every situation.",
            examples: [
              { fr: "Please", en: "used when making a request" },
              { fr: "Thank you / Thanks", en: "expressing gratitude" },
              { fr: "You're welcome", en: "reply to 'thank you'" },
              { fr: "Excuse me", en: "to get someone's attention or pass by" },
              { fr: "Sorry / I'm sorry", en: "to apologise" },
              { fr: "No problem", en: "reply to 'sorry' or 'thank you'" },
            ],
          },
          {
            heading: "Asking for Help",
            body: "Essential phrases when you need assistance.",
            examples: [
              { fr: "Can you help me?", en: "general request for help" },
              { fr: "I don't understand.", en: "when you don't follow" },
              { fr: "Can you repeat that?", en: "ask to hear something again" },
              { fr: "Can you speak more slowly?", en: "ask for slower speech" },
              { fr: "What does ___ mean?", en: "asking for a word's meaning" },
              { fr: "How do you say ___ in English?", en: "asking for a translation" },
            ],
          },
          {
            heading: "Basic Answers",
            body: "Simple affirmative and negative responses.",
            examples: [
              { fr: "Yes", en: "affirmative" },
              { fr: "No", en: "negative" },
              { fr: "Maybe", en: "uncertain" },
              { fr: "Of course!", en: "enthusiastic yes" },
              { fr: "I think so.", en: "probably yes" },
              { fr: "I don't know.", en: "you are uncertain" },
            ],
            tip: "In informal English 'Yeah' replaces 'Yes' and 'Nah' or 'Nope' replaces 'No'.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Someone says 'Thank you.' What do you reply?",
            options: ["Sorry", "Excuse me", "You're welcome", "Please"],
            answer: "You're welcome",
          },
          {
            type: "multiple-choice",
            question: "You want someone to speak more slowly. What do you say?",
            options: ["Can you repeat that?", "Can you speak more slowly?", "I don't know.", "Excuse me."],
            answer: "Can you speak more slowly?",
          },
          {
            type: "multiple-choice",
            question: "'Excuse me' is used to...",
            options: ["Say goodbye", "Get someone's attention", "Say thank you", "Ask for help"],
            answer: "Get someone's attention",
          },
          {
            type: "fill-blank",
            question: "Fill in: 'I ___ understand.' (when you don't follow)",
            answer: "don't",
            hint: "Negative helper verb",
          },
          {
            type: "multiple-choice",
            question: "Which phrase asks for the meaning of a word?",
            options: ["Can you help me?", "What does it mean?", "How do you say it?", "I don't know."],
            answer: "What does it mean?",
          },
        ],
      },
    ],
  },

  // ── Phase 2: Core Grammar ────────────────────────────────────────────────────

  // ── ARTICLES ────────────────────────────────────────────────────────────────
  {
    id: "articles",
    title: "Articles — A, An & The",
    description: "When and how to use English articles",
    emoji: "📎",
    lessons: [
      {
        id: "en-articles-indefinite",
        title: "A and An",
        titleFr: "A and An",
        description: "Indefinite articles — introducing something for the first time",
        emoji: "📎",
        type: "grammar",
        content: [
          {
            heading: "What are A and An?",
            body: "A and An are indefinite articles. You use them when you mention something for the first time, or when you don't need to specify which one.",
            examples: [
              { fr: "I have a dog.", en: "any dog, not a specific one" },
              { fr: "She is a teacher.", en: "her profession" },
              { fr: "I saw an elephant.", en: "'an' before a vowel sound" },
            ],
          },
          {
            heading: "A vs An",
            body: "Use 'A' before consonant sounds. Use 'AN' before vowel sounds (a, e, i, o, u).",
            table: {
              columns: ["Use A", "Use AN"],
              rows: [
                ["a book", "an apple"],
                ["a car", "an egg"],
                ["a university (yoo-sound)", "an umbrella"],
                ["a hotel (h-sound)", "an hour (silent h → vowel sound)"],
              ],
            },
            tip: "It's about the SOUND, not the letter. 'University' starts with a 'y' sound so we say 'a university'. 'Hour' starts with a vowel sound so we say 'an hour'.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Choose the correct article: '___ apple a day keeps the doctor away.'",
            options: ["A", "An", "The", "—"],
            answer: "An",
          },
          {
            type: "multiple-choice",
            question: "Choose the correct article: 'She drives ___ car.'",
            options: ["a", "an", "the", "—"],
            answer: "a",
          },
          {
            type: "multiple-choice",
            question: "Which is correct: '___ hour' or '___ hour'?",
            options: ["a hour", "an hour", "the hour", "— hour"],
            answer: "an hour",
          },
          {
            type: "fill-blank",
            question: "Fill in: 'He is ___ engineer.' (A or An?)",
            answer: "an",
            hint: "Engineer starts with a vowel sound",
          },
          {
            type: "multiple-choice",
            question: "Which sentence is correct?",
            options: ["I saw a elephant.", "I saw an elephant.", "I saw the elephant.", "I saw elephant."],
            answer: "I saw an elephant.",
          },
        ],
      },
      {
        id: "en-articles-definite",
        title: "The — when to use it",
        titleFr: "The — when to use it",
        description: "The definite article for specific things",
        emoji: "🔘",
        type: "grammar",
        content: [
          {
            heading: "What is THE?",
            body: "'The' is the definite article. You use it when both speaker and listener know exactly which thing is being talked about — a specific one.",
            examples: [
              { fr: "Pass me the salt.", en: "the salt on this table, the specific one" },
              { fr: "The sun is bright today.", en: "there is only one sun" },
              { fr: "I loved the movie.", en: "the movie we both watched" },
            ],
          },
          {
            heading: "First mention vs Second mention",
            body: "Use 'a/an' the first time you mention something. Use 'the' the second time.",
            examples: [
              { fr: "I bought a book. The book was interesting.", en: "first: a book → second: the book" },
              { fr: "She has a cat. The cat is black.", en: "first: a cat → second: the cat" },
            ],
          },
          {
            heading: "When NOT to use THE",
            body: "Don't use 'the' with general plural nouns, languages, sports, meals, or most proper names.",
            examples: [
              { fr: "I love dogs. (not 'the dogs')", en: "dogs in general" },
              { fr: "She speaks Spanish. (not 'the Spanish')", en: "a language" },
              { fr: "He plays football. (not 'the football')", en: "a sport" },
              { fr: "We eat dinner at 7. (not 'the dinner')", en: "regular meals" },
            ],
            tip: "BUT we say 'the Internet', 'the news', 'the cinema' — these are fixed expressions you must memorise.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Fill in: 'I have a dog. ___ dog is very friendly.'",
            options: ["A", "An", "The", "—"],
            answer: "The",
          },
          {
            type: "multiple-choice",
            question: "Which sentence is correct?",
            options: ["I love the music in general.", "I love music.", "I love a music.", "I love musics."],
            answer: "I love music.",
          },
          {
            type: "multiple-choice",
            question: "Fill in: '___ sun rises in the east.'",
            options: ["A", "An", "The", "—"],
            answer: "The",
          },
          {
            type: "fill-blank",
            question: "Fill in: 'She speaks ___ French.' (article or no article?)",
            answer: "—",
            hint: "Languages don't use 'the'",
          },
          {
            type: "multiple-choice",
            question: "Which is correct?",
            options: ["He plays the football.", "He plays a football.", "He plays football.", "He plays footballs."],
            answer: "He plays football.",
          },
        ],
      },
    ],
  },

  // ── PRONOUNS & TO BE ────────────────────────────────────────────────────────
  {
    id: "pronouns-be",
    title: "Pronouns & To Be",
    description: "Subject pronouns and the verb to be",
    emoji: "👤",
    lessons: [
      {
        id: "en-pronouns-subject",
        title: "Subject Pronouns (I, You, He…)",
        titleFr: "Subject Pronouns",
        description: "Learn the pronouns used as the subject of a sentence",
        emoji: "👤",
        type: "grammar",
        content: [
          {
            heading: "English Subject Pronouns",
            body: "Subject pronouns replace the name of the person doing the action.",
            table: {
              columns: ["Pronoun", "Meaning", "Example"],
              rows: [
                ["I", "me (the speaker)", "I am happy."],
                ["you", "the person you're talking to", "You are smart."],
                ["he", "a man or boy", "He works here."],
                ["she", "a woman or girl", "She loves music."],
                ["it", "a thing, animal, or idea", "It is cold."],
                ["we", "me and others", "We are friends."],
                ["they", "other people / things", "They live in Paris."],
              ],
            },
            tip: "'You' is the same whether you're talking to one person or many. English doesn't have a formal 'you' — context makes it polite.",
          },
          {
            heading: "I is Always Capital",
            body: "In English the pronoun I is always written as a capital letter, wherever it appears in a sentence.",
            examples: [
              { fr: "I think so.", en: "correct" },
              { fr: "Yesterday i went home.", en: "WRONG — i must be I" },
              { fr: "Can I help you?", en: "correct" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Replace 'Maria' with a pronoun: 'Maria is a doctor.'",
            options: ["He", "It", "She", "We"],
            answer: "She",
          },
          {
            type: "multiple-choice",
            question: "Replace 'Tom and I' with a pronoun: 'Tom and I are students.'",
            options: ["They", "We", "You", "He"],
            answer: "We",
          },
          {
            type: "fill-blank",
            question: "The dog is hungry. ___ wants food.",
            answer: "It",
            hint: "Use 'it' for animals when the gender is not specified",
          },
          {
            type: "multiple-choice",
            question: "Which sentence is correctly written?",
            options: ["i love this city.", "I love this city.", "i Love this city.", "I Love This City."],
            answer: "I love this city.",
          },
          {
            type: "multiple-choice",
            question: "Replace 'my friends' with a pronoun: 'My friends are coming.'",
            options: ["We", "It", "She", "They"],
            answer: "They",
          },
        ],
      },
      {
        id: "en-verb-be",
        title: "The Verb To Be",
        titleFr: "The Verb To Be",
        description: "Am, is, are — the most important verb in English",
        emoji: "✨",
        type: "grammar",
        content: [
          {
            heading: "To Be — Present Tense",
            body: "The verb 'to be' changes its form depending on the subject. It has three forms in the present tense: am, is, are.",
            table: {
              columns: ["Subject", "Full form", "Contraction"],
              rows: [
                ["I", "I am", "I'm"],
                ["You", "You are", "You're"],
                ["He / She / It", "He is / She is / It is", "He's / She's / It's"],
                ["We", "We are", "We're"],
                ["They", "They are", "They're"],
              ],
            },
          },
          {
            heading: "Using To Be",
            body: "Use 'to be' for names, jobs, descriptions, nationality and location.",
            examples: [
              { fr: "I am Alex.", en: "name" },
              { fr: "She is a nurse.", en: "job" },
              { fr: "They are tired.", en: "feeling / description" },
              { fr: "We are from Spain.", en: "origin" },
              { fr: "It is cold today.", en: "weather" },
            ],
            tip: "Contractions (I'm, you're, he's…) are used in everyday speech. In formal writing always use the full form.",
          },
          {
            heading: "Negative Form",
            body: "To make 'to be' negative, add 'not' after the verb.",
            examples: [
              { fr: "I am not tired. / I'm not tired.", en: "negative" },
              { fr: "She is not at home. / She isn't at home.", en: "isn't = is not" },
              { fr: "They are not ready. / They aren't ready.", en: "aren't = are not" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Fill in: '___ a student.' (I)",
            options: ["I is", "I am", "I are", "I be"],
            answer: "I am",
          },
          {
            type: "multiple-choice",
            question: "Fill in: 'She ___ very happy today.'",
            options: ["am", "are", "is", "be"],
            answer: "is",
          },
          {
            type: "fill-blank",
            question: "Write the contraction: 'They are late.' → 'They___ late.'",
            answer: "They're",
            hint: "They + are = ?",
          },
          {
            type: "multiple-choice",
            question: "Make this negative: 'He is hungry.'",
            options: ["He not is hungry.", "He is not hungry.", "He are not hungry.", "He am not hungry."],
            answer: "He is not hungry.",
          },
          {
            type: "fill-blank",
            question: "Fill in: 'We ___ from France.' (are/is/am)",
            answer: "are",
            hint: "Which form of 'to be' goes with 'We'?",
          },
        ],
      },
    ],
  },

  // ── HAVE & DO ────────────────────────────────────────────────────────────────
  {
    id: "have-do",
    title: "Have & Do — Key Verbs",
    description: "Two of the most important verbs in English",
    emoji: "🤲",
    lessons: [
      {
        id: "en-verb-have",
        title: "To Have — conjugation & use",
        titleFr: "To Have",
        description: "Possession, relationships, and more with 'have'",
        emoji: "🤲",
        type: "grammar",
        content: [
          {
            heading: "To Have — Present Tense",
            body: "'Have' expresses possession, relationships, and experiences. The key rule: use 'has' with he, she, it.",
            table: {
              columns: ["Subject", "Form"],
              rows: [
                ["I", "have"],
                ["You", "have"],
                ["He / She / It", "has"],
                ["We", "have"],
                ["They", "have"],
              ],
            },
          },
          {
            heading: "Using Have / Has",
            body: "Common ways to use 'have' in sentences.",
            examples: [
              { fr: "I have a car.", en: "possession" },
              { fr: "She has two brothers.", en: "family relationship" },
              { fr: "We have a meeting at 3.", en: "scheduled event" },
              { fr: "Do you have a pen?", en: "question form" },
              { fr: "He doesn't have time.", en: "negative with 'doesn't'" },
            ],
            tip: "In British English, people often say 'I've got a car' instead of 'I have a car'. Both are correct.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Fill in: 'She ___ a beautiful voice.'",
            options: ["have", "has", "is", "are"],
            answer: "has",
          },
          {
            type: "multiple-choice",
            question: "Fill in: 'They ___ three children.'",
            options: ["has", "have", "is", "are"],
            answer: "have",
          },
          {
            type: "fill-blank",
            question: "Make this negative: 'He ___ (not) have a phone.'",
            answer: "doesn't",
            hint: "Use 'doesn't' for he/she/it negative",
          },
          {
            type: "multiple-choice",
            question: "Which is correct?",
            options: ["I has a dog.", "I have a dog.", "I is have a dog.", "I having a dog."],
            answer: "I have a dog.",
          },
          {
            type: "translate",
            question: "Translate: 'У меня есть сестра.' / 'J'ai une sœur.' → English",
            answer: "I have a sister",
            hint: "Subject + have/has + article + noun",
          },
        ],
      },
      {
        id: "en-verb-do",
        title: "To Do — as main & helper verb",
        titleFr: "To Do",
        description: "'Do' in questions, negatives and as a main verb",
        emoji: "🔧",
        type: "grammar",
        content: [
          {
            heading: "Do as a Helper Verb",
            body: "'Do' / 'Does' is used to make questions and negatives in the present simple.",
            table: {
              columns: ["Subject", "Questions", "Negatives"],
              rows: [
                ["I / You / We / They", "Do you...?", "I don't..."],
                ["He / She / It", "Does she...?", "She doesn't..."],
              ],
            },
          },
          {
            heading: "Making Questions with Do",
            body: "Put 'do/does' before the subject to turn a statement into a question.",
            examples: [
              { fr: "You like coffee. → Do you like coffee?", en: "statement → question" },
              { fr: "She works here. → Does she work here?", en: "he/she/it uses 'does'" },
              { fr: "They play tennis. → Do they play tennis?", en: "plural uses 'do'" },
            ],
            tip: "When you use 'does', the main verb loses its -s: 'She works' → 'Does she work?' (NOT 'Does she works?').",
          },
          {
            heading: "Do as a Main Verb",
            body: "'Do' can also be the main verb meaning to perform an action.",
            examples: [
              { fr: "I do my homework every day.", en: "main verb — perform" },
              { fr: "She does the dishes.", en: "do the dishes = wash them" },
              { fr: "What do you do for work?", en: "do = your job" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Turn into a question: 'She likes chocolate.'",
            options: ["Does she likes chocolate?", "Do she like chocolate?", "Does she like chocolate?", "Is she like chocolate?"],
            answer: "Does she like chocolate?",
          },
          {
            type: "multiple-choice",
            question: "Fill in: 'They ___ speak Russian.'",
            options: ["doesn't", "isn't", "don't", "aren't"],
            answer: "don't",
          },
          {
            type: "fill-blank",
            question: "Make a question: '___ you live in London?'",
            answer: "Do",
            hint: "Helper verb for I/you/we/they",
          },
          {
            type: "multiple-choice",
            question: "Which is correct?",
            options: ["Does he works here?", "Does he work here?", "Do he works here?", "Do he work here?"],
            answer: "Does he work here?",
          },
          {
            type: "multiple-choice",
            question: "'I ___ my homework every evening.'",
            options: ["make", "do", "am", "have"],
            answer: "do",
          },
        ],
      },
    ],
  },

  // ── PRESENT SIMPLE ──────────────────────────────────────────────────────────
  {
    id: "present-simple",
    title: "Present Simple Tense",
    description: "Talk about habits, routines and facts",
    emoji: "🏃",
    lessons: [
      {
        id: "en-present-simple",
        title: "Regular Verbs in Present",
        titleFr: "Present Simple",
        description: "Form and use of the present simple tense",
        emoji: "🏃",
        type: "grammar",
        content: [
          {
            heading: "Forming the Present Simple",
            body: "For most subjects, use the base verb. Add -s or -es for he, she, it.",
            table: {
              columns: ["Subject", "work", "go", "watch"],
              rows: [
                ["I", "work", "go", "watch"],
                ["You", "work", "go", "watch"],
                ["He / She / It", "works", "goes", "watches"],
                ["We", "work", "go", "watch"],
                ["They", "work", "go", "watch"],
              ],
            },
            tip: "Spelling rules for he/she/it: add -es after -ch, -sh, -s, -x, -z (watch→watches, go→goes). Change y→ies when y follows a consonant (study→studies).",
          },
          {
            heading: "When to Use Present Simple",
            body: "Use present simple for habits, routines, permanent facts, and schedules.",
            examples: [
              { fr: "She walks to work every day.", en: "daily routine" },
              { fr: "The Earth orbits the Sun.", en: "scientific fact" },
              { fr: "The train leaves at 8 am.", en: "timetable / schedule" },
              { fr: "I love coffee.", en: "permanent preference" },
            ],
          },
          {
            heading: "Common Time Expressions",
            body: "These words often appear with present simple.",
            examples: [
              { fr: "every day / every week", en: "how often something happens" },
              { fr: "always, usually, often, sometimes, rarely, never", en: "frequency adverbs" },
              { fr: "in the morning / at night", en: "time of day" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Which is correct for he/she/it?",
            options: ["She work.", "She works.", "She working.", "She is work."],
            answer: "She works.",
          },
          {
            type: "fill-blank",
            question: "He ___ (watch) TV every evening.",
            answer: "watches",
            hint: "Add -es after 'ch'",
          },
          {
            type: "multiple-choice",
            question: "Which sentence is in present simple?",
            options: ["She is eating now.", "They played yesterday.", "He drinks coffee every morning.", "We were tired."],
            answer: "He drinks coffee every morning.",
          },
          {
            type: "multiple-choice",
            question: "What is the correct form? 'She ___ (study) French.'",
            options: ["studys", "studies", "study", "studying"],
            answer: "studies",
          },
          {
            type: "fill-blank",
            question: "The sun ___ (rise) in the east.",
            answer: "rises",
            hint: "Add -s (scientific fact)",
          },
        ],
      },
    ],
  },

  // ── ADJECTIVES ──────────────────────────────────────────────────────────────
  {
    id: "adjectives",
    title: "Adjectives & Descriptions",
    description: "Describe people, places and things",
    emoji: "🎨",
    lessons: [
      {
        id: "en-adjectives",
        title: "Describing People & Things",
        titleFr: "Adjectives",
        description: "How to use adjectives in English",
        emoji: "🎨",
        type: "grammar",
        content: [
          {
            heading: "What are Adjectives?",
            body: "Adjectives are words that describe nouns (people, places, things). In English, adjectives come BEFORE the noun and never change their form.",
            examples: [
              { fr: "a big house", en: "big = adjective, house = noun" },
              { fr: "a beautiful day", en: "beautiful = adjective" },
              { fr: "two old cars", en: "old = adjective — no plural form" },
              { fr: "some hot coffee", en: "adjective stays the same for any noun" },
            ],
            tip: "Unlike French or Spanish, English adjectives never change. 'big house', 'big houses', 'big car' — 'big' is always the same.",
          },
          {
            heading: "Common Adjectives",
            body: "Useful adjectives to describe everyday things.",
            table: {
              columns: ["Adjective", "Opposite"],
              rows: [
                ["big / large", "small / little"],
                ["tall", "short"],
                ["fast", "slow"],
                ["hot", "cold"],
                ["new", "old"],
                ["easy", "difficult / hard"],
                ["beautiful", "ugly"],
                ["happy", "sad"],
              ],
            },
          },
          {
            heading: "Adjective Position",
            body: "Adjectives can go before a noun OR after 'to be'.",
            examples: [
              { fr: "It's a cold day.", en: "before the noun" },
              { fr: "The day is cold.", en: "after 'to be'" },
              { fr: "She is a smart woman.", en: "before the noun" },
              { fr: "She is smart.", en: "after 'to be'" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Where does the adjective go in English? 'I have a ___ dog.'",
            options: ["after the noun", "before the noun", "at the end", "before the verb"],
            answer: "before the noun",
          },
          {
            type: "multiple-choice",
            question: "Which sentence is correct?",
            options: ["She has hairs longs.", "She has long hairs.", "She has long hair.", "She has hair long."],
            answer: "She has long hair.",
          },
          {
            type: "fill-blank",
            question: "The opposite of 'easy' is ___.",
            answer: "difficult",
            hint: "Also called 'hard'",
          },
          {
            type: "multiple-choice",
            question: "Which is correct? 'They are ___ cars.' (2 cars, big)",
            options: ["They are bigs cars.", "They are big cars.", "They are cars big.", "They are a big cars."],
            answer: "They are big cars.",
          },
          {
            type: "translate",
            question: "Translate: 'Это красивый город.' / 'C'est une belle ville.' → English",
            answer: "It is a beautiful city",
            hint: "It is + article + adjective + noun",
          },
        ],
      },
    ],
  },

  // ── NEGATION ────────────────────────────────────────────────────────────────
  {
    id: "negation",
    title: "Negation — Saying No",
    description: "Form negative sentences correctly",
    emoji: "🚫",
    lessons: [
      {
        id: "en-negation",
        title: "Don't, Doesn't, Isn't…",
        titleFr: "Negation",
        description: "All the main ways to say no in English",
        emoji: "🚫",
        type: "grammar",
        content: [
          {
            heading: "Negating with Do Not / Does Not",
            body: "In the present simple, add 'do not' (don't) or 'does not' (doesn't) before the verb.",
            table: {
              columns: ["Subject", "Negative form"],
              rows: [
                ["I / You / We / They", "don't + verb"],
                ["He / She / It", "doesn't + verb"],
              ],
            },
            examples: [
              { fr: "I don't like spicy food.", en: "don't = do not" },
              { fr: "She doesn't speak German.", en: "doesn't = does not" },
              { fr: "They don't work on weekends.", en: "they → don't" },
            ],
          },
          {
            heading: "Negating To Be",
            body: "For sentences with 'to be', add 'not' directly after am/is/are.",
            examples: [
              { fr: "I am not ready. / I'm not ready.", en: "am not — no contraction for 'am not'" },
              { fr: "She isn't here. (= She is not here.)", en: "isn't" },
              { fr: "They aren't hungry. (= They are not hungry.)", en: "aren't" },
            ],
            tip: "'Amn't' does not exist in standard English. 'I'm not' is the only correct contraction for 'I am not'.",
          },
          {
            heading: "Other Negative Words",
            body: "These words also make a sentence negative without using 'not'.",
            examples: [
              { fr: "I never eat meat.", en: "never = not ever" },
              { fr: "Nobody called.", en: "nobody = not anyone" },
              { fr: "There is nothing in the fridge.", en: "nothing = not anything" },
            ],
            tip: "Do NOT use two negatives together: 'I don't have nothing' is WRONG. Say 'I don't have anything' or 'I have nothing'.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Make negative: 'She speaks French.'",
            options: ["She not speaks French.", "She doesn't speak French.", "She don't speak French.", "She isn't speak French."],
            answer: "She doesn't speak French.",
          },
          {
            type: "multiple-choice",
            question: "Make negative: 'They are tired.'",
            options: ["They don't tired.", "They isn't tired.", "They aren't tired.", "They not tired."],
            answer: "They aren't tired.",
          },
          {
            type: "fill-blank",
            question: "I ___ know the answer. (don't/doesn't)",
            answer: "don't",
            hint: "I → don't",
          },
          {
            type: "multiple-choice",
            question: "Which sentence is correct?",
            options: ["I don't have nothing.", "I have nothing.", "I not have anything.", "I haven't nothing."],
            answer: "I have nothing.",
          },
          {
            type: "fill-blank",
            question: "He ___ like coffee. (doesn't/don't)",
            answer: "doesn't",
            hint: "He → does not = doesn't",
          },
        ],
      },
    ],
  },

  // ── QUESTIONS ───────────────────────────────────────────────────────────────
  {
    id: "questions",
    title: "Asking Questions",
    description: "Form yes/no and wh-questions",
    emoji: "❓",
    lessons: [
      {
        id: "en-questions",
        title: "Wh-Questions & Yes/No",
        titleFr: "Questions",
        description: "All the main question types in English",
        emoji: "❓",
        type: "grammar",
        content: [
          {
            heading: "Yes / No Questions",
            body: "Invert the subject and the auxiliary verb (do/does, am/is/are) to make a yes/no question.",
            examples: [
              { fr: "Do you like pizza?", en: "Yes, I do. / No, I don't." },
              { fr: "Does she live here?", en: "Yes, she does. / No, she doesn't." },
              { fr: "Are they coming?", en: "Yes, they are. / No, they aren't." },
              { fr: "Is he a doctor?", en: "Yes, he is. / No, he isn't." },
            ],
          },
          {
            heading: "Wh-Question Words",
            body: "Use these question words to ask for specific information.",
            table: {
              columns: ["Word", "Asks about", "Example"],
              rows: [
                ["What", "thing / action", "What is your name?"],
                ["Who", "person", "Who is calling?"],
                ["Where", "place", "Where do you live?"],
                ["When", "time", "When does it start?"],
                ["Why", "reason", "Why are you late?"],
                ["How", "manner / method", "How do you spell that?"],
                ["Which", "choice", "Which colour do you prefer?"],
              ],
            },
          },
          {
            heading: "Wh-Question Structure",
            body: "Wh-word + auxiliary verb + subject + main verb",
            examples: [
              { fr: "Where do you work?", en: "where + do + you + work" },
              { fr: "What does she eat?", en: "what + does + she + eat" },
              { fr: "Why are they late?", en: "why + are + they + late" },
              { fr: "How old are you?", en: "how + old + are + you" },
            ],
            tip: "The main verb does NOT get -s in a wh-question: 'What does he do?' (NOT 'does he does').",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Which is a correct yes/no question?",
            options: ["She likes coffee?", "Does she likes coffee?", "Does she like coffee?", "Do she like coffee?"],
            answer: "Does she like coffee?",
          },
          {
            type: "multiple-choice",
            question: "What question word asks about a place?",
            options: ["When", "Why", "Who", "Where"],
            answer: "Where",
          },
          {
            type: "fill-blank",
            question: "___ do you live? (question word for place)",
            answer: "Where",
          },
          {
            type: "multiple-choice",
            question: "Form the question: '___ does he work?'",
            options: ["What", "Where", "Who", "Why"],
            answer: "Where",
          },
          {
            type: "fill-blank",
            question: "___ are you late? (asking for a reason)",
            answer: "Why",
            hint: "Reason question word",
          },
        ],
      },
    ],
  },

  // ── Phase 3: Real World ──────────────────────────────────────────────────────

  // ── FOOD & DRINKS ───────────────────────────────────────────────────────────
  {
    id: "food-drinks",
    title: "Food & Drinks",
    description: "Order food and talk about what you eat",
    emoji: "🍽️",
    lessons: [
      {
        id: "en-food",
        title: "Common Food & Restaurants",
        titleFr: "Food & Restaurants",
        description: "Vocabulary for eating and ordering",
        emoji: "🥐",
        type: "vocabulary",
        content: [
          {
            heading: "Common Food Items",
            body: "Essential food vocabulary you'll use every day.",
            examples: [
              { fr: "bread, rice, pasta", en: "staple carbohydrates" },
              { fr: "chicken, beef, fish", en: "common proteins" },
              { fr: "apple, banana, orange", en: "fruits" },
              { fr: "carrot, potato, tomato", en: "vegetables" },
              { fr: "water, juice, coffee, tea", en: "common drinks" },
              { fr: "milk, cheese, butter", en: "dairy" },
            ],
          },
          {
            heading: "In a Restaurant",
            body: "Useful phrases when eating out.",
            examples: [
              { fr: "A table for two, please.", en: "asking for a table" },
              { fr: "Can I see the menu?", en: "asking for the menu" },
              { fr: "I'd like the pasta, please.", en: "ordering — I'd like = I would like" },
              { fr: "What do you recommend?", en: "asking for a suggestion" },
              { fr: "The bill, please.", en: "asking for the check" },
              { fr: "Is service included?", en: "asking about the tip" },
            ],
            tip: "'I'd like' is more polite than 'I want' when ordering in a restaurant.",
          },
          {
            heading: "Likes & Dislikes",
            body: "Talking about food preferences.",
            examples: [
              { fr: "I love sushi.", en: "strong positive" },
              { fr: "I like pizza.", en: "positive" },
              { fr: "I don't mind spicy food.", en: "neutral / okay with it" },
              { fr: "I don't like mushrooms.", en: "negative" },
              { fr: "I can't stand broccoli.", en: "strong negative" },
              { fr: "I'm allergic to nuts.", en: "allergy" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Which is the polite way to order food?",
            options: ["I want the pasta.", "Give me the pasta.", "I'd like the pasta, please.", "Pasta for me."],
            answer: "I'd like the pasta, please.",
          },
          {
            type: "multiple-choice",
            question: "What does 'The bill, please' mean?",
            options: ["Bring me the menu", "I want to pay", "What do you recommend?", "A table for two"],
            answer: "I want to pay",
          },
          {
            type: "fill-blank",
            question: "I ___ stand broccoli. (strong dislike)",
            answer: "can't",
            hint: "can't stand = strongly dislike",
          },
          {
            type: "multiple-choice",
            question: "Which is a dairy product?",
            options: ["chicken", "banana", "cheese", "carrot"],
            answer: "cheese",
          },
          {
            type: "translate",
            question: "Translate: 'Можно меню?' / 'Le menu, s'il vous plaît.' → English",
            answer: "Can I see the menu",
            hint: "Polite request",
          },
        ],
      },
    ],
  },

  // ── DIRECTIONS ──────────────────────────────────────────────────────────────
  {
    id: "directions",
    title: "Directions & Places",
    description: "Navigate and find places in the city",
    emoji: "🗺️",
    lessons: [
      {
        id: "en-directions",
        title: "Places in the City",
        titleFr: "Directions & Places",
        description: "Ask for and give directions",
        emoji: "🏙️",
        type: "vocabulary",
        content: [
          {
            heading: "Places in Town",
            body: "Common locations you might need to find.",
            examples: [
              { fr: "bank, post office", en: "services" },
              { fr: "hospital, pharmacy", en: "health" },
              { fr: "supermarket, shop / store", en: "shopping" },
              { fr: "restaurant, café", en: "eating out" },
              { fr: "train station, bus stop, airport", en: "transport" },
              { fr: "hotel, museum, park", en: "tourism" },
            ],
          },
          {
            heading: "Asking for Directions",
            body: "How to ask and understand directions.",
            examples: [
              { fr: "Excuse me, how do I get to the station?", en: "polite request for directions" },
              { fr: "Is there a pharmacy near here?", en: "asking if something is nearby" },
              { fr: "Turn left / Turn right", en: "direction instructions" },
              { fr: "Go straight on.", en: "continue forward" },
              { fr: "It's on the left / on the right.", en: "side of the street" },
              { fr: "It's next to the bank.", en: "next to = beside" },
              { fr: "It's opposite the park.", en: "on the other side of the street" },
            ],
          },
          {
            heading: "Distance & Transport",
            body: "How far and how to get there.",
            examples: [
              { fr: "It's about 5 minutes' walk.", en: "walking distance" },
              { fr: "It's too far to walk.", en: "you need transport" },
              { fr: "Take the number 4 bus.", en: "which bus to take" },
              { fr: "You can take a taxi.", en: "another option" },
            ],
            tip: "In English we say 'five minutes' walk' (with apostrophe + s) — the walk belongs to five minutes.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "What does 'Turn left' mean?",
            options: ["Go forward", "Go back", "Turn to the left side", "Stop here"],
            answer: "Turn to the left side",
          },
          {
            type: "multiple-choice",
            question: "Which sentence correctly asks for directions?",
            options: [
              "Where is the station, give me!",
              "Excuse me, how do I get to the station?",
              "Station, please!",
              "Where I go station?"
            ],
            answer: "Excuse me, how do I get to the station?",
          },
          {
            type: "fill-blank",
            question: "Go ___ on for 100 metres, then turn right.",
            answer: "straight",
            hint: "Continue forward",
          },
          {
            type: "multiple-choice",
            question: "'The café is ___ to the bank.' Fill in the blank.",
            options: ["next", "near", "opposite", "behind"],
            answer: "next",
          },
          {
            type: "multiple-choice",
            question: "Which place would you go for medicine?",
            options: ["bank", "pharmacy", "museum", "post office"],
            answer: "pharmacy",
          },
        ],
      },
    ],
  },

  // ── TIME & DAYS ─────────────────────────────────────────────────────────────
  {
    id: "time-days",
    title: "Time, Days & Dates",
    description: "Tell the time and talk about schedules",
    emoji: "📅",
    lessons: [
      {
        id: "en-time",
        title: "Telling Time & Days of the Week",
        titleFr: "Time & Days",
        description: "How to read a clock and name the days",
        emoji: "🕐",
        type: "vocabulary",
        content: [
          {
            heading: "Days of the Week",
            body: "The seven days of the week in English. Always capitalised.",
            examples: [
              { fr: "Monday", en: "first working day" },
              { fr: "Tuesday", en: "second working day" },
              { fr: "Wednesday", en: "third working day" },
              { fr: "Thursday", en: "fourth working day" },
              { fr: "Friday", en: "last working day" },
              { fr: "Saturday", en: "first day of weekend" },
              { fr: "Sunday", en: "last day of weekend" },
            ],
            tip: "In the UK and many countries the week starts on Monday. In the US, calendars often show Sunday as the first day.",
          },
          {
            heading: "Telling the Time",
            body: "Two common ways to say times in English.",
            examples: [
              { fr: "3:00 — It's three o'clock.", en: "exact hour" },
              { fr: "3:15 — It's quarter past three.", en: "15 minutes after" },
              { fr: "3:30 — It's half past three.", en: "30 minutes after" },
              { fr: "3:45 — It's quarter to four.", en: "15 minutes before" },
              { fr: "3:10 — It's ten past three.", en: "digital: three ten" },
              { fr: "3:50 — It's ten to four.", en: "digital: three fifty" },
            ],
            tip: "In everyday speech many people just say the digits: 'It's three fifteen', 'It's three thirty'. Both ways are correct.",
          },
          {
            heading: "Months of the Year",
            body: "All 12 months. Always capitalised in English.",
            examples: [
              { fr: "January, February, March", en: "winter/spring" },
              { fr: "April, May, June", en: "spring/summer" },
              { fr: "July, August, September", en: "summer/autumn" },
              { fr: "October, November, December", en: "autumn/winter" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "What comes after Wednesday?",
            options: ["Tuesday", "Thursday", "Friday", "Monday"],
            answer: "Thursday",
          },
          {
            type: "multiple-choice",
            question: "How do you say 3:30?",
            options: ["Quarter past three", "Quarter to four", "Half past three", "Three to thirty"],
            answer: "Half past three",
          },
          {
            type: "fill-blank",
            question: "It's 3:15. 'It's quarter ___ three.'",
            answer: "past",
            hint: "15 minutes AFTER the hour",
          },
          {
            type: "multiple-choice",
            question: "Which is the last month of the year?",
            options: ["November", "October", "December", "January"],
            answer: "December",
          },
          {
            type: "translate",
            question: "How do you say 3:45 in English (traditional style)?",
            answer: "quarter to four",
            hint: "15 minutes BEFORE the next hour",
          },
        ],
      },
    ],
  },

  // ── PAST SIMPLE ─────────────────────────────────────────────────────────────
  {
    id: "past-simple",
    title: "Past Simple Tense",
    description: "Talk about completed actions in the past",
    emoji: "⏪",
    lessons: [
      {
        id: "en-past-regular",
        title: "Regular Verbs in Past (-ed)",
        titleFr: "Past Simple Regular",
        description: "Form past simple with -ed ending",
        emoji: "⏪",
        type: "grammar",
        content: [
          {
            heading: "Forming the Past Simple",
            body: "For regular verbs, add -ed to the base verb. The form is the same for ALL subjects — no need for different endings.",
            table: {
              columns: ["Subject", "Present", "Past"],
              rows: [
                ["I", "walk", "walked"],
                ["You", "work", "worked"],
                ["He / She / It", "start", "started"],
                ["We", "play", "played"],
                ["They", "watch", "watched"],
              ],
            },
          },
          {
            heading: "Spelling Rules for -ed",
            body: "Some verbs have spelling changes when you add -ed.",
            examples: [
              { fr: "work → worked", en: "just add -ed" },
              { fr: "dance → danced", en: "verb ends in -e: just add -d" },
              { fr: "stop → stopped", en: "short vowel + consonant: double the consonant" },
              { fr: "study → studied", en: "ends in consonant + y: change y → ied" },
            ],
            tip: "Past simple is used for completed actions: 'I worked yesterday.' 'She called me last night.'",
          },
          {
            heading: "Negatives and Questions in Past",
            body: "Use 'did not' (didn't) for negatives and 'did' for questions — the main verb stays in base form.",
            examples: [
              { fr: "She didn't call me.", en: "negative — base form 'call', not 'called'" },
              { fr: "Did you see the film?", en: "question — base form 'see', not 'saw'" },
              { fr: "Why did he leave?", en: "wh-question with 'did'" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "What is the past simple of 'walk'?",
            options: ["walkd", "walked", "walking", "walks"],
            answer: "walked",
          },
          {
            type: "fill-blank",
            question: "She ___ (study) all night.",
            answer: "studied",
            hint: "y → ied",
          },
          {
            type: "multiple-choice",
            question: "Make negative in past: 'He worked.' →",
            options: ["He not worked.", "He didn't worked.", "He didn't work.", "He wasn't worked."],
            answer: "He didn't work.",
          },
          {
            type: "fill-blank",
            question: "___ you call him yesterday? (question in past)",
            answer: "Did",
            hint: "Past question helper",
          },
          {
            type: "multiple-choice",
            question: "What is the correct spelling? 'stop' in past simple.",
            options: ["stoped", "stopd", "stopped", "stopted"],
            answer: "stopped",
          },
        ],
      },
      {
        id: "en-past-irregular",
        title: "Irregular Verbs (go→went…)",
        titleFr: "Past Simple Irregular",
        description: "The most important irregular past forms",
        emoji: "⚡",
        type: "grammar",
        content: [
          {
            heading: "Common Irregular Verbs",
            body: "These verbs do not add -ed in the past. Each has a unique form you must memorise.",
            table: {
              columns: ["Base", "Past Simple", "Example"],
              rows: [
                ["go", "went", "I went to the shop."],
                ["come", "came", "She came late."],
                ["see", "saw", "We saw a film."],
                ["eat", "ate", "He ate a pizza."],
                ["drink", "drank", "They drank coffee."],
                ["have", "had", "I had a great time."],
                ["make", "made", "She made dinner."],
                ["take", "took", "He took a taxi."],
                ["give", "gave", "They gave us gifts."],
                ["say", "said", "She said hello."],
                ["get", "got", "I got the message."],
                ["know", "knew", "We knew the answer."],
              ],
            },
          },
          {
            heading: "Negatives & Questions Stay the Same",
            body: "Even with irregular verbs, the negative and question use 'didn't' / 'did' + base form.",
            examples: [
              { fr: "I went. → I didn't go.", en: "NOT: I didn't went" },
              { fr: "She ate. → Did she eat?", en: "NOT: Did she ate?" },
              { fr: "They saw it. → They didn't see it.", en: "NOT: They didn't saw it" },
            ],
            tip: "The irregular form is ONLY used in positive sentences. In negatives and questions, always use the base verb.",
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "What is the past simple of 'go'?",
            options: ["goed", "going", "gone", "went"],
            answer: "went",
          },
          {
            type: "fill-blank",
            question: "She ___ (eat) a sandwich for lunch.",
            answer: "ate",
          },
          {
            type: "multiple-choice",
            question: "Make negative: 'He went to the party.'",
            options: ["He didn't went.", "He went not.", "He didn't go.", "He not go."],
            answer: "He didn't go.",
          },
          {
            type: "multiple-choice",
            question: "What is the past form of 'take'?",
            options: ["taked", "took", "taken", "takied"],
            answer: "took",
          },
          {
            type: "fill-blank",
            question: "I ___ (have) a wonderful holiday.",
            answer: "had",
          },
        ],
      },
    ],
  },

  // ── FUTURE ──────────────────────────────────────────────────────────────────
  {
    id: "future",
    title: "Talking About the Future",
    description: "Express plans and predictions",
    emoji: "⏩",
    lessons: [
      {
        id: "en-future-going-to",
        title: "Going to — plans",
        titleFr: "Going to",
        description: "Talk about plans and intentions",
        emoji: "📅",
        type: "grammar",
        content: [
          {
            heading: "Going to for Plans",
            body: "'Be going to' expresses a plan or intention you have already decided.",
            examples: [
              { fr: "I'm going to call her tonight.", en: "decided plan" },
              { fr: "We're going to travel to London.", en: "future plan" },
              { fr: "She's going to study medicine.", en: "life plan" },
            ],
          },
          {
            heading: "Structure",
            body: "Subject + am/is/are + going to + base verb",
            table: {
              columns: ["Subject", "Full form", "Example"],
              rows: [
                ["I", "I am going to", "I'm going to study."],
                ["You", "You are going to", "You're going to love it."],
                ["He / She / It", "He is going to", "She's going to cook dinner."],
                ["We / They", "We are going to", "They're going to arrive soon."],
              ],
            },
          },
          {
            heading: "Negative & Questions",
            body: "Use 'not' after am/is/are. Invert am/is/are for questions.",
            examples: [
              { fr: "I'm not going to eat meat.", en: "negative" },
              { fr: "Are you going to come?", en: "question — Yes, I am. / No, I'm not." },
              { fr: "Is she going to help us?", en: "question with he/she/it" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "Fill in: 'We ___ going to visit Rome next summer.'",
            options: ["am", "is", "are", "be"],
            answer: "are",
          },
          {
            type: "fill-blank",
            question: "She ___ going to study tonight. (he/she/it form of be)",
            answer: "is",
          },
          {
            type: "multiple-choice",
            question: "Make a question: '___ he going to call?'",
            options: ["Do", "Does", "Is", "Are"],
            answer: "Is",
          },
          {
            type: "multiple-choice",
            question: "Which sentence expresses a future plan with 'going to'?",
            options: [
              "I study tomorrow.",
              "I will study.",
              "I'm going to study tomorrow.",
              "I studied tomorrow."
            ],
            answer: "I'm going to study tomorrow.",
          },
          {
            type: "fill-blank",
            question: "I'm ___ going to eat fast food anymore. (negative word)",
            answer: "not",
            hint: "Put 'not' after 'am'",
          },
        ],
      },
      {
        id: "en-future-will",
        title: "Will — predictions & offers",
        titleFr: "Will",
        description: "Spontaneous decisions, offers and predictions",
        emoji: "⏩",
        type: "grammar",
        content: [
          {
            heading: "Will for Predictions & Decisions",
            body: "'Will' is used for predictions, offers made on the spot, and decisions made at the moment of speaking.",
            examples: [
              { fr: "It will rain tomorrow.", en: "prediction about the future" },
              { fr: "I'll help you with that!", en: "offer made right now (I will → I'll)" },
              { fr: "I'll have the salad, please.", en: "decision at the moment (ordering)" },
            ],
          },
          {
            heading: "Will Structure",
            body: "Subject + will + base verb (same for ALL subjects).",
            table: {
              columns: ["Subject", "Positive", "Negative", "Question"],
              rows: [
                ["I", "I will / I'll", "I won't", "Will I?"],
                ["You", "You will / You'll", "You won't", "Will you?"],
                ["He/She/It", "He will / He'll", "He won't", "Will he?"],
                ["We/They", "We will / We'll", "We won't", "Will they?"],
              ],
            },
            tip: "'Won't' = 'will not'. It's one of the most common contractions. 'I won't be late' = 'I will not be late'.",
          },
          {
            heading: "Going to vs Will",
            body: "Use 'going to' for plans already decided. Use 'will' for decisions made right now or general predictions.",
            examples: [
              { fr: "I'm going to see Anna tonight. (plan)", en: "decided before" },
              { fr: "The phone is ringing — I'll get it! (will)", en: "decision right now" },
            ],
          },
        ],
        exercises: [
          {
            type: "multiple-choice",
            question: "The phone rings. You say: '___ get it!'",
            options: ["I'm going to", "I'll", "I did", "I'm"],
            answer: "I'll",
          },
          {
            type: "fill-blank",
            question: "It ___ be cold tomorrow. (prediction)",
            answer: "will",
            hint: "'Will' for predictions",
          },
          {
            type: "multiple-choice",
            question: "What is the negative of 'will'?",
            options: ["willn't", "won't", "wouldn't", "don't will"],
            answer: "won't",
          },
          {
            type: "multiple-choice",
            question: "Which uses 'will' correctly?",
            options: [
              "I will going to call her.",
              "She will calls me later.",
              "They will come to the party.",
              "We will coming soon."
            ],
            answer: "They will come to the party.",
          },
          {
            type: "translate",
            question: "Translate: 'Он не придёт.' / 'Il ne viendra pas.' → English",
            answer: "He won't come",
            hint: "won't = will not",
          },
        ],
      },
    ],
  },
];

// ── Helper functions ─────────────────────────────────────────────────────────

export function getAllLessonsEn(): (import("./learning-path").Lesson & { topicId: string; topicTitle: string })[] {
  return LEARNING_PATH_EN.flatMap((topic) =>
    topic.lessons.map((lesson) => ({
      ...lesson,
      topicId: topic.id,
      topicTitle: topic.title,
    }))
  );
}

export function getLessonByIdEn(
  lessonId: string
): (import("./learning-path").Lesson & { topicId: string; topicTitle: string }) | undefined {
  return getAllLessonsEn().find((l) => l.id === lessonId);
}
