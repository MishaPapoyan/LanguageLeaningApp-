import type { StoryEntry } from "./french-stories";

/**
 * Spanish stories mirroring the shape of frenchStories. Seeded when the user
 * sets targetLanguage = "es".
 */
export const spanishStories: StoryEntry[] = [
  {
    title: "Perdido en Madrid",
    description: "You've just arrived in Madrid and you're completely lost. Can you find the café where you're meeting your friend?",
    chapter: 1,
    difficulty: "BEGINNER",
    imageEmoji: "🏰",
    highlightedWords: ["hola", "perdón", "la calle", "gracias", "el pan"],
    content: {
      paragraphs: [
        {
          text: "It is your first morning in Madrid. You step off the metro and look around. The streets are full of people walking to work. You need to find Calle Gran Vía, where your friend is waiting at a café.",
          highlights: [
            { word: "metro", startIndex: 34, endIndex: 39 },
            { word: "calle", startIndex: 116, endIndex: 121 },
          ],
        },
        {
          text: "You stop an older gentleman. '¡Hola, señor! Perdón, busco la Calle Gran Vía. ¿Puede ayudarme?' The man smiles warmly.",
          highlights: [
            { word: "hola", startIndex: 31, endIndex: 35 },
            { word: "perdón", startIndex: 45, endIndex: 51 },
            { word: "buscar", startIndex: 53, endIndex: 58 },
            { word: "calle", startIndex: 64, endIndex: 69 },
          ],
        },
        {
          text: "'¡Claro!' he says. 'Siga todo recto, luego gire a la izquierda. Está a cinco minutos a pie.' You thank him: '¡Muchas gracias, señor!' He waves and walks on.",
          highlights: [
            { word: "gracias", startIndex: 117, endIndex: 124 },
          ],
        },
        {
          text: "Following his directions, you walk down a beautiful street. You pass a panadería — the smell of fresh pan is irresistible. But your friend is waiting.",
          highlights: [
            { word: "pan", startIndex: 120, endIndex: 123 },
          ],
        },
        {
          text: "Finally, you spot the café. Your friend waves from a table outside. '¡Estás aquí!' she cries. '¿Cómo estás?' You collapse into the chair. 'Estoy bien — but I need a café con leche. ¡Ahora!'",
          highlights: [
            { word: "cómo estás", startIndex: 95, endIndex: 105 },
            { word: "ahora", startIndex: 181, endIndex: 186 },
          ],
        },
      ],
    },
    quizzes: [
      {
        question: "Where is the narrator trying to go?",
        options: ["Plaza Mayor", "Calle Gran Vía café", "The Prado Museum", "The train station"],
        answer: 1,
      },
      {
        question: "How does the narrator ask for help in Spanish?",
        options: ["'Adiós, señor!'", "'Muchas gracias!'", "'Perdón, busco...'", "'¿Cómo estás?'"],
        answer: 2,
      },
      {
        question: "What does 'Siga todo recto' mean?",
        options: ["Turn right", "Go straight ahead", "Turn around", "Walk faster"],
        answer: 1,
      },
      {
        question: "What does the narrator order at the café?",
        options: ["Tea", "A croissant", "A café con leche", "A glass of water"],
        answer: 2,
      },
    ],
  },
  {
    title: "En el Mercado",
    description: "You visit a local market in Spain to buy ingredients for dinner. Practice asking prices and ordering food.",
    chapter: 2,
    difficulty: "BEGINNER",
    imageEmoji: "🥘",
    highlightedWords: ["el pan", "el queso", "por favor", "la tienda", "la manzana", "querer"],
    content: {
      paragraphs: [
        {
          text: "It's Saturday morning and you go to the mercado. The stalls are full of colorful fruit, vegetables, pan, and queso. You have a small list.",
          highlights: [
            { word: "mercado", startIndex: 40, endIndex: 47 },
            { word: "pan", startIndex: 100, endIndex: 103 },
            { word: "queso", startIndex: 109, endIndex: 114 },
          ],
        },
        {
          text: "At the bread stall, you say: '¡Buenos días! Quiero una barra de pan, por favor.' The baker nods. '¿Algo más?' 'Sí, también un poco de queso.'",
          highlights: [
            { word: "quiero", startIndex: 44, endIndex: 50 },
            { word: "pan", startIndex: 65, endIndex: 68 },
            { word: "por favor", startIndex: 70, endIndex: 79 },
            { word: "queso", startIndex: 135, endIndex: 140 },
          ],
        },
        {
          text: "'¿Cuánto es?' you ask. 'Son seis euros,' she replies. You give her the money. 'Muchas gracias.' She hands you a small bag. '¡Hasta pronto!'",
          highlights: [
            { word: "cuánto", startIndex: 2, endIndex: 8 },
          ],
        },
        {
          text: "Next, you pass the flower stall. The tulipanes are beautiful but too expensive. You decide to buy fruit instead: manzanas, naranjas, and some fresas. ¡Perfecto!",
          highlights: [],
        },
      ],
    },
    quizzes: [
      {
        question: "Where does the story take place?",
        options: ["A supermarket", "A mercado (market)", "A restaurant", "A bakery chain"],
        answer: 1,
      },
      {
        question: "What does 'Quiero una barra de pan' mean?",
        options: ["I want bread", "I want a loaf of bread", "I like bread", "Where is the bread?"],
        answer: 1,
      },
      {
        question: "How much did the bread and cheese cost?",
        options: ["Three euros", "Five euros", "Six euros", "Eight euros"],
        answer: 2,
      },
      {
        question: "What does the narrator buy instead of flowers?",
        options: ["Wine", "Fruit", "Vegetables", "Bread"],
        answer: 1,
      },
    ],
  },
  {
    title: "Un Día en la Playa",
    description: "Spend a sunny day at a Spanish beach. Learn vocabulary for weather, sea, and summer activities.",
    chapter: 3,
    difficulty: "INTERMEDIATE",
    imageEmoji: "🏖️",
    highlightedWords: ["la playa", "el libro", "el tiempo"],
    content: {
      paragraphs: [
        {
          text: "It's August and the calor is intense. You decide to go to the playa. The sol is shining and the cielo is perfectly blue.",
          highlights: [
            { word: "calor", startIndex: 22, endIndex: 27 },
            { word: "playa", startIndex: 62, endIndex: 67 },
            { word: "sol", startIndex: 74, endIndex: 77 },
          ],
        },
        {
          text: "You spread your towel on the arena and apply sunscreen. The mar is calm and the water is warm. Children play with a pelota nearby.",
          highlights: [
            { word: "arena", startIndex: 29, endIndex: 34 },
            { word: "mar", startIndex: 60, endIndex: 63 },
          ],
        },
        {
          text: "An ice-cream vendor walks past. '¡Helados! ¿Quién quiere un helado?' You raise your hand. 'Uno de chocolate, por favor.' He smiles. 'Son dos euros.'",
          highlights: [
            { word: "helado", startIndex: 35, endIndex: 41 },
          ],
        },
        {
          text: "In the afternoon, you swim in the mar, read a book, and then take a small siesta under the umbrella. When the sol begins to set, the sky turns orange and pink. ¡Qué día tan perfecto!",
          highlights: [],
        },
      ],
    },
    quizzes: [
      {
        question: "What is the weather like in the story?",
        options: ["Cold and rainy", "Hot and sunny", "Windy", "Cloudy"],
        answer: 1,
      },
      {
        question: "What flavor of ice cream does the narrator order?",
        options: ["Vanilla", "Strawberry", "Chocolate", "Lemon"],
        answer: 2,
      },
      {
        question: "What does 'siesta' refer to?",
        options: ["A swim", "A short nap", "A meal", "A walk"],
        answer: 1,
      },
      {
        question: "What happens at sunset in the story?",
        options: ["It starts raining", "The sky turns orange and pink", "Everyone leaves the beach", "A storm arrives"],
        answer: 1,
      },
    ],
  },
];
