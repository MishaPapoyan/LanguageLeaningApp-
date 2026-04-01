export interface Lesson {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  emoji: string;
  type: "alphabet" | "pronunciation" | "vocabulary" | "grammar" | "conversation" | "culture";
  content: LessonSection[];
  exercises: Exercise[];
}

export interface LessonSection {
  heading: string;
  body: string;
  examples?: { fr: string; en: string; audio?: string }[];
  table?: { columns: string[]; rows: string[][] };
  tip?: string;
}

export interface Exercise {
  type: "multiple-choice" | "fill-blank" | "translate" | "match";
  question: string;
  options?: string[];
  answer: string;
  hint?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  emoji: string;
  lessons: Lesson[];
  requiredTopicId?: string; // prerequisite topic
}

export const LEARNING_PATH: Topic[] = [
  // ── UNIT 1: FOUNDATIONS ──
  {
    id: "alphabet",
    title: "The French Alphabet",
    description: "Learn all 26 letters and their French pronunciation",
    emoji: "🔤",
    lessons: [
      {
        id: "alphabet-1",
        title: "Letters A-M",
        titleFr: "L'alphabet (A-M)",
        description: "The first half of the French alphabet",
        emoji: "🅰️",
        type: "alphabet",
        content: [
          {
            heading: "The French Alphabet",
            body: "French uses the same 26 letters as English, but they are pronounced differently. Let's start with A through M.",
            examples: [
              { fr: "A", en: "ah (like 'ah')" },
              { fr: "B", en: "bay" },
              { fr: "C", en: "say" },
              { fr: "D", en: "day" },
              { fr: "E", en: "euh (like 'uh')" },
              { fr: "F", en: "eff" },
              { fr: "G", en: "zhay" },
              { fr: "H", en: "ahsh (silent in words)" },
              { fr: "I", en: "ee" },
              { fr: "J", en: "zhee" },
              { fr: "K", en: "kah" },
              { fr: "L", en: "ell" },
              { fr: "M", en: "emm" },
            ],
            tip: "H is always silent in French! 'Hôtel' is pronounced 'oh-tel'."
          },
          {
            heading: "Special Accents",
            body: "French has accents that change how letters are pronounced. The main ones are:",
            examples: [
              { fr: "é", en: "accent aigu — sounds like 'ay' (café)" },
              { fr: "è / ê", en: "accent grave/circumflex — sounds like 'eh' (mère, fête)" },
              { fr: "ë", en: "tréma — says 'pronounce me separately' (Noël)" },
              { fr: "ç", en: "cédille — makes C soft like 'ss' (français)" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "How is the letter 'G' pronounced in French?", options: ["gee", "zhay", "hay", "jay"], answer: "zhay" },
          { type: "multiple-choice", question: "What does the accent on 'é' sound like?", options: ["ee", "ay", "oh", "uh"], answer: "ay" },
          { type: "multiple-choice", question: "Is the letter H pronounced in French words?", options: ["Yes, always", "No, it's silent", "Only at the start", "Only at the end"], answer: "No, it's silent" },
          { type: "fill-blank", question: "The symbol ç is called a ___", answer: "cédille", hint: "It makes 'C' sound like 'S'" },
        ],
      },
      {
        id: "alphabet-2",
        title: "Letters N-Z",
        titleFr: "L'alphabet (N-Z)",
        description: "The second half of the French alphabet",
        emoji: "🇿",
        type: "alphabet",
        content: [
          {
            heading: "Letters N through Z",
            body: "Let's complete the alphabet! Some of these sound very different from English.",
            examples: [
              { fr: "N", en: "enn" },
              { fr: "O", en: "oh" },
              { fr: "P", en: "pay" },
              { fr: "Q", en: "kew" },
              { fr: "R", en: "airr (throat sound)" },
              { fr: "S", en: "ess" },
              { fr: "T", en: "tay" },
              { fr: "U", en: "ew (purse your lips!)" },
              { fr: "V", en: "vay" },
              { fr: "W", en: "doo-bluh-vay" },
              { fr: "X", en: "eeks" },
              { fr: "Y", en: "ee-grek" },
              { fr: "Z", en: "zed" },
            ],
            tip: "The French 'R' comes from the throat — practice gargling gently! The 'U' sound doesn't exist in English — say 'ee' but round your lips."
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "How is 'W' said in French?", options: ["wee", "doo-bluh-vay", "wah", "vay"], answer: "doo-bluh-vay" },
          { type: "multiple-choice", question: "The French 'R' is pronounced from the:", options: ["Tip of tongue", "Throat", "Lips", "Nose"], answer: "Throat" },
          { type: "multiple-choice", question: "How is 'Y' said in French?", options: ["yah", "ee-grek", "why", "yee"], answer: "ee-grek" },
          { type: "fill-blank", question: "To pronounce French 'U', say 'ee' but ___ your lips", answer: "round", hint: "Shape your mouth like saying 'oo'" },
        ],
      },
    ],
  },
  {
    id: "pronunciation",
    title: "French Sounds",
    description: "Master the key sounds that make French unique",
    emoji: "🔊",
    requiredTopicId: "alphabet",
    lessons: [
      {
        id: "sounds-vowels",
        title: "Vowel Sounds",
        titleFr: "Les voyelles",
        description: "The pure vowel sounds of French",
        emoji: "🗣️",
        type: "pronunciation",
        content: [
          {
            heading: "French Vowels",
            body: "French has more vowel sounds than English. The key ones to master:",
            examples: [
              { fr: "a / à", en: "'ah' — papa, là" },
              { fr: "e (unstressed)", en: "'uh' — le, de, petit" },
              { fr: "é", en: "'ay' — café, été" },
              { fr: "è / ê / ai", en: "'eh' — mère, tête, lait" },
              { fr: "i / y", en: "'ee' — ici, stylo" },
              { fr: "o / au / eau", en: "'oh' — beau, chapeau" },
              { fr: "u", en: "'ew' (lips rounded) — tu, rue" },
              { fr: "ou", en: "'oo' — vous, tout" },
            ],
            tip: "The biggest challenge: 'u' (ew) vs 'ou' (oo). 'Tu' (you) vs 'tout' (all) sound very different!"
          },
          {
            heading: "Nasal Vowels",
            body: "French has nasal sounds where air goes through your nose. These don't exist in English!",
            examples: [
              { fr: "an / en / am / em", en: "'ahn' — dans, enfant, chambre" },
              { fr: "on / om", en: "'ohn' — bon, nom, ombre" },
              { fr: "in / im / ain / ein", en: "'an' — vin, pain, plein" },
              { fr: "un / um", en: "'uhn' — un, parfum" },
            ],
            tip: "To make nasal sounds: start saying the vowel, then redirect air through your nose. Don't pronounce the 'n'!"
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "Which word has the nasal 'on' sound?", options: ["café", "bon", "rue", "été"], answer: "bon" },
          { type: "multiple-choice", question: "'Eau' is pronounced like:", options: ["ee-ow", "oh", "ew", "ah"], answer: "oh" },
          { type: "multiple-choice", question: "What's the difference between 'tu' and 'tout'?", options: ["They sound the same", "'tu' has 'ew' sound, 'tout' has 'oo' sound", "'tu' is louder", "No difference"], answer: "'tu' has 'ew' sound, 'tout' has 'oo' sound" },
        ],
      },
      {
        id: "sounds-consonants",
        title: "Consonant Rules",
        titleFr: "Les consonnes",
        description: "Silent letters and consonant sounds",
        emoji: "🤫",
        type: "pronunciation",
        content: [
          {
            heading: "Silent Letters",
            body: "French is famous for silent letters. Here are the key rules:",
            examples: [
              { fr: "Final consonants are usually silent", en: "petit (puh-TEE), grand (grahn), vous (voo)" },
              { fr: "H is always silent", en: "homme (om), hôtel (oh-tel)" },
              { fr: "Final -e is usually silent", en: "table (tabl), grande (grahnd)" },
              { fr: "Final -s is silent (plural)", en: "les chats (lay shah)" },
            ],
            tip: "Remember 'CaReFuL' — C, R, F, L are the final consonants that ARE usually pronounced!"
          },
          {
            heading: "Liaison (Linking Words)",
            body: "In French, words flow together. A silent final consonant can be pronounced when the next word starts with a vowel.",
            examples: [
              { fr: "les amis → lez-ami", en: "the friends (the 's' links to 'amis')" },
              { fr: "vous avez → vooz-avay", en: "you have (the 's' links to 'avez')" },
              { fr: "un homme → uhn-nom", en: "a man (the 'n' links to 'homme')" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "Which final consonants ARE usually pronounced? (Hint: CaReFuL)", options: ["S, T, X", "C, R, F, L", "B, D, G", "M, N, P"], answer: "C, R, F, L" },
          { type: "multiple-choice", question: "In 'les amis', the 's' in 'les' is:", options: ["Silent", "Pronounced because next word starts with vowel", "Always pronounced", "Optional"], answer: "Pronounced because next word starts with vowel" },
          { type: "multiple-choice", question: "How is 'petit' pronounced?", options: ["peh-tit", "puh-tee", "pee-tit", "pay-tee"], answer: "puh-tee" },
        ],
      },
    ],
  },

  // ── UNIT 2: FIRST WORDS ──
  {
    id: "greetings",
    title: "Greetings & Basics",
    description: "Hello, goodbye, please, thank you — your first French words",
    emoji: "👋",
    requiredTopicId: "pronunciation",
    lessons: [
      {
        id: "greetings-hello",
        title: "Saying Hello & Goodbye",
        titleFr: "Bonjour et Au revoir",
        description: "Essential greetings for every situation",
        emoji: "👋",
        type: "vocabulary",
        content: [
          {
            heading: "Hello!",
            body: "French greetings depend on the time of day and formality level.",
            examples: [
              { fr: "Bonjour", en: "Hello / Good morning (formal, daytime)" },
              { fr: "Bonsoir", en: "Good evening (after ~6pm)" },
              { fr: "Salut", en: "Hi / Hey (informal, with friends)" },
              { fr: "Coucou", en: "Hey there! (very casual, close friends)" },
            ],
          },
          {
            heading: "Goodbye!",
            body: "Different ways to say goodbye:",
            examples: [
              { fr: "Au revoir", en: "Goodbye (standard)" },
              { fr: "Bonne journée", en: "Have a good day" },
              { fr: "Bonne soirée", en: "Have a good evening" },
              { fr: "Bonne nuit", en: "Good night (going to sleep)" },
              { fr: "Salut", en: "Bye (informal — same word as 'hi'!)" },
              { fr: "À bientôt", en: "See you soon" },
              { fr: "À demain", en: "See you tomorrow" },
            ],
            tip: "'Salut' works for both hello AND goodbye among friends!"
          },
          {
            heading: "Magic Words",
            body: "The most important words in any language:",
            examples: [
              { fr: "S'il vous plaît", en: "Please (formal)" },
              { fr: "S'il te plaît", en: "Please (informal)" },
              { fr: "Merci", en: "Thank you" },
              { fr: "Merci beaucoup", en: "Thank you very much" },
              { fr: "De rien", en: "You're welcome" },
              { fr: "Excusez-moi", en: "Excuse me (formal)" },
              { fr: "Pardon", en: "Sorry / Pardon" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "Which greeting is used in the evening?", options: ["Bonjour", "Bonsoir", "Salut", "Coucou"], answer: "Bonsoir" },
          { type: "translate", question: "How do you say 'Thank you very much' in French?", answer: "Merci beaucoup" },
          { type: "multiple-choice", question: "'Salut' can mean both:", options: ["Please and thank you", "Hello and goodbye", "Good morning and good night", "Yes and no"], answer: "Hello and goodbye" },
          { type: "fill-blank", question: "The formal way to say 'please' is: S'il ___ plaît", answer: "vous", hint: "'vous' is the formal 'you'" },
        ],
      },
      {
        id: "greetings-intro",
        title: "Introducing Yourself",
        titleFr: "Se présenter",
        description: "Tell people your name, where you're from, and how you're doing",
        emoji: "🙋",
        type: "conversation",
        content: [
          {
            heading: "What's Your Name?",
            body: "Two ways to give your name:",
            examples: [
              { fr: "Je m'appelle Marie", en: "My name is Marie (I call myself Marie)" },
              { fr: "Je suis Pierre", en: "I am Pierre" },
              { fr: "Comment vous appelez-vous ?", en: "What is your name? (formal)" },
              { fr: "Tu t'appelles comment ?", en: "What's your name? (informal)" },
            ],
          },
          {
            heading: "How Are You?",
            body: "The classic French conversation opener:",
            examples: [
              { fr: "Comment allez-vous ?", en: "How are you? (formal)" },
              { fr: "Comment ça va ? / Ça va ?", en: "How are you? (informal)" },
              { fr: "Ça va bien, merci", en: "I'm fine, thanks" },
              { fr: "Très bien !", en: "Very well!" },
              { fr: "Comme ci, comme ça", en: "So-so" },
              { fr: "Pas mal", en: "Not bad" },
            ],
          },
          {
            heading: "Where Are You From?",
            body: "Talking about where you come from:",
            examples: [
              { fr: "D'où venez-vous ?", en: "Where are you from? (formal)" },
              { fr: "Tu viens d'où ?", en: "Where are you from? (informal)" },
              { fr: "Je viens de...", en: "I come from..." },
              { fr: "J'habite à...", en: "I live in..." },
              { fr: "Je suis américain(e) / anglais(e)", en: "I am American / English" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'My name is...'", answer: "Je m'appelle", hint: "Literally means 'I call myself'" },
          { type: "multiple-choice", question: "Which is the informal way to ask 'How are you?'", options: ["Comment allez-vous ?", "Ça va ?", "D'où venez-vous ?", "Comment vous appelez-vous ?"], answer: "Ça va ?" },
          { type: "fill-blank", question: "Je ___ de Paris. (I come from Paris)", answer: "viens", hint: "From the verb 'venir' (to come)" },
        ],
      },
    ],
  },

  // ── UNIT 3: BUILDING BLOCKS ──
  {
    id: "numbers",
    title: "Numbers & Counting",
    description: "Count from 1 to 100, tell time, and talk about prices",
    emoji: "🔢",
    requiredTopicId: "greetings",
    lessons: [
      {
        id: "numbers-1-20",
        title: "Numbers 1-20",
        titleFr: "Les nombres 1-20",
        description: "The foundation of all French numbers",
        emoji: "1️⃣",
        type: "vocabulary",
        content: [
          {
            heading: "Numbers 1-10",
            body: "Learn these by heart — they're the building blocks for everything!",
            table: {
              columns: ["Number", "French", "Pronunciation"],
              rows: [
                ["1", "un", "uhn"],
                ["2", "deux", "duh"],
                ["3", "trois", "twah"],
                ["4", "quatre", "katr"],
                ["5", "cinq", "sank"],
                ["6", "six", "sees"],
                ["7", "sept", "set"],
                ["8", "huit", "weet"],
                ["9", "neuf", "nuhf"],
                ["10", "dix", "dees"],
              ],
            },
          },
          {
            heading: "Numbers 11-20",
            body: "11-16 are unique words. 17-19 follow a pattern.",
            table: {
              columns: ["Number", "French", "Pronunciation"],
              rows: [
                ["11", "onze", "ohnz"],
                ["12", "douze", "dooz"],
                ["13", "treize", "trehz"],
                ["14", "quatorze", "kah-torz"],
                ["15", "quinze", "kanz"],
                ["16", "seize", "sehz"],
                ["17", "dix-sept", "dee-set"],
                ["18", "dix-huit", "deez-weet"],
                ["19", "dix-neuf", "deez-nuhf"],
                ["20", "vingt", "van"],
              ],
            },
            tip: "17, 18, 19 are literally 'ten-seven', 'ten-eight', 'ten-nine'. Easy pattern!"
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "What is 'cinq' in English?", options: ["3", "4", "5", "6"], answer: "5" },
          { type: "translate", question: "How do you say '15' in French?", answer: "quinze" },
          { type: "multiple-choice", question: "What number is 'dix-huit'?", options: ["16", "17", "18", "19"], answer: "18" },
          { type: "fill-blank", question: "12 in French is ___", answer: "douze" },
        ],
      },
      {
        id: "numbers-21-100",
        title: "Numbers 21-100",
        titleFr: "Les nombres 21-100",
        description: "Now you can count to a hundred!",
        emoji: "💯",
        type: "vocabulary",
        content: [
          {
            heading: "Tens (20-60)",
            body: "The tens from 20-60 follow a clean pattern:",
            table: {
              columns: ["Number", "French"],
              rows: [
                ["20", "vingt"],
                ["30", "trente"],
                ["40", "quarante"],
                ["50", "cinquante"],
                ["60", "soixante"],
              ],
            },
            tip: "In-between numbers use a hyphen: vingt-deux (22), trente-cinq (35). Exception: 21, 31, 41, 51, 61 use 'et un': vingt et un (21)."
          },
          {
            heading: "70, 80, 90 — The Fun Part!",
            body: "This is where French gets creative. Brace yourself!",
            examples: [
              { fr: "70 = soixante-dix", en: "Literally: sixty-ten!" },
              { fr: "71 = soixante et onze", en: "sixty-eleven" },
              { fr: "79 = soixante-dix-neuf", en: "sixty-nineteen!" },
              { fr: "80 = quatre-vingts", en: "Literally: four-twenties!" },
              { fr: "81 = quatre-vingt-un", en: "four-twenty-one" },
              { fr: "90 = quatre-vingt-dix", en: "four-twenty-ten!" },
              { fr: "99 = quatre-vingt-dix-neuf", en: "four-twenty-nineteen!" },
              { fr: "100 = cent", en: "One hundred" },
            ],
            tip: "Yes, the French count 70 as '60+10', 80 as '4×20', and 90 as '4×20+10'. It's wild but you'll get used to it!"
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "What is 'soixante-dix' (literally sixty-ten)?", options: ["60", "70", "80", "90"], answer: "70" },
          { type: "multiple-choice", question: "How do you say 80 in French?", options: ["huitante", "quatre-vingts", "soixante-vingt", "octante"], answer: "quatre-vingts" },
          { type: "fill-blank", question: "99 in French is quatre-vingt-___", answer: "dix-neuf", hint: "four-twenty-... nineteen" },
        ],
      },
    ],
  },
  {
    id: "essentials",
    title: "Essential Phrases",
    description: "Survival French for everyday situations",
    emoji: "🆘",
    requiredTopicId: "greetings",
    lessons: [
      {
        id: "essentials-survival",
        title: "Survival Phrases",
        titleFr: "Phrases de survie",
        description: "The phrases you need most as a beginner",
        emoji: "🆘",
        type: "conversation",
        content: [
          {
            heading: "I Don't Understand",
            body: "The most useful phrases when you're learning!",
            examples: [
              { fr: "Je ne comprends pas", en: "I don't understand" },
              { fr: "Pouvez-vous répéter ?", en: "Can you repeat that?" },
              { fr: "Plus lentement, s'il vous plaît", en: "More slowly, please" },
              { fr: "Comment dit-on '...' en français ?", en: "How do you say '...' in French?" },
              { fr: "Qu'est-ce que ça veut dire ?", en: "What does that mean?" },
              { fr: "Je ne parle pas bien français", en: "I don't speak French well" },
              { fr: "Parlez-vous anglais ?", en: "Do you speak English?" },
            ],
          },
          {
            heading: "Basic Needs",
            body: "Asking for what you need:",
            examples: [
              { fr: "Où sont les toilettes ?", en: "Where are the toilets?" },
              { fr: "Je voudrais...", en: "I would like..." },
              { fr: "C'est combien ?", en: "How much is it?" },
              { fr: "L'addition, s'il vous plaît", en: "The bill, please" },
              { fr: "Je suis perdu(e)", en: "I am lost" },
              { fr: "Pouvez-vous m'aider ?", en: "Can you help me?" },
              { fr: "J'ai besoin de...", en: "I need..." },
            ],
          },
          {
            heading: "Yes, No & Maybe",
            body: "Simple responses:",
            examples: [
              { fr: "Oui", en: "Yes" },
              { fr: "Non", en: "No" },
              { fr: "Peut-être", en: "Maybe" },
              { fr: "D'accord", en: "Okay / Agreed" },
              { fr: "Bien sûr", en: "Of course" },
              { fr: "Je ne sais pas", en: "I don't know" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "How do you say 'I don't understand'?", answer: "Je ne comprends pas" },
          { type: "multiple-choice", question: "'Où sont les toilettes ?' means:", options: ["Where is the exit?", "Where are the toilets?", "Where is the hotel?", "Where are my friends?"], answer: "Where are the toilets?" },
          { type: "multiple-choice", question: "How do you ask someone to speak more slowly?", options: ["Plus vite", "Plus lentement, s'il vous plaît", "Parlez-vous anglais ?", "Comment dit-on ?"], answer: "Plus lentement, s'il vous plaît" },
          { type: "fill-blank", question: "To say 'I would like...' start with: Je ___", answer: "voudrais", hint: "Conditional form of 'vouloir'" },
        ],
      },
    ],
  },

  // ── UNIT 4: GRAMMAR BASICS ──
  {
    id: "articles-gender",
    title: "Articles & Gender",
    description: "Every French noun is masculine or feminine — learn the system",
    emoji: "⚤",
    requiredTopicId: "essentials",
    lessons: [
      {
        id: "articles-definite",
        title: "The (Le, La, Les)",
        titleFr: "Les articles définis",
        description: "Definite articles — the building blocks of every sentence",
        emoji: "📎",
        type: "grammar",
        content: [
          {
            heading: "Definite Articles: 'The'",
            body: "Unlike English, French has different words for 'the' depending on gender and number.",
            table: {
              columns: ["", "Masculine", "Feminine"],
              rows: [
                ["Singular", "le (le livre — the book)", "la (la table — the table)"],
                ["Before vowel", "l' (l'homme — the man)", "l' (l'eau — the water)"],
                ["Plural", "les (les livres)", "les (les tables)"],
              ],
            },
            tip: "Every noun in French is either masculine or feminine. There's no neutral! 'Les' works for both genders in plural."
          },
          {
            heading: "How to Guess Gender",
            body: "While you mostly need to memorize genders, there are patterns:",
            examples: [
              { fr: "Words ending in -tion, -sion", en: "Usually feminine: la nation, la télévision" },
              { fr: "Words ending in -ment", en: "Usually masculine: le moment, le gouvernement" },
              { fr: "Words ending in -age", en: "Usually masculine: le fromage, le voyage" },
              { fr: "Words ending in -ure, -ette", en: "Usually feminine: la nature, la fourchette" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "Which article goes with 'livre' (book, masculine)?", options: ["la", "le", "les", "un"], answer: "le" },
          { type: "multiple-choice", question: "Before a vowel, both le and la become:", options: ["les", "l'", "un", "de"], answer: "l'" },
          { type: "fill-blank", question: "___ femme (the woman)", answer: "La", hint: "Femme is feminine" },
          { type: "multiple-choice", question: "What article is used for ALL plurals?", options: ["le", "la", "les", "l'"], answer: "les" },
        ],
      },
      {
        id: "articles-indefinite",
        title: "A / Some (Un, Une, Des)",
        titleFr: "Les articles indéfinis",
        description: "Indefinite articles — talking about non-specific things",
        emoji: "🔘",
        type: "grammar",
        content: [
          {
            heading: "Indefinite Articles: 'A' and 'Some'",
            body: "Use these when talking about non-specific things:",
            table: {
              columns: ["", "Masculine", "Feminine", "Plural"],
              rows: [
                ["Form", "un", "une", "des"],
                ["Example", "un livre (a book)", "une table (a table)", "des livres (some books)"],
              ],
            },
          },
          {
            heading: "Le vs Un — When to Use Which?",
            body: "The choice depends on whether you're being specific:",
            examples: [
              { fr: "Je veux le livre", en: "I want THE book (specific one)" },
              { fr: "Je veux un livre", en: "I want A book (any book)" },
              { fr: "J'aime les chats", en: "I like cats (in general)" },
              { fr: "J'ai des chats", en: "I have (some) cats" },
            ],
            tip: "In French, you almost always need an article before a noun. You can't just say 'I like cats' — it must be 'J'aime LES chats'."
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "'Une' is used before:", options: ["Masculine nouns", "Feminine nouns", "Plural nouns", "All nouns"], answer: "Feminine nouns" },
          { type: "fill-blank", question: "J'ai ___ chien. (I have a dog — masculine)", answer: "un" },
          { type: "multiple-choice", question: "The plural of 'un/une' is:", options: ["les", "des", "de", "uns"], answer: "des" },
        ],
      },
    ],
  },
  {
    id: "subject-pronouns",
    title: "Subject Pronouns & Être",
    description: "I, you, he, she + the verb 'to be'",
    emoji: "👤",
    requiredTopicId: "articles-gender",
    lessons: [
      {
        id: "pronouns-basic",
        title: "Subject Pronouns",
        titleFr: "Les pronoms sujets",
        description: "I, you, he, she, we, they",
        emoji: "👤",
        type: "grammar",
        content: [
          {
            heading: "French Subject Pronouns",
            body: "French has more pronouns than English because of formal/informal distinction:",
            table: {
              columns: ["French", "English", "Notes"],
              rows: [
                ["je", "I", "becomes j' before a vowel"],
                ["tu", "you (singular, informal)", "friends, family, kids"],
                ["il", "he / it (masculine)", ""],
                ["elle", "she / it (feminine)", ""],
                ["on", "we / one / people", "very common in casual French"],
                ["nous", "we (formal)", "more formal, less used in speech"],
                ["vous", "you (plural or formal)", "always use with strangers!"],
                ["ils", "they (masculine / mixed)", ""],
                ["elles", "they (all feminine)", ""],
              ],
            },
            tip: "Tu vs Vous: Use 'tu' with friends, family, children. Use 'vous' with strangers, elders, bosses, or anyone you're not close to. When in doubt, use 'vous'!"
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "You're speaking to your boss. Which 'you' do you use?", options: ["tu", "vous", "on", "il"], answer: "vous" },
          { type: "multiple-choice", question: "'On' is commonly used in casual French to mean:", options: ["He", "She", "We", "They"], answer: "We" },
          { type: "multiple-choice", question: "'Elles' is used when 'they' refers to:", options: ["All masculine", "Mixed group", "All feminine", "Objects only"], answer: "All feminine" },
        ],
      },
      {
        id: "etre-verb",
        title: "The Verb Être (To Be)",
        titleFr: "Le verbe être",
        description: "The most important verb in French",
        emoji: "✨",
        type: "grammar",
        content: [
          {
            heading: "Être — To Be",
            body: "This is the #1 most used verb in French. Memorize it!",
            table: {
              columns: ["Pronoun", "Être", "Example"],
              rows: [
                ["je", "suis", "Je suis étudiant — I am a student"],
                ["tu", "es", "Tu es français — You are French"],
                ["il/elle/on", "est", "Elle est belle — She is beautiful"],
                ["nous", "sommes", "Nous sommes amis — We are friends"],
                ["vous", "êtes", "Vous êtes gentil — You are kind"],
                ["ils/elles", "sont", "Ils sont grands — They are tall"],
              ],
            },
            tip: "Unlike English, you DON'T need an article before professions: 'Je suis étudiant' (I am a student), not 'Je suis UN étudiant'."
          },
          {
            heading: "Common Uses of Être",
            body: "Être is used everywhere:",
            examples: [
              { fr: "Je suis fatigué(e)", en: "I am tired" },
              { fr: "C'est bon", en: "It's good" },
              { fr: "Il est 3 heures", en: "It is 3 o'clock" },
              { fr: "Où est la gare ?", en: "Where is the train station?" },
              { fr: "C'est mon ami", en: "This is my friend" },
            ],
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Je ___ étudiant. (I am a student)", answer: "suis" },
          { type: "fill-blank", question: "Vous ___ français ? (Are you French?)", answer: "êtes" },
          { type: "multiple-choice", question: "'Ils sont grands' means:", options: ["They are happy", "They are tall", "They are young", "They are here"], answer: "They are tall" },
          { type: "fill-blank", question: "Elle ___ belle. (She is beautiful)", answer: "est" },
        ],
      },
    ],
  },

  // ── UNIT 5: EVERYDAY FRENCH ──
  {
    id: "avoir-verb",
    title: "Avoir (To Have) & Expressions",
    description: "The second most important verb + unique French expressions",
    emoji: "🤲",
    requiredTopicId: "subject-pronouns",
    lessons: [
      {
        id: "avoir-conjugation",
        title: "Conjugating Avoir",
        titleFr: "Le verbe avoir",
        description: "I have, you have, she has...",
        emoji: "🤲",
        type: "grammar",
        content: [
          {
            heading: "Avoir — To Have",
            body: "The second most important French verb:",
            table: {
              columns: ["Pronoun", "Avoir", "Example"],
              rows: [
                ["j'", "ai", "J'ai un chien — I have a dog"],
                ["tu", "as", "Tu as faim ? — Are you hungry?"],
                ["il/elle/on", "a", "Elle a 20 ans — She is 20 years old"],
                ["nous", "avons", "Nous avons le temps — We have time"],
                ["vous", "avez", "Vous avez raison — You are right"],
                ["ils/elles", "ont", "Ils ont trois enfants — They have 3 children"],
              ],
            },
          },
          {
            heading: "Avoir Expressions (where English uses 'to be')",
            body: "In French, many expressions use 'avoir' (to have) where English uses 'to be'!",
            examples: [
              { fr: "J'ai faim", en: "I am hungry (literally: I have hunger)" },
              { fr: "J'ai soif", en: "I am thirsty (I have thirst)" },
              { fr: "J'ai froid / chaud", en: "I am cold / hot" },
              { fr: "J'ai peur", en: "I am afraid (I have fear)" },
              { fr: "J'ai 25 ans", en: "I am 25 years old (I have 25 years)" },
              { fr: "J'ai sommeil", en: "I am sleepy" },
              { fr: "J'ai raison / tort", en: "I am right / wrong" },
              { fr: "J'ai besoin de...", en: "I need... (I have need of...)" },
            ],
            tip: "Think of it this way: French people 'have' feelings and states. You don't 'are' hungry — you 'have' hunger!"
          },
        ],
        exercises: [
          { type: "fill-blank", question: "J'___ faim. (I am hungry)", answer: "ai", hint: "Avoir with 'je'" },
          { type: "multiple-choice", question: "'Elle a 20 ans' means:", options: ["She has 20 items", "She is 20 years old", "She wants 20", "She ate 20"], answer: "She is 20 years old" },
          { type: "fill-blank", question: "Vous ___ raison. (You are right)", answer: "avez" },
          { type: "translate", question: "How do you say 'I am cold' in French?", answer: "J'ai froid" },
        ],
      },
    ],
  },
  {
    id: "present-tense",
    title: "Present Tense (-er verbs)",
    description: "Talk about what you do every day with regular -er verbs",
    emoji: "🏃",
    requiredTopicId: "avoir-verb",
    lessons: [
      {
        id: "er-verbs",
        title: "Regular -er Verbs",
        titleFr: "Les verbes en -er",
        description: "The largest and most regular verb group",
        emoji: "🏃",
        type: "grammar",
        content: [
          {
            heading: "The -er Verb Pattern",
            body: "About 80% of French verbs end in -er and follow this pattern. Drop the -er and add endings:",
            table: {
              columns: ["Pronoun", "Ending", "Parler (to speak)"],
              rows: [
                ["je", "-e", "je parle"],
                ["tu", "-es", "tu parles"],
                ["il/elle/on", "-e", "il parle"],
                ["nous", "-ons", "nous parlons"],
                ["vous", "-ez", "vous parlez"],
                ["ils/elles", "-ent", "ils parlent"],
              ],
            },
            tip: "je, tu, il, ils forms all SOUND THE SAME (parl). The -e, -es, -ent endings are silent! Only nous (-ons) and vous (-ez) sound different."
          },
          {
            heading: "Essential -er Verbs",
            body: "Learn these common verbs — they all follow the same pattern!",
            examples: [
              { fr: "parler", en: "to speak" },
              { fr: "manger", en: "to eat" },
              { fr: "habiter", en: "to live (somewhere)" },
              { fr: "travailler", en: "to work" },
              { fr: "aimer", en: "to love / to like" },
              { fr: "regarder", en: "to watch / to look at" },
              { fr: "écouter", en: "to listen" },
              { fr: "chercher", en: "to look for / to search" },
              { fr: "donner", en: "to give" },
              { fr: "jouer", en: "to play" },
            ],
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Je ___ français. (I speak French — parler)", answer: "parle" },
          { type: "fill-blank", question: "Nous ___ à Paris. (We live in Paris — habiter)", answer: "habitons" },
          { type: "multiple-choice", question: "Which ending is for 'vous'?", options: ["-e", "-ons", "-ez", "-ent"], answer: "-ez" },
          { type: "fill-blank", question: "Elle ___ la musique. (She listens to music — écouter)", answer: "écoute" },
        ],
      },
    ],
  },

  // ── UNIT 6: DESCRIBING YOUR WORLD ──
  {
    id: "adjectives",
    title: "Adjectives & Descriptions",
    description: "Describe people, places, and things in French",
    emoji: "🎨",
    requiredTopicId: "present-tense",
    lessons: [
      {
        id: "adjectives-basics",
        title: "How Adjectives Work",
        titleFr: "Les adjectifs",
        description: "French adjectives change based on gender and number",
        emoji: "🎨",
        type: "grammar",
        content: [
          {
            heading: "Adjectives Agree with Nouns",
            body: "In French, adjectives must match the gender and number of the noun they describe:",
            table: {
              columns: ["", "Masculine", "Feminine"],
              rows: [
                ["Singular", "grand (tall)", "grande"],
                ["Plural", "grands", "grandes"],
                ["Singular", "petit (small)", "petite"],
                ["Plural", "petits", "petites"],
              ],
            },
            tip: "Basic rule: add -e for feminine, add -s for plural, add -es for feminine plural."
          },
          {
            heading: "Common Adjectives",
            body: "Learn these essential descriptive words:",
            examples: [
              { fr: "grand(e) / petit(e)", en: "big, tall / small, short" },
              { fr: "bon(ne) / mauvais(e)", en: "good / bad" },
              { fr: "beau (belle) / laid(e)", en: "beautiful / ugly" },
              { fr: "jeune / vieux (vieille)", en: "young / old" },
              { fr: "nouveau (nouvelle)", en: "new" },
              { fr: "chaud(e) / froid(e)", en: "hot / cold" },
              { fr: "facile / difficile", en: "easy / difficult" },
              { fr: "content(e) / triste", en: "happy / sad" },
            ],
          },
          {
            heading: "Position of Adjectives",
            body: "Most French adjectives come AFTER the noun (opposite of English!):",
            examples: [
              { fr: "une voiture rouge", en: "a red car (not 'une rouge voiture')" },
              { fr: "un homme intelligent", en: "an intelligent man" },
              { fr: "EXCEPTIONS: un grand homme", en: "a great man (BANGS adjectives come before)" },
            ],
            tip: "BANGS = Beauty, Age, Number, Goodness, Size. These adjectives go BEFORE the noun: beau, jeune, trois, bon, grand."
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Une ___ fille (a small girl — petit)", answer: "petite", hint: "Feminine form" },
          { type: "multiple-choice", question: "Where do most French adjectives go?", options: ["Before the noun", "After the noun", "Either position", "At the end of sentence"], answer: "After the noun" },
          { type: "multiple-choice", question: "The feminine of 'beau' is:", options: ["beaue", "belle", "beaux", "beau"], answer: "belle" },
        ],
      },
    ],
  },
  {
    id: "food-drinks",
    title: "Food & Drinks",
    description: "Order at a restaurant, shop at a market, talk about meals",
    emoji: "🍽️",
    requiredTopicId: "adjectives",
    lessons: [
      {
        id: "food-basics",
        title: "Common Food & Drinks",
        titleFr: "La nourriture et les boissons",
        description: "Essential food vocabulary",
        emoji: "🥐",
        type: "vocabulary",
        content: [
          {
            heading: "Food (La nourriture)",
            body: "Essential food words you'll need in France:",
            examples: [
              { fr: "le pain", en: "bread" },
              { fr: "le fromage", en: "cheese" },
              { fr: "la viande", en: "meat" },
              { fr: "le poulet", en: "chicken" },
              { fr: "le poisson", en: "fish" },
              { fr: "les légumes (m.)", en: "vegetables" },
              { fr: "les fruits (m.)", en: "fruits" },
              { fr: "le riz", en: "rice" },
              { fr: "les pâtes (f.)", en: "pasta" },
              { fr: "un oeuf", en: "an egg" },
              { fr: "la soupe", en: "soup" },
              { fr: "la salade", en: "salad" },
            ],
          },
          {
            heading: "Drinks (Les boissons)",
            body: "What would you like to drink?",
            examples: [
              { fr: "l'eau (f.)", en: "water" },
              { fr: "le café", en: "coffee" },
              { fr: "le thé", en: "tea" },
              { fr: "le jus (d'orange)", en: "(orange) juice" },
              { fr: "le vin (rouge / blanc)", en: "wine (red / white)" },
              { fr: "la bière", en: "beer" },
              { fr: "le lait", en: "milk" },
            ],
          },
          {
            heading: "At the Restaurant",
            body: "Useful phrases for ordering:",
            examples: [
              { fr: "Je voudrais...", en: "I would like..." },
              { fr: "L'addition, s'il vous plaît", en: "The bill, please" },
              { fr: "C'est délicieux !", en: "It's delicious!" },
              { fr: "Je suis végétarien(ne)", en: "I am vegetarian" },
              { fr: "Sans gluten, s'il vous plaît", en: "Gluten-free, please" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "How do you say 'bread' in French?", answer: "le pain" },
          { type: "multiple-choice", question: "'Le poisson' means:", options: ["Chicken", "Poison", "Fish", "Pork"], answer: "Fish" },
          { type: "fill-blank", question: "Je voudrais un ___ au lait. (I'd like a coffee with milk)", answer: "café" },
          { type: "multiple-choice", question: "How do you ask for the bill?", options: ["Le menu, s'il vous plaît", "L'addition, s'il vous plaît", "La carte, s'il vous plaît", "Le prix, s'il vous plaît"], answer: "L'addition, s'il vous plaît" },
        ],
      },
    ],
  },

  // ── UNIT 7: GETTING AROUND ──
  {
    id: "directions-places",
    title: "Directions & Places",
    description: "Navigate a French city and find what you need",
    emoji: "🗺️",
    requiredTopicId: "food-drinks",
    lessons: [
      {
        id: "places-city",
        title: "Places in the City",
        titleFr: "Les lieux en ville",
        description: "Where things are and how to get there",
        emoji: "🏙️",
        type: "vocabulary",
        content: [
          {
            heading: "Places",
            body: "Important places you'll need to find:",
            examples: [
              { fr: "la gare", en: "train station" },
              { fr: "l'aéroport (m.)", en: "airport" },
              { fr: "l'hôtel (m.)", en: "hotel" },
              { fr: "le restaurant", en: "restaurant" },
              { fr: "le supermarché", en: "supermarket" },
              { fr: "la pharmacie", en: "pharmacy" },
              { fr: "l'hôpital (m.)", en: "hospital" },
              { fr: "la banque", en: "bank" },
              { fr: "la poste", en: "post office" },
              { fr: "la boulangerie", en: "bakery" },
              { fr: "le musée", en: "museum" },
            ],
          },
          {
            heading: "Asking & Giving Directions",
            body: "How to find your way:",
            examples: [
              { fr: "Où est... ?", en: "Where is...?" },
              { fr: "Allez tout droit", en: "Go straight ahead" },
              { fr: "Tournez à gauche", en: "Turn left" },
              { fr: "Tournez à droite", en: "Turn right" },
              { fr: "C'est à côté de...", en: "It's next to..." },
              { fr: "C'est en face de...", en: "It's across from..." },
              { fr: "C'est loin / près", en: "It's far / close" },
              { fr: "À cinq minutes à pied", en: "Five minutes on foot" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "How do you ask 'Where is the train station?'", answer: "Où est la gare ?" },
          { type: "multiple-choice", question: "'Tournez à gauche' means:", options: ["Turn right", "Turn left", "Go straight", "Go back"], answer: "Turn left" },
          { type: "fill-blank", question: "La ___ sells bread and pastries", answer: "boulangerie" },
        ],
      },
    ],
  },
  {
    id: "time-days",
    title: "Time, Days & Dates",
    description: "Tell time, talk about your schedule, and make plans",
    emoji: "📅",
    requiredTopicId: "directions-places",
    lessons: [
      {
        id: "time-telling",
        title: "Telling Time & Days",
        titleFr: "L'heure et les jours",
        description: "Hours, days of the week, and months",
        emoji: "🕐",
        type: "vocabulary",
        content: [
          {
            heading: "Telling Time",
            body: "French uses a 24-hour clock officially, but 12-hour in casual speech:",
            examples: [
              { fr: "Quelle heure est-il ?", en: "What time is it?" },
              { fr: "Il est une heure", en: "It is 1 o'clock" },
              { fr: "Il est deux heures", en: "It is 2 o'clock" },
              { fr: "Il est midi", en: "It is noon" },
              { fr: "Il est minuit", en: "It is midnight" },
              { fr: "Il est trois heures et quart", en: "It is 3:15 (quarter past)" },
              { fr: "Il est trois heures et demie", en: "It is 3:30 (half past)" },
              { fr: "Il est quatre heures moins le quart", en: "It is 3:45 (quarter to four)" },
            ],
          },
          {
            heading: "Days of the Week",
            body: "Les jours de la semaine (not capitalized in French!):",
            examples: [
              { fr: "lundi", en: "Monday" },
              { fr: "mardi", en: "Tuesday" },
              { fr: "mercredi", en: "Wednesday" },
              { fr: "jeudi", en: "Thursday" },
              { fr: "vendredi", en: "Friday" },
              { fr: "samedi", en: "Saturday" },
              { fr: "dimanche", en: "Sunday" },
            ],
            tip: "Days are NOT capitalized in French. The week starts on Monday (lundi) in France."
          },
          {
            heading: "Months of the Year",
            body: "Les mois de l'année (also not capitalized):",
            examples: [
              { fr: "janvier, février, mars", en: "January, February, March" },
              { fr: "avril, mai, juin", en: "April, May, June" },
              { fr: "juillet, août, septembre", en: "July, August, September" },
              { fr: "octobre, novembre, décembre", en: "October, November, December" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "How do you say 'Wednesday' in French?", options: ["mardi", "mercredi", "vendredi", "dimanche"], answer: "mercredi" },
          { type: "translate", question: "How do you ask 'What time is it?'", answer: "Quelle heure est-il ?" },
          { type: "multiple-choice", question: "'Il est trois heures et demie' means:", options: ["3:00", "3:15", "3:30", "3:45"], answer: "3:30" },
          { type: "fill-blank", question: "The first day of the French week is ___", answer: "lundi" },
        ],
      },
    ],
  },

  // ── UNIT 8: DEEPER CONVERSATIONS ──
  {
    id: "negation",
    title: "Negation (Saying No)",
    description: "Learn to say what you don't do, don't have, and don't want",
    emoji: "🚫",
    requiredTopicId: "time-days",
    lessons: [
      {
        id: "negation-basics",
        title: "Ne...Pas and Beyond",
        titleFr: "La négation",
        description: "How to make any sentence negative",
        emoji: "🚫",
        type: "grammar",
        content: [
          {
            heading: "Basic Negation: Ne...Pas",
            body: "To make a sentence negative, wrap the verb in 'ne...pas':",
            examples: [
              { fr: "Je parle → Je ne parle pas", en: "I speak → I don't speak" },
              { fr: "Il est content → Il n'est pas content", en: "He is happy → He is not happy" },
              { fr: "Nous avons → Nous n'avons pas", en: "We have → We don't have" },
            ],
            tip: "In casual speech, French people often drop the 'ne': 'Je parle pas', 'C'est pas bon'. But always write both parts!"
          },
          {
            heading: "Other Negation Words",
            body: "French has specific negation words for different meanings:",
            examples: [
              { fr: "ne...jamais", en: "never — Je ne mange jamais de viande" },
              { fr: "ne...rien", en: "nothing — Je ne vois rien (I see nothing)" },
              { fr: "ne...personne", en: "nobody — Je ne connais personne" },
              { fr: "ne...plus", en: "no longer — Je ne fume plus (I no longer smoke)" },
            ],
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Je ___ parle ___ français. (I don't speak French)", answer: "ne...pas", hint: "Wrap the verb" },
          { type: "multiple-choice", question: "'Je ne mange jamais de viande' means:", options: ["I always eat meat", "I never eat meat", "I sometimes eat meat", "I like meat"], answer: "I never eat meat" },
          { type: "translate", question: "Translate: 'I don't have time'", answer: "Je n'ai pas le temps" },
        ],
      },
    ],
  },
  {
    id: "questions",
    title: "Asking Questions",
    description: "Who, what, where, when, why, how — ask about anything!",
    emoji: "❓",
    requiredTopicId: "negation",
    lessons: [
      {
        id: "questions-basics",
        title: "Question Words & Patterns",
        titleFr: "Les questions",
        description: "Three ways to ask questions in French",
        emoji: "❓",
        type: "grammar",
        content: [
          {
            heading: "Question Words",
            body: "The essential question words:",
            examples: [
              { fr: "Qui ?", en: "Who?" },
              { fr: "Quoi ? / Que ?", en: "What?" },
              { fr: "Où ?", en: "Where?" },
              { fr: "Quand ?", en: "When?" },
              { fr: "Pourquoi ?", en: "Why?" },
              { fr: "Comment ?", en: "How?" },
              { fr: "Combien ?", en: "How much / How many?" },
              { fr: "Quel(le) ?", en: "Which?" },
            ],
          },
          {
            heading: "Three Ways to Ask Questions",
            body: "French offers three ways to turn a statement into a question:",
            examples: [
              { fr: "Tu parles français ?", en: "Rising intonation (casual, most common)" },
              { fr: "Est-ce que tu parles français ?", en: "Est-ce que + statement (standard)" },
              { fr: "Parles-tu français ?", en: "Inversion (formal, written)" },
            ],
            tip: "In everyday French, just raise your voice at the end. 'Est-ce que' is a safe middle ground. Inversion is mostly for writing."
          },
          {
            heading: "Common Questions",
            body: "Questions you'll use every day:",
            examples: [
              { fr: "C'est quoi ? / Qu'est-ce que c'est ?", en: "What is it / What is this?" },
              { fr: "Où est... ?", en: "Where is...?" },
              { fr: "Pourquoi pas ?", en: "Why not?" },
              { fr: "Comment ça s'écrit ?", en: "How do you spell it?" },
              { fr: "À quelle heure ?", en: "At what time?" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "'Pourquoi' means:", options: ["When", "Where", "Why", "Who"], answer: "Why" },
          { type: "multiple-choice", question: "The most casual way to ask a question is:", options: ["Inversion", "Est-ce que", "Rising intonation", "Using 'non'"], answer: "Rising intonation" },
          { type: "translate", question: "How do you ask 'Where is the museum?'", answer: "Où est le musée ?" },
          { type: "fill-blank", question: "___ est-ce que tu habites ? (Where do you live?)", answer: "Où", hint: "Question word for 'where'" },
        ],
      },
    ],
  },

  // ── UNIT 9: CONNECTING EVERYTHING ──
  {
    id: "past-tense",
    title: "Talking About the Past",
    description: "Tell stories about what happened — passé composé basics",
    emoji: "⏪",
    requiredTopicId: "questions",
    lessons: [
      {
        id: "passe-compose",
        title: "Passé Composé",
        titleFr: "Le passé composé",
        description: "The most common past tense",
        emoji: "⏪",
        type: "grammar",
        content: [
          {
            heading: "How It Works",
            body: "The passé composé uses a helper verb (avoir or être) + past participle:",
            examples: [
              { fr: "J'ai mangé", en: "I ate / I have eaten" },
              { fr: "Tu as parlé", en: "You spoke" },
              { fr: "Il a travaillé", en: "He worked" },
              { fr: "Nous avons fini", en: "We finished" },
              { fr: "Vous avez vu", en: "You saw" },
              { fr: "Elles ont pris", en: "They took" },
            ],
            tip: "Formula: Subject + avoir/être + past participle. Most verbs use 'avoir'. A small group of movement/state verbs use 'être'."
          },
          {
            heading: "Past Participles",
            body: "How to form past participles:",
            table: {
              columns: ["Verb type", "Rule", "Example"],
              rows: [
                ["-er verbs", "Drop -er, add -é", "parler → parlé"],
                ["-ir verbs", "Drop -ir, add -i", "finir → fini"],
                ["-re verbs", "Drop -re, add -u", "vendre → vendu"],
                ["Irregular", "Must memorize!", "faire → fait, voir → vu, prendre → pris"],
              ],
            },
          },
          {
            heading: "Verbs That Use Être",
            body: "These verbs of movement/change use être instead of avoir (the past participle agrees with the subject!):",
            examples: [
              { fr: "Je suis allé(e)", en: "I went" },
              { fr: "Elle est venue", en: "She came" },
              { fr: "Nous sommes partis", en: "We left" },
              { fr: "Ils sont arrivés", en: "They arrived" },
            ],
            tip: "DR MRS VANDERTRAMP: Devenir, Revenir, Monter, Rester, Sortir, Venir, Aller, Naître, Descendre, Entrer, Retourner, Tomber, Rentrer, Arriver, Mourir, Partir."
          },
        ],
        exercises: [
          { type: "fill-blank", question: "J'___ mangé au restaurant. (I ate at the restaurant)", answer: "ai" },
          { type: "multiple-choice", question: "The past participle of 'parler' is:", options: ["parlé", "parli", "parlu", "parlais"], answer: "parlé" },
          { type: "fill-blank", question: "Elle ___ allée à Paris. (She went to Paris — uses être)", answer: "est" },
          { type: "multiple-choice", question: "Most verbs form passé composé with:", options: ["être", "avoir", "faire", "aller"], answer: "avoir" },
        ],
      },
    ],
  },
  {
    id: "future-plans",
    title: "Talking About the Future",
    description: "Express plans, intentions, and what will happen",
    emoji: "⏩",
    requiredTopicId: "past-tense",
    lessons: [
      {
        id: "near-future",
        title: "Near Future (aller + infinitive)",
        titleFr: "Le futur proche",
        description: "The easiest way to talk about the future",
        emoji: "⏩",
        type: "grammar",
        content: [
          {
            heading: "The Near Future: Aller + Infinitive",
            body: "The easiest way to express future plans. Just conjugate 'aller' (to go) and add any verb in infinitive form!",
            table: {
              columns: ["Pronoun", "Aller", "Example"],
              rows: [
                ["je", "vais", "Je vais manger — I'm going to eat"],
                ["tu", "vas", "Tu vas partir — You're going to leave"],
                ["il/elle", "va", "Elle va travailler — She's going to work"],
                ["nous", "allons", "Nous allons voyager — We're going to travel"],
                ["vous", "allez", "Vous allez aimer — You're going to love"],
                ["ils/elles", "vont", "Ils vont arriver — They're going to arrive"],
              ],
            },
            tip: "This is used WAY more than the 'real' future tense in everyday French. Master this and you can talk about any future event!"
          },
          {
            heading: "Useful Future Expressions",
            body: "Combine with time words:",
            examples: [
              { fr: "Je vais manger ce soir", en: "I'm going to eat tonight" },
              { fr: "Demain, on va visiter Paris", en: "Tomorrow, we're going to visit Paris" },
              { fr: "Qu'est-ce que tu vas faire ?", en: "What are you going to do?" },
              { fr: "Je vais apprendre le français !", en: "I'm going to learn French!" },
            ],
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Je ___ manger. (I'm going to eat)", answer: "vais" },
          { type: "translate", question: "Translate: 'We are going to travel'", answer: "Nous allons voyager" },
          { type: "fill-blank", question: "Elle ___ partir demain. (She's going to leave tomorrow)", answer: "va" },
          { type: "multiple-choice", question: "The near future formula is:", options: ["avoir + past participle", "aller + infinitive", "être + adjective", "faire + noun"], answer: "aller + infinitive" },
        ],
      },
    ],
  },
];

// Flatten all lessons for easy access
export function getAllLessons(): (Lesson & { topicId: string; topicTitle: string })[] {
  return LEARNING_PATH.flatMap((topic) =>
    topic.lessons.map((lesson) => ({
      ...lesson,
      topicId: topic.id,
      topicTitle: topic.title,
    }))
  );
}

export function getLessonById(lessonId: string): (Lesson & { topicId: string; topicTitle: string }) | undefined {
  return getAllLessons().find((l) => l.id === lessonId);
}

export function getTopicById(topicId: string): Topic | undefined {
  return LEARNING_PATH.find((t) => t.id === topicId);
}
