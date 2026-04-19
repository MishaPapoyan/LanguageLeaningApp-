/**
 * UI translation system — English (default) and Armenian.
 * The user's `nativeLanguage` field determines the UI language.
 */

export type Locale = "en" | "hy";

const en = {
  // Nav
  nav_home: "Home",
  nav_learn: "Learn",
  nav_stories: "Stories",
  nav_tutor: "Tutor",
  nav_games: "Games",
  nav_practice: "Practice",
  nav_writing: "Writing",
  nav_dictionary: "Dictionary",
  nav_myWords: "My Words",
  nav_settings: "Settings",
  nav_progress: "Progress",
  nav_analytics: "Analytics",
  nav_signOut: "Sign out",

  // Auth
  auth_welcome: "Welcome back",
  auth_subtitle: "Enter your details to continue learning",
  auth_email: "Email",
  auth_password: "Password",
  auth_signIn: "Sign in",
  auth_signingIn: "Signing in...",
  auth_demoBtn: "Try demo account — one click",
  auth_demoLoading: "Loading demo...",
  auth_noAccount: "Don't have an account?",
  auth_signUpFree: "Sign up free",
  auth_hasAccount: "Already learning?",
  auth_logIn: "Log in",
  auth_createAccount: "Create account",
  auth_creatingAccount: "Creating account...",
  auth_iAmA: "I am a",
  auth_student: "Student",
  auth_teacher: "Teacher",
  auth_name: "Name",
  auth_namePlaceholder: "Your name",
  auth_emailPlaceholder: "you@example.com",
  auth_passwordPlaceholder: "At least 6 characters",
  auth_passwordEnter: "Enter your password",
  auth_iWantToLearn: "I want to learn",
  auth_or: "OR SIGN IN",
  auth_getStarted: "Get started",
  auth_joinTitle: "Join LangCraft",
  auth_joinSubtitle: "Create your account and start learning today",
  auth_invalidCredentials: "Invalid email or password",
  auth_registrationFailed: "Registration failed",
  auth_startFree: "Start free",

  // Landing page
  landing_tagline: "For absolute beginners & returners",
  landing_headline: "Learn languages,",
  landing_headline2: "naturally.",
  landing_description: "Stories, AI conversations, and games — no textbook, no memorisation. Just start talking.",
  landing_startFree: "Start learning free",
  landing_hasAccount: "I have an account",
  landing_learners: "2,400+ learners",
  landing_storiesCount: "50+ stories",
  landing_free: "Free forever",
  landing_howItWorks: "How it works",
  landing_threeSteps: "Three steps to fluency",
  landing_everything: "Everything you need",
  landing_sixWays: "Six ways to learn",
  landing_readStories: "Read stories",
  landing_readStoriesDesc: "Short stories with tap-to-translate. Learn words in context, not from lists.",
  landing_talkAI: "Talk with AI",
  landing_talkAIDesc: "Order coffee, ask directions, chat freely. The AI tutor corrects you gently in real-time.",
  landing_playRemember: "Play & remember",
  landing_playRememberDesc: "Flashcards, matching games, and a memory palace. Your brain does the rest.",
  landing_loved: "Loved by 2,400+ learners.",
  landing_readyToSpeak: "Ready to speak?",
  landing_joinThousands: "Join thousands of learners who ditched the textbook and actually started talking.",
  landing_startLearningFree: "Start learning for free",
  landing_noCreditCard: "Free — no credit card needed",
  landing_copyright: "© 2026 LangCraft. All rights reserved.",
  landing_signUp: "Sign up",
  landing_50stories: "50+ immersive stories",
  landing_aiTutor: "AI conversation tutor",
  landing_vocabGames: "Vocab games & flashcards",
  landing_bienvenue: "Welcome!",
  landing_journeyContinues: "Your learning journey continues here.",
  landing_startSpeaking: "Start speaking from day one.",
  landing_upAndRunning: "Up and running in 60 seconds",
  landing_noCreditCardRequired: "No credit card required",
  landing_freeForever: "Free forever — seriously",
  landing_naturalWay: "The most natural way I've ever learned a language.",
  landing_topApp: "#1 language learning app",

  // Settings
  settings_title: "Settings",
  settings_subtitle: "Manage your profile and preferences",
  settings_profile: "Profile",
  settings_displayName: "DISPLAY NAME",
  settings_nativeLang: "NATIVE LANGUAGE",
  settings_learning: "LEARNING",
  settings_save: "Save changes",
  settings_saving: "Saving...",
  settings_saved: "Saved!",
  settings_profileUpdated: "Profile updated!",
  settings_yourStats: "Your Stats",
  settings_earnedBadges: "Earned Badges",
  settings_allBadges: "All badges",
  settings_noBadges: "No badges yet — keep learning to earn them!",
  settings_quickLinks: "Quick Links",
  settings_chooseAvatar: "CHOOSE AVATAR",
  settings_level: "Level",
  settings_streak: "Streak",
  settings_days: "days",
  settings_words: "Words",
  settings_storiesStat: "Stories",
  settings_gamesStat: "Games",
  settings_xp: "XP",

  // Dictionary
  dict_title: "Dictionary",
  dict_subtitle: "Browse all vocabulary. Save words to practice them later.",
  dict_search: "Search word or translation...",
  dict_allCategories: "All categories",
  dict_allLevels: "All levels",
  dict_beginner: "Beginner",
  dict_intermediate: "Intermediate",
  dict_advanced: "Advanced",

  // Games
  games_title: "Games",
  games_subtitle: "Play & learn — earn XP for every game you finish",
  games_dailyChallenge: "Daily Challenge",
  games_dailyDesc: "Complete any game today for double XP — limited time!",
  games_playNow: "Play now",
  games_bestScores: "Your best scores",
  games_notPlayed: "Not played yet",
  games_xpFromGames: "XP from games",
  games_gamesPlayed: "Games played",
  games_flashcards: "Flashcards",
  games_wordMatch: "Word Match",
  games_memoryPalace: "Memory Palace",
  games_wordScramble: "Word Scramble",
  games_fillBlank: "Fill the Blank",
  games_2xToday: "2x XP today",

  // Stories
  stories_title: "Stories",
  stories_subtitle_tpl: "Immerse yourself in {lang} through rich, interactive stories.",

  // Tutor
  tutor_title: "AI Tutor",
  tutor_subtitle: "Practice with an AI conversation partner",

  // Writing
  writing_title: "Writing Practice",
  writing_prompts: "Prompts",
  writing_history: "History",
  writing_placeholder_tpl: "Write in {lang} here...",
  writing_submit: "Get feedback",

  // Review
  review_title: "Spaced Review",
  review_empty: "No words due for review. Save words from the dictionary to start!",

  // Pronunciation
  pronunciation_title: "Pronunciation",
  pronunciation_tip: "Click a word to hear it, then hit Record to compare your pronunciation.",
  pronunciation_howTo: "How to practice:",
  pronunciation_record: "Record yourself",
  pronunciation_stop: "Stop",
  pronunciation_playback: "Play back",
  pronunciation_compare: "Compare: does it sound like the native pronunciation above?",
  pronunciation_yourPronunciation: "Your pronunciation",
  pronunciation_category: "Category",
  pronunciation_allCategories: "All categories",
  pronunciation_speed: "Speed",
  pronunciation_slow: "Slow",
  pronunciation_normal: "Normal",
  pronunciation_fast: "Fast",
  pronunciation_word: "Word",
  pronunciation_example: "Example",
  pronunciation_recording: "Recording...",

  // Home
  home_welcome_tpl: "Welcome back, {name}!",
  home_continueJourney: "Ready to continue your learning journey?",

  // Common
  common_save: "Save",
  common_cancel: "Cancel",
  common_loading: "Loading...",
  common_error: "Something went wrong",
  common_tryAgain: "Try again",
  common_noResults: "No results found",
};

