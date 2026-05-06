import type { StoryEntry } from "./french-stories";

export const englishStories: StoryEntry[] = [
  {
    title: "The Job Interview",
    description: "You have an interview at a top London company. Can you impress the panel and land the job?",
    chapter: 1,
    difficulty: "BEGINNER",
    imageEmoji: "💼",
    highlightedWords: ["punctual", "colleague", "ambitious", "negotiate", "deadline", "proficient"],
    content: {
      paragraphs: [
        {
          text: "Today is the day. You have been preparing for weeks. The interview at Apex Solutions is in one hour. You leave early — being punctual matters, especially in Britain.",
          highlights: [
            { word: "punctual", startIndex: 129, endIndex: 137 },
          ],
        },
        {
          text: "You arrive five minutes early and wait in the reception area. The receptionist smiles. 'They'll be with you shortly.' You glance at your notes one last time. You are ready.",
          highlights: [],
        },
        {
          text: "The panel consists of three people: a senior manager named David, your potential future colleague Sarah, and the HR director. They ask about your experience, your goals, and your strengths.",
          highlights: [
            { word: "colleague", startIndex: 77, endIndex: 86 },
          ],
        },
        {
          text: "'Where do you see yourself in five years?' David asks. You sit up straight. 'I'm ambitious — I want to lead a team within three years. I'd like to help the company grow its market share.' David nods, impressed.",
          highlights: [
            { word: "ambitious", startIndex: 53, endIndex: 61 },
          ],
        },
        {
          text: "Sarah asks about a time you met a deadline under pressure. You describe the product launch you managed last year — long hours, tight schedule, but delivered on time. She writes something down. A good sign.",
          highlights: [
            { word: "deadline", startIndex: 39, endIndex: 47 },
          ],
        },
        {
          text: "Finally, they ask if you have any questions. 'I do,' you say confidently. 'Is there flexibility to negotiate the starting date?' David laughs. 'Absolutely. We like candidates who know what they want.'",
          highlights: [
            { word: "negotiate", startIndex: 62, endIndex: 71 },
          ],
        },
        {
          text: "Walking out, you feel good. An hour later, your phone rings. It's Sarah. 'We'd love to offer you the role.' You smile, and try not to sound too pleased. You are, however, chuffed to bits.",
          highlights: [],
        },
      ],
    },
    quizzes: [
      {
        question: "Why did the main character leave early for the interview?",
        options: [
          "They were nervous and couldn't sleep",
          "Being punctual is important, especially in Britain",
          "The office was far away",
          "The receptionist asked them to arrive early",
        ],
        answer: 1,
      },
      {
        question: "What did the main character say when asked about their five-year plan?",
        options: [
          "They wanted to start their own company",
          "They hoped to move abroad",
          "They wanted to lead a team within three years",
          "They had no specific plan",
        ],
        answer: 2,
      },
      {
        question: "What past experience did they describe to Sarah?",
        options: [
          "A difficult client presentation",
          "Managing a product launch under pressure",
          "Working with an international team",
          "Handling a financial crisis",
        ],
        answer: 1,
      },
      {
        question: "What did the main character ask the panel at the end?",
        options: [
          "About the salary package",
          "About remote working options",
          "About the company culture",
          "About flexibility with the starting date",
        ],
        answer: 3,
      },
      {
        question: "How did the main character feel after receiving the job offer?",
        options: [
          "Disappointed by the role",
          "Uncertain about accepting",
          "Very pleased (chuffed to bits)",
          "Confused about the terms",
        ],
        answer: 2,
      },
    ],
  },

  {
    title: "A Weekend in London",
    description: "You've arrived in London for the first time. Navigate the Tube, explore the city, and try not to stand on the wrong side of the escalator.",
    chapter: 2,
    difficulty: "BEGINNER",
    imageEmoji: "🎡",
    highlightedWords: ["queue", "brilliant", "bloke", "landmark", "commute", "customs"],
    content: {
      paragraphs: [
        {
          text: "You land at Heathrow on a grey Friday morning. After passing through customs, you collect your bag and step into the arrivals hall. A sea of signs. Somewhere, your name is written on one of them.",
          highlights: [
            { word: "customs", startIndex: 45, endIndex: 52 },
          ],
        },
        {
          text: "Your driver holds a small card: YOUR NAME. You grin. He takes your bag without a word and leads you to a black cab. London has begun.",
          highlights: [],
        },
        {
          text: "The city slides past the window — red buses, stone buildings, cyclists weaving dangerously. Your driver points: 'First time? That there's a proper landmark. Big Ben. Can't miss it.' You already love it.",
          highlights: [
            { word: "landmark", startIndex: 106, endIndex: 114 },
          ],
        },
        {
          text: "At the hotel, you ask the receptionist how to get to Borough Market. 'Take the Tube,' she says. 'Mind the gap, stand on the right on escalators, and don't make eye contact.' Noted.",
          highlights: [],
        },
        {
          text: "The Tube at rush hour is an experience. Everyone is silent. The commute is a ritual — headphones in, eyes down, sway with the carriage. You try to fit in. Mostly you succeed.",
          highlights: [
            { word: "commute", startIndex: 43, endIndex: 50 },
          ],
        },
        {
          text: "At Borough Market, a friendly bloke behind a cheese stall offers you a sample. 'That's Montgomery Cheddar — brilliant, isn't it?' You agree. You buy more than you should.",
          highlights: [
            { word: "bloke", startIndex: 24, endIndex: 29 },
            { word: "brilliant", startIndex: 91, endIndex: 100 },
          ],
        },
        {
          text: "By evening, you queue outside a small theatre in Southwark. Nobody complains about the wait. You stand patiently — you're learning. When the doors open, you file in with the crowd. This is London.",
          highlights: [
            { word: "queue", startIndex: 18, endIndex: 23 },
          ],
        },
      ],
    },
    quizzes: [
      {
        question: "Where did the main character arrive in London?",
        options: [
          "Gatwick Airport",
          "St Pancras International",
          "Heathrow Airport",
          "London City Airport",
        ],
        answer: 2,
      },
      {
        question: "What landmark did the driver point out from the black cab?",
        options: [
          "Tower Bridge",
          "The Shard",
          "Buckingham Palace",
          "Big Ben",
        ],
        answer: 3,
      },
      {
        question: "What etiquette tip did the receptionist NOT mention about the Tube?",
        options: [
          "Mind the gap",
          "Stand on the right on escalators",
          "Don't make eye contact",
          "Always offer your seat",
        ],
        answer: 3,
      },
      {
        question: "What did the character buy at Borough Market?",
        options: [
          "Fresh bread",
          "Too much cheese",
          "Street food",
          "Flowers",
        ],
        answer: 1,
      },
      {
        question: "What did the character do in the evening?",
        options: [
          "Visited a museum",
          "Had dinner at a restaurant",
          "Queued outside a theatre",
          "Took a river cruise",
        ],
        answer: 2,
      },
    ],
  },

  {
    title: "The Startup Pitch",
    description: "You have five minutes to pitch your startup idea to a panel of investors. Every word counts.",
    chapter: 3,
    difficulty: "INTERMEDIATE",
    imageEmoji: "🚀",
    highlightedWords: ["emphasise", "elaborate", "budget", "invest", "ambitious", "resilient"],
    content: {
      paragraphs: [
        {
          text: "The room is small but the stakes are enormous. Four investors sit across from you, notebooks open, faces neutral. You have five minutes and one slide deck. You stand up and begin.",
          highlights: [],
        },
        {
          text: "You emphasise your main point immediately: the market gap. 'Twelve million people in the UK struggle to find affordable language tutoring. Our app changes that.' One investor leans forward.",
          highlights: [
            { word: "emphasise", startIndex: 4, endIndex: 13 },
          ],
        },
        {
          text: "'How does the revenue model work?' asks the woman on the left — Maya, a partner at a major fund. You elaborate clearly: subscription tiers, a B2B school licence, and eventual enterprise contracts.",
          highlights: [
            { word: "elaborate", startIndex: 116, endIndex: 125 },
          ],
        },
        {
          text: "'What's your current runway?' asks the man with the glasses. You are ready. 'We're operating on a lean budget — eight months of runway with the seed funding, eighteen months with yours.'",
          highlights: [
            { word: "budget", startIndex: 64, endIndex: 70 },
          ],
        },
        {
          text: "Maya again: 'Why should we invest in you specifically?' You pause. This is the moment. 'Because we are resilient. We built this in nine months, with two people and no external funding. Imagine what we'll do with yours.'",
          highlights: [
            { word: "invest", startIndex: 21, endIndex: 27 },
            { word: "resilient", startIndex: 93, endIndex: 102 },
          ],
        },
        {
          text: "You close with a vision. Ambitious? Certainly. But backed by data, by users, by a team that believes. You smile. The glasses man closes his notebook. 'We'll be in touch.'",
          highlights: [
            { word: "ambitious", startIndex: 22, endIndex: 31 },
          ],
        },
        {
          text: "Two days later, Maya emails. The subject line reads: 'Term Sheet'. Your hands shake as you open it. You read the first line. You sit down. And you allow yourself, just briefly, to feel it.",
          highlights: [],
        },
      ],
    },
    quizzes: [
      {
        question: "What market problem did the main character identify?",
        options: [
          "A lack of English teachers in schools",
          "Twelve million people struggling to find affordable language tutoring",
          "Poor technology in language learning apps",
          "High costs of studying abroad",
        ],
        answer: 1,
      },
      {
        question: "What are the three parts of the revenue model mentioned?",
        options: [
          "Advertising, partnerships, sponsorship",
          "Freemium, donations, consulting",
          "Subscription tiers, B2B school licence, enterprise contracts",
          "One-time purchase, annual plan, corporate deals",
        ],
        answer: 2,
      },
      {
        question: "How long was the company's current runway?",
        options: [
          "Three months",
          "Six months",
          "Eight months",
          "Twelve months",
        ],
        answer: 2,
      },
      {
        question: "What did Maya ask that prompted the 'resilient' answer?",
        options: [
          "Why the team chose this market",
          "Why investors should back them specifically",
          "What made the product unique",
          "How they planned to scale",
        ],
        answer: 1,
      },
      {
        question: "What arrived two days after the pitch?",
        options: [
          "A rejection email",
          "A request for a second meeting",
          "A term sheet from Maya",
          "A question about the financials",
        ],
        answer: 2,
      },
    ],
  },
];
