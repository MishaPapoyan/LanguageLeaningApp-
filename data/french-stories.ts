export interface StoryEntry {
  title: string;
  description: string;
  chapter: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  imageEmoji: string;
  content: {
    paragraphs: Array<{
      text: string;
      highlights: Array<{ word: string; startIndex: number; endIndex: number }>;
    }>;
  };
  highlightedWords: string[]; // French words that should be linked to dictionary
  quizzes: Array<{
    question: string;
    options: string[];
    answer: number;
  }>;
}

export const frenchStories: StoryEntry[] = [
  {
    title: "Perdu à Paris",
    description: "You've just arrived in Paris and you're completely lost. Can you find the café where you're meeting your friend?",
    chapter: 1,
    difficulty: "BEGINNER",
    imageEmoji: "🗼",
    highlightedWords: ["bonjour", "excusez-moi", "rue", "merci", "chercher", "gare"],
    content: {
      paragraphs: [
        {
          text: "It is your first morning in Paris. You step off the métro and look around. The streets are full of people rushing to work. You need to find Rue de Rivoli, where your friend is waiting at a café.",
          highlights: [
            { word: "métro", startIndex: 34, endIndex: 39 },
            { word: "rue", startIndex: 115, endIndex: 118 },
          ],
        },
        {
          text: "You stop an older gentleman. 'Bonjour, monsieur! Excusez-moi, je cherche la Rue de Rivoli. Pouvez-vous m'aider ?' The man smiles warmly.",
          highlights: [
            { word: "bonjour", startIndex: 18, endIndex: 25 },
            { word: "excusez-moi", startIndex: 38, endIndex: 49 },
            { word: "chercher", startIndex: 53, endIndex: 60 },
            { word: "rue", startIndex: 66, endIndex: 69 },
          ],
        },
        {
          text: "'Bien sûr !' he says. 'Allez tout droit, puis tournez à gauche. C'est à cinq minutes à pied.' You thank him: 'Merci beaucoup, monsieur !' He waves and walks on.",
          highlights: [
            { word: "merci", startIndex: 116, endIndex: 121 },
          ],
        },
        {
          text: "Following his directions, you walk down a beautiful cobblestone street. You pass a boulangerie — the smell of fresh pain is irresistible. But your friend is waiting.",
          highlights: [
            { word: "pain", startIndex: 139, endIndex: 143 },
          ],
        },
        {
          text: "Finally, you spot the café. Your friend waves from a table outside. 'Tu es là !' she cries. 'Comment ça va ?' You collapse into the chair. 'Ça va bien — but I need a café au lait. Maintenant !'",
          highlights: [
            { word: "comment ça va", startIndex: 89, endIndex: 102 },
            { word: "maintenant", startIndex: 178, endIndex: 188 },
          ],
        },
      ],
    },
    quizzes: [
      {
        question: "Where is the narrator trying to go?",
        options: ["The Eiffel Tower", "Rue de Rivoli café", "The Louvre Museum", "The train station"],
        answer: 1,
      },
      {
        question: "How does the narrator ask for help in French?",
        options: ["'Au revoir, monsieur!'", "'Merci beaucoup!'", "'Excusez-moi, je cherche...'", "'Comment ça va ?'"],
        answer: 2,
      },
      {
        question: "What does 'Allez tout droit' mean?",
        options: ["Turn left", "Turn right", "Go straight ahead", "Go back"],
        answer: 2,
      },
    ],
  },
  {
    title: "Au Marché",
    description: "Saturday morning at the outdoor market. Can you buy everything on your shopping list using only French?",
    chapter: 2,
    difficulty: "BEGINNER",
    imageEmoji: "🛒",
    highlightedWords: ["marché", "bonjour", "combien", "s'il vous plaît", "merci", "fromage", "pain", "délicieux"],
    content: {
      paragraphs: [
        {
          text: "Saturday morning. The weekly marché has taken over the square. Stalls overflow with vegetables, fruits, flowers, and — your nose tells you — fresh fromage.",
          highlights: [
            { word: "marché", startIndex: 30, endIndex: 36 },
            { word: "fromage", startIndex: 137, endIndex: 144 },
          ],
        },
        {
          text: "You approach the cheese stall. 'Bonjour, madame !' you greet the vendor. 'Bonjour ! Qu'est-ce que vous voulez ?' she asks with a big smile.",
          highlights: [
            { word: "bonjour", startIndex: 30, endIndex: 37 },
          ],
        },
        {
          text: "You point at a round camembert. 'Je voudrais ce fromage, s'il vous plaît. C'est combien ?' The vendor wraps it carefully. 'Quatre euros, monsieur.'",
          highlights: [
            { word: "fromage", startIndex: 40, endIndex: 47 },
            { word: "s'il vous plaît", startIndex: 49, endIndex: 64 },
            { word: "combien", startIndex: 71, endIndex: 78 },
          ],
        },
        {
          text: "You pay and move on to the bread stall. The baguettes are golden and enormous. 'Bonjour ! Un pain de campagne, s'il vous plaît !' The baker hands you a huge rustic loaf.",
          highlights: [
            { word: "bonjour", startIndex: 80, endIndex: 87 },
            { word: "pain", startIndex: 93, endIndex: 97 },
            { word: "s'il vous plaît", startIndex: 114, endIndex: 129 },
          ],
        },
        {
          text: "At home that evening, you lay out your purchases: the camembert, the bread, some olives, a bottle of vin. You tear off a piece of baguette and eat it with cheese. 'C'est délicieux,' you say to yourself — absolutely delicious.",
          highlights: [
            { word: "vin", startIndex: 101, endIndex: 104 },
            { word: "délicieux", startIndex: 174, endIndex: 183 },
          ],
        },
      ],
    },
    quizzes: [
      {
        question: "What does 'C'est combien ?' mean?",
        options: ["It's delicious!", "How much is it?", "What time is it?", "Where is it?"],
        answer: 1,
      },
      {
        question: "What did the narrator buy at the cheese stall?",
        options: ["Brie", "Roquefort", "Camembert", "Gruyère"],
        answer: 2,
      },
      {
        question: "How do you say 'It's delicious' in French?",
        options: ["C'est magnifique", "C'est délicieux", "C'est grand", "C'est petit"],
        answer: 1,
      },
    ],
  },
  {
    title: "À l'Hôtel",
    description: "You've arrived at your Paris hotel after a long journey. Can you check in, ask about breakfast, and settle in for the night?",
    chapter: 3,
    difficulty: "BEGINNER",
    imageEmoji: "🏨",
    highlightedWords: ["hôtel", "réserver", "bonsoir", "s'il vous plaît", "merci", "avoir", "vouloir", "aujourd'hui"],
    content: {
      paragraphs: [
        {
          text: "After hours of travel, you finally stand in front of your hôtel on a quiet Parisian street. The warm golden light from the lobby is very welcoming. You push open the door.",
          highlights: [
            { word: "hôtel", startIndex: 58, endIndex: 63 },
          ],
        },
        {
          text: "'Bonsoir, madame !' says the receptionist. 'Bonsoir ! J'ai une réservation. Je m'appelle...' You give your name. She types quickly. 'Oui, parfait. Une chambre pour deux nuits.'",
          highlights: [
            { word: "bonsoir", startIndex: 1, endIndex: 8 },
            { word: "réserver", startIndex: 56, endIndex: 64 },
            { word: "je m'appelle", startIndex: 66, endIndex: 78 },
          ],
        },
        {
          text: "'Avez-vous le petit-déjeuner ?' you ask. 'Oui — le buffet est servi de sept heures à dix heures, dans la salle à manger.' Perfect. You note the time: aujourd'hui you are exhausted, but demain you will eat well.",
          highlights: [
            { word: "avoir", startIndex: 1, endIndex: 6 },
            { word: "aujourd'hui", startIndex: 176, endIndex: 187 },
            { word: "demain", startIndex: 207, endIndex: 213 },
          ],
        },
        {
          text: "She hands you a brass key. 'Chambre numéro sept, au deuxième étage. L'ascenseur est là.' You thank her warmly. 'Merci beaucoup, madame. Bonne nuit !'",
          highlights: [
            { word: "merci", startIndex: 112, endIndex: 117 },
          ],
        },
        {
          text: "The room is small but charming — exposed wooden beams, a white duvet, a window that opens onto a courtyard of roses. You drop your bags and sit on the bed. You're in Paris. C'est magnifique.",
          highlights: [],
        },
      ],
    },
    quizzes: [
      {
        question: "What time is breakfast served at the hotel?",
        options: ["6am - 9am", "7am - 10am", "8am - 11am", "9am - noon"],
        answer: 1,
      },
      {
        question: "How do you say 'good evening' in French?",
        options: ["Bonjour", "Au revoir", "Bonsoir", "Merci"],
        answer: 2,
      },
      {
        question: "What does 'J'ai une réservation' mean?",
        options: ["I'd like a room", "I have a reservation", "I want breakfast", "I need help"],
        answer: 1,
      },
    ],
  },
  {
    title: "Au Restaurant",
    description: "It's your first dinner at a real Parisian restaurant. Can you order food, ask for the bill, and survive the experience?",
    chapter: 4,
    difficulty: "BEGINNER",
    imageEmoji: "🍽️",
    highlightedWords: ["bonsoir", "réserver", "menu", "eau", "vin", "s'il vous plaît", "délicieux", "addition", "merci"],
    content: {
      paragraphs: [
        {
          text: "You push open the door of a small restaurant near the Seine. A waiter greets you warmly. 'Bonsoir ! Avez-vous une réservation ?' You nod. 'Oui, j'ai réservé une table pour deux.'",
          highlights: [
            { word: "bonsoir", startIndex: 66, endIndex: 73 },
            { word: "réserver", startIndex: 87, endIndex: 99 },
          ],
        },
        {
          text: "He leads you to a cozy table by the window. 'Voici le menu,' he says, handing you a leather-bound book. You open it nervously. The words are all in French, but you recognize some: fromage, pain, vin.",
          highlights: [
            { word: "menu", startIndex: 58, endIndex: 62 },
          ],
        },
        {
          text: "You take a deep breath. 'Je voudrais la soupe du jour et le poulet, s'il vous plaît.' The waiter nods approvingly. 'Et à boire ?' 'De l'eau plate et un verre de vin rouge, s'il vous plaît.'",
          highlights: [
            { word: "s'il vous plaît", startIndex: 69, endIndex: 84 },
            { word: "eau", startIndex: 140, endIndex: 143 },
            { word: "vin", startIndex: 162, endIndex: 165 },
          ],
        },
        {
          text: "The food arrives. The soup is warm and perfect. The chicken melts in your mouth. 'C'est délicieux !' you tell the waiter when he checks on you. He beams with pride. 'Je suis content !'",
          highlights: [
            { word: "délicieux", startIndex: 89, endIndex: 98 },
          ],
        },
        {
          text: "After dessert — a beautiful tarte aux pommes — you catch the waiter's eye. 'L'addition, s'il vous plaît !' He brings the bill. You leave a small tip. 'Merci beaucoup, bonsoir !' you say as you step into the cool night air.",
          highlights: [
            { word: "addition", startIndex: 78, endIndex: 86 },
            { word: "s'il vous plaît", startIndex: 88, endIndex: 103 },
            { word: "merci", startIndex: 152, endIndex: 157 },
            { word: "bonsoir", startIndex: 168, endIndex: 175 },
          ],
        },
      ],
    },
    quizzes: [
      {
        question: "What does 'L'addition, s'il vous plaît' mean?",
        options: ["The menu, please", "The bill, please", "More water, please", "A table, please"],
        answer: 1,
      },
      {
        question: "What did the narrator order to drink?",
        options: ["Sparkling water and beer", "Coffee and juice", "Still water and red wine", "Tea and milk"],
        answer: 2,
      },
      {
        question: "How did the narrator describe the food?",
        options: ["C'est grand", "C'est petit", "C'est délicieux", "C'est cher"],
        answer: 2,
      },
    ],
  },
  {
    title: "Les Couleurs de Paris",
    description: "A walk through Paris reveals a city full of color. Can you learn to describe the world around you in French?",
    chapter: 5,
    difficulty: "BEGINNER",
    imageEmoji: "🎨",
    highlightedWords: ["rouge", "bleu", "vert", "blanc", "noir", "jaune", "beau / belle", "grand / grande", "le soleil"],
    content: {
      paragraphs: [
        {
          text: "It is a beautiful morning in Paris. Le soleil is shining and the sky is a perfect bleu. You decide to take a walk and notice the colors all around you. 'C'est une belle journée !' you say to yourself.",
          highlights: [
            { word: "le soleil", startIndex: 39, endIndex: 48 },
            { word: "bleu", startIndex: 84, endIndex: 88 },
            { word: "beau / belle", startIndex: 152, endIndex: 157 },
          ],
        },
        {
          text: "You walk along the Seine. A man in a noir coat hurries past. A woman carries a bouquet of rouge roses. On the bridge, an artist paints the river with strokes of bleu and vert.",
          highlights: [
            { word: "noir", startIndex: 38, endIndex: 42 },
            { word: "rouge", startIndex: 84, endIndex: 89 },
            { word: "bleu", startIndex: 162, endIndex: 166 },
            { word: "vert", startIndex: 171, endIndex: 175 },
          ],
        },
        {
          text: "In the Jardin des Tuileries, the trees are gloriously vert. Children in jaune raincoats chase pigeons across the gravel paths. The grand fountain sparkles in the sunlight.",
          highlights: [
            { word: "vert", startIndex: 54, endIndex: 58 },
            { word: "jaune", startIndex: 73, endIndex: 78 },
            { word: "grand / grande", startIndex: 130, endIndex: 135 },
          ],
        },
        {
          text: "You stop at a café and order a café noir. From your table, you watch the city pass by. A blanc cat sleeps on a windowsill across the street. Everything feels calm and beau.",
          highlights: [
            { word: "noir", startIndex: 43, endIndex: 47 },
            { word: "blanc", startIndex: 109, endIndex: 114 },
            { word: "beau / belle", startIndex: 168, endIndex: 172 },
          ],
        },
        {
          text: "As the sun sets, the sky turns rouge and jaune. The blanc stone of the buildings glows warm. You think: Paris is not just a city — it is a painting. And today, you learned its colors.",
          highlights: [
            { word: "rouge", startIndex: 34, endIndex: 39 },
            { word: "jaune", startIndex: 44, endIndex: 49 },
            { word: "blanc", startIndex: 55, endIndex: 60 },
          ],
        },
      ],
    },
    quizzes: [
      {
        question: "What color is the sky described as in the morning?",
        options: ["Rouge", "Vert", "Bleu", "Blanc"],
        answer: 2,
      },
      {
        question: "What does 'noir' mean?",
        options: ["White", "Green", "Red", "Black"],
        answer: 3,
      },
      {
        question: "What colors does the sky turn at sunset?",
        options: ["Bleu and vert", "Rouge and jaune", "Blanc and noir", "Vert and jaune"],
        answer: 1,
      },
    ],
  },
  {
    title: "Ma Famille",
    description: "You're having dinner with a French family and learning to talk about your own. Can you introduce your family members?",
    chapter: 6,
    difficulty: "BEGINNER",
    imageEmoji: "👨‍👩‍👧‍👦",
    highlightedWords: ["famille", "mère", "père", "frère", "soeur", "je m'appelle", "habiter", "grand / grande", "petit / petite", "bonjour"],
    content: {
      paragraphs: [
        {
          text: "Your French friend Sophie has invited you to dinner with her famille. You are nervous but excited. At the door, her mère greets you with a warm smile. 'Bonjour ! Bienvenue chez nous !'",
          highlights: [
            { word: "famille", startIndex: 56, endIndex: 63 },
            { word: "mère", startIndex: 114, endIndex: 118 },
            { word: "bonjour", startIndex: 148, endIndex: 155 },
          ],
        },
        {
          text: "Inside, the table is set for six. Sophie introduces everyone. 'Voici mon père, Michel.' Her père shakes your hand firmly. 'Et voici mon frère, Lucas. Il est grand !' Lucas laughs — he is very tall indeed.",
          highlights: [
            { word: "père", startIndex: 76, endIndex: 80 },
            { word: "frère", startIndex: 131, endIndex: 136 },
            { word: "grand / grande", startIndex: 156, endIndex: 161 },
          ],
        },
        {
          text: "A petite girl runs in and hides behind Sophie. 'Et voici ma soeur, Chloé. Elle est petite mais très courageuse.' Little Chloé peeks out and waves at you shyly.",
          highlights: [
            { word: "petit / petite", startIndex: 2, endIndex: 8 },
            { word: "soeur", startIndex: 54, endIndex: 59 },
          ],
        },
        {
          text: "'Et toi ?' asks Michel. 'Parle-nous de ta famille !' You take a breath. 'Je m'appelle... I have une mère and un père. J'ai deux frères — they both habite in London.' Everyone nods encouragingly.",
          highlights: [
            { word: "famille", startIndex: 51, endIndex: 58 },
            { word: "je m'appelle", startIndex: 75, endIndex: 87 },
            { word: "mère", startIndex: 102, endIndex: 106 },
            { word: "père", startIndex: 114, endIndex: 118 },
            { word: "habiter", startIndex: 151, endIndex: 157 },
          ],
        },
        {
          text: "The dinner is wonderful — cheese, bread, laughter. As you leave, Sophie's mère hugs you. 'Tu fais partie de la famille maintenant !' she says. You are part of the family now. You walk home smiling.",
          highlights: [
            { word: "mère", startIndex: 75, endIndex: 79 },
            { word: "famille", startIndex: 113, endIndex: 120 },
          ],
        },
      ],
    },
    quizzes: [
      {
        question: "What does 'ma famille' mean?",
        options: ["My friend", "My house", "My family", "My school"],
        answer: 2,
      },
      {
        question: "Who is described as 'grand' (tall)?",
        options: ["Sophie", "Chloé", "Michel", "Lucas"],
        answer: 3,
      },
      {
        question: "What does Sophie's mother say at the end?",
        options: ["Goodbye forever", "You are part of the family now", "Come back tomorrow", "Learn more French"],
        answer: 1,
      },
    ],
  },
];