const hy: typeof en = {
  // Nav
  nav_home: "\u0533\u056c\u056d\u0561\u057e\u0578\u0580",
  nav_learn: "\u054d\u0578\u057e\u0578\u0580\u0565\u056c",
  nav_stories: "\u054a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580",
  nav_tutor: "\u0544\u0561\u057d\u0576\u0561\u0563\u0565\u057f",
  nav_games: "\u053d\u0561\u0572\u0565\u0580",
  nav_practice: "\u054a\u0580\u0561\u056f\u057f\u056b\u056f\u0561",
  nav_writing: "Writing",
  nav_dictionary: "\u0532\u0561\u057c\u0561\u0580\u0561\u0576",
  nav_myWords: "\u053b\u0574 \u0562\u0561\u057c\u0565\u0580\u0568",
  nav_settings: "\u053f\u0561\u0580\u0563\u0561\u057e\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580",
  nav_progress: "\u0540\u0561\u057b\u0578\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  nav_analytics: "\u054e\u0565\u0580\u056c\u0578\u0582\u056e\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  nav_signOut: "\u0534\u0578\u0582\u0580\u057d \u0563\u0561\u056c",

  // Auth
  auth_welcome: "\u0532\u0561\u0580\u056b \u0563\u0561\u056c\u0578\u0582\u057d\u057f",
  auth_subtitle: "\u0544\u0578\u0582\u057f\u0584\u0561\u0563\u0580\u0565\u0584 \u0571\u0565\u0580 \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580\u0568\u055d \u0578\u0580\u057a\u0565\u057d\u0566\u056b \u0577\u0561\u0580\u0578\u0582\u0576\u0561\u056f\u0565\u0584 \u057d\u0578\u057e\u0578\u0580\u0565\u056c\u0568",
  auth_email: "\u0537\u056c. \u0583\u0578\u057d\u057f",
  auth_password: "\u0533\u0561\u0572\u057f\u0576\u0561\u0562\u0561\u057c",
  auth_signIn: "\u0544\u0578\u0582\u057f\u0584 \u0563\u0578\u0580\u056e\u0565\u056c",
  auth_signingIn: "\u0544\u0578\u0582\u057f\u0584 \u0565\u0576\u0584 \u0563\u0578\u0580\u056e\u0578\u0582\u0574...",
  auth_demoBtn: "\u0553\u0578\u0580\u0571\u0561\u0580\u056f\u0561\u0575\u056b\u0576 \u0570\u0561\u0577\u056b\u057e \u2014 \u0574\u0565\u056f \u057d\u0565\u0572\u0574\u0578\u0582\u0574",
  auth_demoLoading: "\u0532\u0565\u057c\u0576\u057e\u0578\u0582\u0574 \u0567...",
  auth_noAccount: "\u0540\u0561\u0577\u056b\u057e \u0579\u0578\u0582\u0576\u0565\u055e\u0584\u055f",
  auth_signUpFree: "\u0533\u0580\u0561\u0576\u057e\u0565\u0584 \u0561\u0576\u057e\u0573\u0561\u0580",
  auth_hasAccount: "\u0531\u0580\u0564\u0565\u0576 \u057d\u0578\u057e\u0578\u0580\u0578\u0582\u055e\u0574 \u0565\u0584\u055f",
  auth_logIn: "\u0544\u0578\u0582\u057f\u0584 \u0563\u0578\u0580\u056e\u0565\u056c",
  auth_createAccount: "\u054d\u057f\u0565\u0572\u056e\u0565\u056c \u0570\u0561\u0577\u056b\u057e",
  auth_creatingAccount: "\u054d\u057f\u0565\u0572\u056e\u057e\u0578\u0582\u0574 \u0567...",
  auth_iAmA: "\u0535\u057d",
  auth_student: "\u054d\u0578\u057e\u0578\u0580\u0578\u0572",
  auth_teacher: "\u0548\u0582\u057d\u0578\u0582\u0581\u056b\u0579",
  auth_name: "\u0531\u0576\u0578\u0582\u0576",
  auth_namePlaceholder: "\u0541\u0565\u0580 \u0561\u0576\u0578\u0582\u0576\u0568",
  auth_emailPlaceholder: "you@example.com",
  auth_passwordPlaceholder: "\u0531\u057c\u0576\u057e\u0561\u0566\u0576 6 \u0576\u056b\u0577",
  auth_passwordEnter: "\u0544\u0578\u0582\u057f\u0584\u0561\u0563\u0580\u0565\u0584 \u0563\u0561\u0572\u057f\u0576\u0561\u0562\u0561\u057c\u0568",
  auth_iWantToLearn: "\u0548\u0582\u0566\u0578\u0582\u0574 \u0565\u0574 \u057d\u0578\u057e\u0578\u0580\u0565\u056c",
  auth_or: "\u053f\u0531\u0544 \u0544\u0548\u0552\u054f\u0554 \u0533\u0548\u0550\u053e\u0535\u053c",
  auth_getStarted: "\u054d\u056f\u057d\u0565\u056c",
  auth_joinTitle: "\u0544\u056b\u0561\u0581\u0565\u0584 LangCraft-\u056b\u0576",
  auth_joinSubtitle: "\u054d\u057f\u0565\u0572\u056e\u0565\u0584 \u0570\u0561\u0577\u056b\u057e \u0587 \u057d\u056f\u057d\u0565\u0584 \u057d\u0578\u057e\u0578\u0580\u0565\u056c \u0561\u0575\u057d\u0585\u0580",
  auth_invalidCredentials: "\u054d\u056d\u0561\u056c \u0567\u056c. \u0583\u0578\u057d\u057f \u056f\u0561\u0574 \u0563\u0561\u0572\u057f\u0576\u0561\u0562\u0561\u057c",
  auth_registrationFailed: "\u0533\u0580\u0561\u0576\u0581\u0578\u0582\u0574\u0568 \u0571\u0561\u056d\u0578\u0572\u057e\u0565\u0581",
  auth_startFree: "\u054d\u056f\u057d\u0565\u056c \u0561\u0576\u057e\u0573\u0561\u0580",

  // Landing
  landing_tagline: "\u054d\u056f\u057d\u0576\u0561\u056f\u0576\u0565\u0580\u056b \u0587 \u057e\u0565\u0580\u0561\u0564\u0561\u0580\u0571\u0578\u0572\u0576\u0565\u0580\u056b \u0570\u0561\u0574\u0561\u0580",
  landing_headline: "\u054d\u0578\u057e\u0578\u0580\u0565\u0584 \u056c\u0565\u0566\u0578\u0582\u0576\u0565\u0580\u055d",
  landing_headline2: "\u0562\u0576\u0561\u056f\u0561\u0576\u0578\u0580\u0565\u0576:",
  landing_description: "\u054a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580\u055d AI \u0566\u0580\u0578\u0582\u0575\u0581\u0576\u0565\u0580 \u0587 \u056d\u0561\u0572\u0565\u0580 \u2014 \u0561\u057c\u0561\u0576\u0581 \u0564\u0561\u057d\u0561\u0563\u0580\u0584\u056b\u055d \u0561\u057c\u0561\u0576\u0581 \u0561\u0576\u0563\u056b\u0580: \u054a\u0561\u0580\u0566\u0561\u057a\u0565\u057d \u057d\u056f\u057d\u0565\u0584 \u056d\u0578\u057d\u0565\u056c:",
  landing_startFree: "\u054d\u056f\u057d\u0565\u0584 \u057d\u0578\u057e\u0578\u0580\u0565\u056c \u0561\u0576\u057e\u0573\u0561\u0580",
  landing_hasAccount: "\u0548\u0582\u0576\u0565\u0574 \u0570\u0561\u0577\u056b\u057e",
  landing_learners: "2,400+ \u057d\u0578\u057e\u0578\u0580\u0578\u0572",
  landing_storiesCount: "50+ \u057a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  landing_free: "\u0544\u056b\u0577\u057f \u0561\u0576\u057e\u0573\u0561\u0580",
  landing_howItWorks: "\u053b\u0576\u0579\u057a\u0565\u057d \u0567 \u0561\u0577\u056d\u0561\u057f\u0578\u0582\u0574",
  landing_threeSteps: "\u0535\u0580\u0565\u0584 \u0584\u0561\u0575\u056c \u0564\u0565\u057a\u056b \u057d\u0561\u0570\u0578\u0582\u0576 \u056d\u0578\u057d\u0565\u056c\u0578\u0582",
  landing_everything: "\u0531\u0574\u0565\u0576 \u056b\u0576\u0579\u055d \u056b\u0576\u0579 \u0571\u0565\u0566 \u057a\u0565\u057f\u0584",
  landing_sixWays: "\u054e\u0565\u0581 \u057d\u0578\u057e\u0578\u0580\u0565\u056c\u0578\u0582 \u0565\u0572\u0561\u0576\u0561\u056f",
  landing_readStories: "\u053f\u0561\u0580\u0564\u0561\u0581\u0565\u0584 \u057a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580",
  landing_readStoriesDesc: "\u053f\u0561\u0580\u0573 \u057a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580\u055d \u057d\u0565\u0572\u0574\u0565\u0584-\u0569\u0561\u0580\u0563\u0574\u0561\u0576\u0565\u0584 \u0570\u0561\u0574\u0561\u0580: \u054d\u0578\u057e\u0578\u0580\u0565\u0584 \u0562\u0561\u057c\u0565\u0580\u0568 \u0570\u0561\u0574\u0561\u057f\u0565\u0584\u057d\u057f\u0578\u0582\u0574:",
  landing_talkAI: "\u0541\u0578\u057d\u0565\u0584 AI-\u056b \u0570\u0565\u057f",
  landing_talkAIDesc: "\u054a\u0561\u057f\u057e\u056b\u0580\u0565\u0584 \u057d\u0578\u0582\u0580\u0573\u055d \u0570\u0561\u0580\u0581\u0580\u0565\u0584 \u0573\u0561\u0576\u0561\u057a\u0561\u0580\u0570\u0568\u055d \u0566\u0580\u0578\u0582\u0581\u0565\u0584 \u0561\u0566\u0561\u057f: AI-\u0576 \u0571\u0565\u0566 \u0574\u0565\u0572\u0574 \u0578\u0582\u0572\u0572\u0578\u0582\u0574 \u0567:",
  landing_playRemember: "\u053d\u0561\u0572\u0561\u0581\u0565\u0584 \u0587 \u0570\u056b\u0577\u0565\u0584",
  landing_playRememberDesc: "\u0556\u056c\u0565\u0577\u0584\u0561\u0580\u057f\u0565\u0580\u055d \u0570\u0561\u0574\u0561\u057a\u0561\u057f\u0561\u057d\u056d\u0561\u0576\u0578\u0582\u0569\u0575\u0561\u0576 \u056d\u0561\u0572\u0565\u0580 \u0587 \u0570\u056b\u0577\u0578\u0572\u0578\u0582\u0569\u0575\u0561\u0576 \u057a\u0561\u056c\u0561\u057f: \u0541\u0565\u0580 \u0578\u0582\u0572\u0565\u0572\u0568 \u056f\u0561\u0576\u056b \u0574\u0576\u0561\u0581\u0561\u056e\u0568:",
  landing_loved: "\u054d\u056b\u0580\u057e\u0578\u0582\u0574 \u0567 2,400+ \u057d\u0578\u057e\u0578\u0580\u0578\u0572\u0576\u0565\u0580\u056b \u056f\u0578\u0572\u0574\u056b\u0581:",
  landing_readyToSpeak: "\u054a\u0561\u057f\u0580\u0561\u057d\u057f\u055e \u0565\u0584 \u056d\u0578\u057d\u0565\u056c\u0578\u0582\u055f",
  landing_joinThousands: "\u0544\u056b\u0561\u0581\u0565\u0584 \u0570\u0561\u0566\u0561\u0580\u0561\u057e\u0578\u0580 \u057d\u0578\u057e\u0578\u0580\u0578\u0572\u0576\u0565\u0580\u056b\u0576\u055d \u0578\u057e\u0584\u0565\u0580 \u0569\u0578\u0572\u0565\u0581\u056b\u0576 \u0564\u0561\u057d\u0561\u0563\u056b\u0580\u0584\u0568 \u0587 \u057d\u056f\u057d\u0565\u0581\u056b\u0576 \u056d\u0578\u057d\u0565\u056c:",
  landing_startLearningFree: "\u054d\u056f\u057d\u0565\u0584 \u057d\u0578\u057e\u0578\u0580\u0565\u056c \u0561\u0576\u057e\u0573\u0561\u0580",
  landing_noCreditCard: "\u0531\u0576\u057e\u0573\u0561\u0580 \u2014 \u0584\u0561\u0580\u057f \u0579\u056b \u057a\u0561\u0570\u0561\u0576\u057b\u057e\u0578\u0582\u0574",
  landing_copyright: "\u00a9 2026 LangCraft: \u0532\u0578\u056c\u0578\u0580 \u056b\u0580\u0561\u057e\u0578\u0582\u0576\u0584\u0576\u0565\u0580\u0568 \u057a\u0561\u0577\u057f\u057a\u0561\u0576\u057e\u0561\u056e \u0565\u0576:",
  landing_signUp: "\u0533\u0580\u0561\u0576\u057e\u0565\u056c",
  landing_50stories: "50+ \u0569\u0561\u0569\u0561\u056d\u0578\u0572 \u057a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580",
  landing_aiTutor: "AI \u0566\u0580\u0578\u0582\u0575\u0581\u0561\u056f\u056b\u0581",
  landing_vocabGames: "\u0532\u0561\u057c\u0561\u057a\u0561\u0577\u0561\u0580\u056b \u056d\u0561\u0572\u0565\u0580 \u0587 \u0584\u0561\u0580\u057f\u0565\u0580",
  landing_bienvenue: "\u0532\u0561\u0580\u056b \u0563\u0561\u056c\u0578\u0582\u057d\u057f!",
  landing_journeyContinues: "\u0541\u0565\u0580 \u0578\u0582\u057d\u0578\u0582\u0574\u0576\u0561\u056f\u0561\u0576 \u0573\u0561\u0574\u0583\u0578\u0580\u0564\u0568 \u0577\u0561\u0580\u0578\u0582\u0576\u0561\u056f\u057e\u0578\u0582\u0574 \u0567 \u0561\u0575\u057d\u057f\u0565\u0572:",
  landing_startSpeaking: "\u054d\u056f\u057d\u0565\u0584 \u056d\u0578\u057d\u0565\u056c \u0561\u057c\u0561\u057b\u056b\u0576 \u0585\u0580\u056b\u0581:",
  landing_upAndRunning: "\u054a\u0561\u057f\u0580\u0561\u057d\u057f 60 \u057e\u0561\u0575\u0580\u056f\u0575\u0561\u0576\u0578\u0582\u0574",
  landing_noCreditCardRequired: "\u0554\u0561\u0580\u057f \u0579\u056b \u057a\u0561\u0570\u0561\u0576\u057b\u057e\u0578\u0582\u0574",
  landing_freeForever: "\u0544\u056b\u0577\u057f \u0561\u0576\u057e\u0573\u0561\u0580 \u2014 \u056c\u0578\u0582\u0580\u057b\u0578\u0580\u0565\u0576",
  landing_naturalWay: "\u053c\u0565\u0566\u0578\u0582 \u057d\u0578\u057e\u0578\u0580\u0565\u056c\u0578\u0582 \u0561\u0574\u0565\u0576\u0561\u0562\u0576\u0561\u056f\u0561\u0576 \u0565\u0572\u0561\u0576\u0561\u056f\u0568:",
  landing_topApp: "#1 \u056c\u0565\u0566\u0578\u0582\u0576\u0565\u0580\u056b \u0570\u0561\u057e\u0565\u056c\u057e\u0561\u056e",

  // Settings
  settings_title: "\u053f\u0561\u0580\u0563\u0561\u057e\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580",
  settings_subtitle: "\u053f\u0561\u057c\u0561\u057e\u0561\u0580\u0565\u0584 \u0571\u0565\u0580 \u057a\u0580\u0578\u0586\u056b\u056c\u0568 \u0587 \u0576\u0561\u056d\u0568\u0576\u057f\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580\u0568",
  settings_profile: "\u054a\u0580\u0578\u0586\u056b\u056c",
  settings_displayName: "\u0531\u0546\u0548\u0552\u0546",
  settings_nativeLang: "\u0544\u0531\u0545\u0550\u0535\u0546\u053b \u053c\u0535\u0536\u0548\u0552",
  settings_learning: "\u054d\u0548\u054e\u0548\u0550\u0548\u0552\u0544 \u0535\u0544",
  settings_save: "\u054a\u0561\u0570\u057a\u0561\u0576\u0565\u056c",
  settings_saving: "\u054a\u0561\u0570\u057a\u0561\u0576\u057e\u0578\u0582\u0574 \u0567...",
  settings_saved: "\u054a\u0561\u0570\u057a\u0561\u0576\u057e\u0565\u0581!",
  settings_profileUpdated: "\u054a\u0580\u0578\u0586\u056b\u056c\u0568 \u0569\u0561\u0580\u0574\u0561\u0581\u057e\u0565\u0581!",
  settings_yourStats: "\u0541\u0565\u0580 \u057e\u056b\u0573\u0561\u056f\u0561\u0563\u0580\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568",
  settings_earnedBadges: "\u054e\u0561\u057d\u057f\u0561\u056f\u0561\u056e \u056f\u0580\u056e\u0561\u0576\u056b\u0577\u0576\u0565\u0580",
  settings_allBadges: "\u0532\u0578\u056c\u0578\u0580 \u056f\u0580\u056e\u0561\u0576\u056b\u0577\u0576\u0565\u0580\u0568",
  settings_noBadges: "\u0534\u0565\u057c \u056f\u0580\u056e\u0561\u0576\u056b\u0577\u0576\u0565\u0580 \u0579\u056f\u0561\u0576 \u2014 \u0577\u0561\u0580\u0578\u0582\u0576\u0561\u056f\u0565\u0584 \u057d\u0578\u057e\u0578\u0580\u0565\u056c\u0568\u055d \u057e\u0561\u057d\u057f\u0561\u056f\u0565\u056c\u0578\u0582 \u0570\u0561\u0574\u0561\u0580!",
  settings_quickLinks: "\u0531\u0580\u0561\u0563 \u0570\u0572\u0578\u0582\u0574\u0576\u0565\u0580",
  settings_chooseAvatar: "\u0538\u0546\u054f\u0550\u0535\u0554 \u0531\u054e\u0531\u054f\u0531\u0550",
  settings_level: "\u0544\u0561\u056f\u0561\u0580\u0564\u0561\u056f",
  settings_streak: "\u0540\u0561\u057b\u0578\u0580\u0564\u0561\u056f\u0561\u0576",
  settings_days: "\u0585\u0580",
  settings_words: "\u0532\u0561\u057c\u0565\u0580",
  settings_storiesStat: "\u054a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  settings_gamesStat: "\u053d\u0561\u0572\u0565\u0580",
  settings_xp: "XP",

  // Dictionary
  dict_title: "\u0532\u0561\u057c\u0561\u0580\u0561\u0576",
  dict_subtitle: "\u0534\u056b\u057f\u0565\u0584 \u0562\u0578\u056c\u0578\u0580 \u0562\u0561\u057c\u0565\u0580\u0568: \u054a\u0561\u0570\u057a\u0561\u0576\u0565\u0584\u055d \u0570\u0565\u057f\u0578 \u057a\u0580\u0561\u056f\u057f\u056b\u056f\u0561\u0575\u056b \u0570\u0561\u0574\u0561\u0580:",
  dict_search: "\u0553\u0576\u057f\u0580\u0565\u0584 \u0562\u0561\u057c \u056f\u0561\u0574 \u0569\u0561\u0580\u0563\u0574\u0561\u0576\u0578\u0582\u0569\u0575\u0578\u0582\u0576...",
  dict_allCategories: "\u0532\u0578\u056c\u0578\u0580 \u056f\u0561\u057f\u0565\u0563\u0578\u0580\u056b\u0561\u0576\u0565\u0580\u0568",
  dict_allLevels: "\u0532\u0578\u056c\u0578\u0580 \u0574\u0561\u056f\u0561\u0580\u0564\u0561\u056f\u0576\u0565\u0580\u0568",
  dict_beginner: "\u054d\u056f\u057d\u0576\u0561\u056f",
  dict_intermediate: "\u0544\u056b\u057b\u056b\u0576",
  dict_advanced: "\u0531\u057c\u0561\u057b\u0561\u0564\u0565\u0574",

  // Games
  games_title: "\u053d\u0561\u0572\u0565\u0580",
  games_subtitle: "\u053d\u0561\u0572\u0561\u0581\u0565\u0584 \u0587 \u057d\u0578\u057e\u0578\u0580\u0565\u0584 \u2014 \u057e\u0561\u057d\u057f\u0561\u056f\u0565\u0584 XP \u0575\u0578\u0582\u0580\u0561\u0584\u0561\u0576\u0579\u0575\u0578\u0582\u0580 \u056d\u0561\u0572\u056b \u0570\u0561\u0574\u0561\u0580",
  games_dailyChallenge: "\u0555\u0580\u057e\u0561 \u0574\u0561\u0580\u057f\u0561\u0570\u0580\u0561\u057e\u0565\u0580",
  games_dailyDesc: "\u0531\u057e\u0561\u0580\u057f\u0565\u0584 \u0581\u0561\u0576\u056f\u0561\u0581\u0561\u056e \u056d\u0561\u0572 \u0561\u0575\u057d\u0585\u0580\u055d \u056f\u0580\u056f\u0576\u0561\u056f\u056b XP-\u056b \u0570\u0561\u0574\u0561\u0580!",
  games_playNow: "\u053d\u0561\u0572\u0561\u056c",
  games_bestScores: "\u0541\u0565\u0580 \u056c\u0561\u057e\u0561\u0563\u0578\u0582\u0575\u0576 \u0574\u056b\u0561\u057e\u0578\u0580\u0576\u0565\u0580\u0568",
  games_notPlayed: "\u0534\u0565\u057c \u0579\u056b \u056d\u0561\u0572\u0561\u0581\u057e\u0565\u056c",
  games_xpFromGames: "XP \u056d\u0561\u0572\u0565\u0580\u056b\u0581",
  games_gamesPlayed: "\u053d\u0561\u0572\u0565\u0580 \u056d\u0561\u0572\u0561\u0581\u057e\u0561\u056e",
  games_flashcards: "\u0556\u056c\u0565\u0577\u0584\u0561\u0580\u057f\u0565\u0580",
  games_wordMatch: "\u0532\u0561\u057c\u0565\u0580\u056b \u0570\u0561\u0574\u0561\u057a\u0561\u057f\u0561\u057d\u056d\u0561\u0576\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  games_memoryPalace: "\u0540\u056b\u0577\u0578\u0572\u0578\u0582\u0569\u0575\u0561\u0576 \u057a\u0561\u056c\u0561\u057f",
  games_wordScramble: "\u0532\u0561\u057c\u0565\u0580\u056b \u056d\u0561\u057c\u0576\u0578\u0582\u0580\u0564",
  games_fillBlank: "\u053c\u0580\u0561\u0581\u0580\u0565\u0584 \u0562\u0561\u0581\u0568",
  games_2xToday: "2x XP \u0561\u0575\u057d\u0585\u0580",

  // Stories
  stories_title: "\u054a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580",
  stories_subtitle_tpl: "\u0538\u0576\u056f\u0572\u0574\u057e\u0565\u0584 {lang}-\u056b \u0574\u0565\u057b\u055d \u0569\u0561\u0569\u0561\u056d\u0578\u0572 \u057a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580\u0578\u057e:",

  // Tutor
  tutor_title: "AI \u0544\u0561\u057d\u0576\u0561\u0563\u0565\u057f",
  tutor_subtitle: "\u054a\u0580\u0561\u056f\u057f\u056b\u056f\u0561 AI \u0566\u0580\u0578\u0582\u0575\u0581\u0561\u056f\u0581\u056b \u0570\u0565\u057f",

  // Writing
  writing_title: "\u0533\u0580\u0561\u057e\u0578\u0580 \u057a\u0580\u0561\u056f\u057f\u056b\u056f\u0561",
  writing_prompts: "\u0539\u0565\u0574\u0561\u0576\u0565\u0580",
  writing_history: "\u054a\u0561\u057f\u0574\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  writing_placeholder_tpl: "\u0533\u0580\u0565\u0584 {lang}-\u0578\u057e \u0561\u0575\u057d\u057f\u0565\u0572...",
  writing_submit: "\u054d\u057f\u0561\u0576\u0561\u056c \u0570\u0565\u057f\u0561\u0564\u0561\u0580\u0571",

  // Review
  review_title: "\u053f\u0580\u056f\u0576\u0578\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  review_empty: "\u053f\u0580\u056f\u0576\u0578\u0572\u0578\u0582\u0569\u0575\u0561\u0576 \u0570\u0561\u0574\u0561\u0580 \u0562\u0561\u057c\u0565\u0580 \u0579\u056f\u0561\u0576: \u054a\u0561\u0570\u057a\u0561\u0576\u0565\u0584 \u0562\u0561\u057c\u0565\u0580 \u0562\u0561\u057c\u0561\u0580\u0561\u0576\u056b\u0581\u055d \u057d\u056f\u057d\u0565\u056c\u0578\u0582 \u0570\u0561\u0574\u0561\u0580!",

  // Pronunciation
  pronunciation_title: "\u0531\u0580\u057f\u0561\u057d\u0561\u0576\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  pronunciation_tip: "\u054d\u0565\u0572\u0574\u0565\u0584 \u0562\u0561\u057c\u056b \u057e\u0580\u0561\u055d \u056c\u057d\u0565\u056c\u0578\u0582 \u0570\u0561\u0574\u0561\u0580\u055d \u0561\u057a\u0561 \u057d\u0565\u0572\u0574\u0565\u0584 \u0541\u0561\u0575\u0576\u0561\u0563\u0580\u0565\u056c\u055d \u0570\u0561\u0574\u0565\u0574\u0561\u057f\u0565\u056c\u0578\u0582 \u0570\u0561\u0574\u0561\u0580:",
  pronunciation_howTo: "\u053b\u0576\u0579\u057a\u0565\u057d \u057a\u0580\u0561\u056f\u057f\u056b\u056f\u0561\u0576\u0565\u056c.",
  pronunciation_record: "\u0541\u0561\u0575\u0576\u0561\u0563\u0580\u0565\u056c",
  pronunciation_stop: "\u053f\u0561\u0576\u0563\u0576\u0565\u056c",
  pronunciation_playback: "\u053c\u057d\u0565\u056c",
  pronunciation_compare: "\u0540\u0561\u0574\u0565\u0574\u0561\u057f\u0565\u0584. \u0576\u0574\u0561\u0576 \u0567 \u0570\u0576\u0579\u0578\u0582\u055e\u0574 \u057e\u0565\u0580\u0568 \u0562\u0576\u0585\u0580\u056b\u0576\u0561\u056f \u0561\u0580\u057f\u0561\u057d\u0561\u0576\u0578\u0582\u0569\u0575\u0561\u0576\u0568\u055f",
  pronunciation_yourPronunciation: "\u0541\u0565\u0580 \u0561\u0580\u057f\u0561\u057d\u0561\u0576\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568",
  pronunciation_category: "\u053f\u0561\u057f\u0565\u0563\u0578\u0580\u056b\u0561",
  pronunciation_allCategories: "\u0532\u0578\u056c\u0578\u0580 \u056f\u0561\u057f\u0565\u0563\u0578\u0580\u056b\u0561\u0576\u0565\u0580\u0568",
  pronunciation_speed: "\u0531\u0580\u0561\u0563\u0578\u0582\u0569\u0575\u0578\u0582\u0576",
  pronunciation_slow: "\u0534\u0561\u0576\u0564\u0561\u0572",
  pronunciation_normal: "\u0546\u0578\u0580\u0574\u0561\u056c",
  pronunciation_fast: "\u0531\u0580\u0561\u0563",
  pronunciation_word: "\u0532\u0561\u057c",
  pronunciation_example: "\u0555\u0580\u056b\u0576\u0561\u056f",
  pronunciation_recording: "\u0541\u0561\u0575\u0576\u0561\u0563\u0580\u057e\u0578\u0582\u0574 \u0567...",

  // Home
  home_welcome_tpl: "\u0532\u0561\u0580\u056b \u0563\u0561\u056c\u0578\u0582\u057d\u057f, {name}!",
  home_continueJourney: "\u054a\u0561\u057f\u0580\u0561\u057d\u057f\u055e \u0565\u0584 \u0577\u0561\u0580\u0578\u0582\u0576\u0561\u056f\u0565\u056c \u057d\u0578\u057e\u0578\u0580\u0565\u056c\u0568\u055f",

  // Common
  common_save: "\u054a\u0561\u0570\u057a\u0561\u0576\u0565\u056c",
  common_cancel: "\u0549\u0565\u0572\u0561\u0580\u056f\u0565\u056c",
  common_loading: "\u0532\u0565\u057c\u0576\u057e\u0578\u0582\u0574 \u0567...",
  common_error: "\u053b\u0576\u0579-\u0578\u0580 \u057d\u056d\u0561\u056c \u057f\u0565\u0572\u056b \u0578\u0582\u0576\u0565\u0581\u0561\u057e",
  common_tryAgain: "\u053f\u0580\u056f\u056b\u0576 \u0583\u0578\u0580\u0571\u0565\u0584",
  common_noResults: "\u0531\u0580\u0564\u0575\u0578\u0582\u0576\u0584\u0576\u0565\u0580 \u0579\u056f\u0561\u0576",
};

export type TranslationKey = keyof typeof en;
export type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, hy };

export function t(locale: Locale, key: TranslationKey, vars?: Record<string, string>): string {
  let str = translations[locale]?.[key] ?? translations.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

export function getLocale(nativeLanguage?: string | null): Locale {
  return nativeLanguage === "hy" ? "hy" : "en";
}
