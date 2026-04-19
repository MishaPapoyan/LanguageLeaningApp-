/**
 * Spanish learning path — full content for each topic in learning-path-es-meta.ts.
 * Mirrors the shape of `data/learning-path.ts` so the lesson page can pick the right
 * source based on the user's targetLanguage.
 *
 * NOTE: Interfaces reuse names `fr`/`en` in examples for structural compatibility
 * with the French file — here `fr` holds Spanish text (target-language slot).
 */

import type { Lesson, Topic } from "./learning-path";

export const LEARNING_PATH_ES: Topic[] = [
  {
    id: "alphabet",
    title: "El Alfabeto Español",
    description: "Aprende las 27 letras y su pronunciación en español",
    emoji: "🔤",
    lessons: [
      {
        id: "alphabet-1",
        title: "Letras A-M",
        titleFr: "Letras A-M",
        description: "La primera mitad del alfabeto español",
        emoji: "🅰️",
        type: "alphabet",
        content: [
          {
            heading: "El Alfabeto Español",
            body: "El alfabeto español tiene 27 letras, igual que el inglés más la ñ. Veamos de la A a la M.",
            examples: [
              { fr: "A", en: "ah" },
              { fr: "B", en: "bay" },
              { fr: "C", en: "say (or 'thay' in Spain)" },
              { fr: "D", en: "day" },
              { fr: "E", en: "ay" },
              { fr: "F", en: "eh-feh" },
              { fr: "G", en: "heh" },
              { fr: "H", en: "ah-cheh (silent in words)" },
              { fr: "I", en: "ee" },
              { fr: "J", en: "hoh-tah" },
              { fr: "K", en: "kah" },
              { fr: "L", en: "eh-leh" },
              { fr: "M", en: "eh-meh" },
            ],
            tip: "La H siempre es muda: 'hola' se pronuncia 'oh-la'.",
          },
          {
            heading: "Acentos y caracteres especiales",
            body: "El español usa el acento agudo y la tilde sobre la ñ.",
            examples: [
              { fr: "á, é, í, ó, ú", en: "acento agudo — marca la sílaba tónica" },
              { fr: "ñ", en: "eñe — sonido único (mañana)" },
              { fr: "ü", en: "diéresis — se pronuncia la u (pingüino)" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "How is the letter J pronounced in Spanish?", options: ["jay", "hoh-tah", "zhay", "yay"], answer: "hoh-tah" },
          { type: "multiple-choice", question: "Is H silent in Spanish?", options: ["Sí, siempre", "No, nunca", "Solo al principio", "Solo al final"], answer: "Sí, siempre" },
          { type: "fill-blank", question: "The symbol ñ is called ___", answer: "eñe", hint: "Es único del español" },
        ],
      },
      {
        id: "alphabet-2",
        title: "Letras N-Z",
        titleFr: "Letras N-Z",
        description: "La segunda mitad del alfabeto español",
        emoji: "🇿",
        type: "alphabet",
        content: [
          {
            heading: "Letras N hasta Z",
            body: "Completemos el alfabeto con la segunda mitad.",
            examples: [
              { fr: "N", en: "eh-neh" },
              { fr: "Ñ", en: "eh-nyeh" },
              { fr: "O", en: "oh" },
              { fr: "P", en: "peh" },
              { fr: "Q", en: "koo" },
              { fr: "R", en: "eh-reh (rolled)" },
              { fr: "S", en: "eh-seh" },
              { fr: "T", en: "teh" },
              { fr: "U", en: "oo" },
              { fr: "V", en: "oo-veh" },
              { fr: "W", en: "doble-u" },
              { fr: "X", en: "eh-kis" },
              { fr: "Y", en: "ee griega / yeh" },
              { fr: "Z", en: "seh-tah (or 'theta' in Spain)" },
            ],
            tip: "La RR doble se pronuncia con una vibración fuerte: 'perro'.",
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "How is the double R (rr) pronounced?", options: ["suave", "vibrada fuerte", "como una L", "muda"], answer: "vibrada fuerte" },
          { type: "fill-blank", question: "The letter Ñ is called ___", answer: "eñe" },
        ],
      },
    ],
  },
  {
    id: "pronunciation",
    title: "Sonidos del Español",
    description: "Domina los sonidos básicos del español",
    emoji: "🔊",
    requiredTopicId: "alphabet",
    lessons: [
      {
        id: "sounds-vowels",
        title: "Sonidos de Vocales",
        titleFr: "Sonidos de Vocales",
        description: "Las 5 vocales puras del español",
        emoji: "🗣️",
        type: "pronunciation",
        content: [
          {
            heading: "Las 5 vocales",
            body: "A diferencia del inglés, las vocales en español siempre se pronuncian igual: sonidos cortos y puros.",
            examples: [
              { fr: "a", en: "como 'ah' en 'father' (casa)" },
              { fr: "e", en: "como 'eh' en 'bed' (mesa)" },
              { fr: "i", en: "como 'ee' en 'see' (sí)" },
              { fr: "o", en: "como 'oh' en 'more' (no)" },
              { fr: "u", en: "como 'oo' en 'food' (tú)" },
            ],
            tip: "¡Las vocales españolas nunca cambian! Esto hace la pronunciación más predecible que en inglés.",
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "What does the vowel 'i' sound like in Spanish?", options: ["igh", "ee", "eye", "uh"], answer: "ee" },
          { type: "fill-blank", question: "The word 'casa' has ___ vowels", answer: "dos" },
        ],
      },
      {
        id: "sounds-consonants",
        title: "Reglas de Consonantes",
        titleFr: "Reglas de Consonantes",
        description: "Consonantes especiales: ll, rr, j, ñ",
        emoji: "🤫",
        type: "pronunciation",
        content: [
          {
            heading: "Consonantes especiales",
            body: "Algunas consonantes en español funcionan distinto al inglés.",
            examples: [
              { fr: "ll", en: "como 'y' en 'yes' (llamar)" },
              { fr: "rr", en: "vibración fuerte (perro)" },
              { fr: "j", en: "como 'h' fuerte (jugar)" },
              { fr: "ñ", en: "como 'ny' en 'canyon' (niño)" },
              { fr: "h", en: "siempre muda (hola)" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "How does 'll' sound in 'llamar'?", options: ["l", "y", "j", "sh"], answer: "y" },
          { type: "multiple-choice", question: "The 'h' in 'hola' is pronounced:", options: ["fuerte", "suave", "muda", "como 'j'"], answer: "muda" },
        ],
      },
    ],
  },
  {
    id: "greetings",
    title: "Saludos y Básicos",
    description: "Frases para presentarte y saludar",
    emoji: "👋",
    requiredTopicId: "pronunciation",
    lessons: [
      {
        id: "greetings-hello",
        title: "Saludar y Despedirse",
        titleFr: "Saludar y Despedirse",
        description: "Hola, adiós y más",
        emoji: "👋",
        type: "conversation",
        content: [
          {
            heading: "Saludos comunes",
            body: "Empecemos con los saludos más frecuentes.",
            examples: [
              { fr: "Hola", en: "Hello" },
              { fr: "Buenos días", en: "Good morning" },
              { fr: "Buenas tardes", en: "Good afternoon" },
              { fr: "Buenas noches", en: "Good evening / Good night" },
              { fr: "Adiós", en: "Goodbye" },
              { fr: "Hasta luego", en: "See you later" },
              { fr: "Hasta mañana", en: "See you tomorrow" },
            ],
          },
          {
            heading: "Cómo estás",
            body: "Preguntar cómo está alguien es esencial.",
            examples: [
              { fr: "¿Cómo estás?", en: "How are you? (informal)" },
              { fr: "¿Cómo está usted?", en: "How are you? (formal)" },
              { fr: "Estoy bien, gracias", en: "I'm well, thanks" },
              { fr: "Más o menos", en: "So-so" },
            ],
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "What does 'Buenas noches' mean?", options: ["Good morning", "Good afternoon", "Good evening / night", "Goodbye"], answer: "Good evening / night" },
          { type: "translate", question: "Translate: 'See you later'", answer: "Hasta luego" },
          { type: "fill-blank", question: "Complete: '___ días' = Good morning", answer: "Buenos" },
        ],
      },
      {
        id: "greetings-intro",
        title: "Presentarse",
        titleFr: "Presentarse",
        description: "Decir tu nombre y de dónde eres",
        emoji: "🙋",
        type: "conversation",
        content: [
          {
            heading: "Presentación básica",
            body: "Frases para presentarte a alguien.",
            examples: [
              { fr: "Me llamo María", en: "My name is María" },
              { fr: "Soy Juan", en: "I am Juan" },
              { fr: "¿Cómo te llamas?", en: "What's your name? (informal)" },
              { fr: "Mucho gusto", en: "Nice to meet you" },
              { fr: "Soy de México", en: "I'm from Mexico" },
              { fr: "¿De dónde eres?", en: "Where are you from?" },
            ],
            tip: "'Soy' viene del verbo ser y se usa para la identidad (nombre, origen).",
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'My name is Ana'", answer: "Me llamo Ana" },
          { type: "multiple-choice", question: "What does 'Mucho gusto' mean?", options: ["Goodbye", "Nice to meet you", "I'm fine", "Thank you"], answer: "Nice to meet you" },
          { type: "fill-blank", question: "___ dónde eres? = Where are you from?", answer: "De" },
        ],
      },
    ],
  },
  {
    id: "numbers",
    title: "Números y Conteo",
    description: "Números del 1 al 100",
    emoji: "🔢",
    requiredTopicId: "greetings",
    lessons: [
      {
        id: "numbers-1-20",
        title: "Números 1-20",
        titleFr: "Números 1-20",
        description: "Los primeros veinte números",
        emoji: "1️⃣",
        type: "vocabulary",
        content: [
          {
            heading: "Del 1 al 10",
            body: "Los números básicos.",
            examples: [
              { fr: "uno", en: "1" },
              { fr: "dos", en: "2" },
              { fr: "tres", en: "3" },
              { fr: "cuatro", en: "4" },
              { fr: "cinco", en: "5" },
              { fr: "seis", en: "6" },
              { fr: "siete", en: "7" },
              { fr: "ocho", en: "8" },
              { fr: "nueve", en: "9" },
              { fr: "diez", en: "10" },
            ],
          },
          {
            heading: "Del 11 al 20",
            body: "Números del 11 al 20.",
            examples: [
              { fr: "once", en: "11" },
              { fr: "doce", en: "12" },
              { fr: "trece", en: "13" },
              { fr: "catorce", en: "14" },
              { fr: "quince", en: "15" },
              { fr: "dieciséis", en: "16" },
              { fr: "diecisiete", en: "17" },
              { fr: "dieciocho", en: "18" },
              { fr: "diecinueve", en: "19" },
              { fr: "veinte", en: "20" },
            ],
            tip: "Del 16 al 19 se forma con 'diez + y + número' (dieciséis = diez y seis, juntos).",
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'seven'", answer: "siete" },
          { type: "translate", question: "Translate: 'fifteen'", answer: "quince" },
          { type: "multiple-choice", question: "What number is 'doce'?", options: ["10", "11", "12", "13"], answer: "12" },
        ],
      },
      {
        id: "numbers-21-100",
        title: "Números 21-100",
        titleFr: "Números 21-100",
        description: "Decenas y combinaciones",
        emoji: "💯",
        type: "vocabulary",
        content: [
          {
            heading: "Las decenas",
            body: "Las decenas del 20 al 100.",
            examples: [
              { fr: "veinte", en: "20" },
              { fr: "treinta", en: "30" },
              { fr: "cuarenta", en: "40" },
              { fr: "cincuenta", en: "50" },
              { fr: "sesenta", en: "60" },
              { fr: "setenta", en: "70" },
              { fr: "ochenta", en: "80" },
              { fr: "noventa", en: "90" },
              { fr: "cien", en: "100" },
            ],
          },
          {
            heading: "Números compuestos",
            body: "A partir del 31 se escriben por separado: 'treinta y uno'.",
            examples: [
              { fr: "veintiuno", en: "21 (juntos)" },
              { fr: "treinta y dos", en: "32 (separados)" },
              { fr: "cuarenta y cinco", en: "45" },
              { fr: "noventa y nueve", en: "99" },
            ],
            tip: "Del 21 al 29 se escriben juntos (veintiuno, veintidós...). Del 31 en adelante, separados con 'y'.",
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'fifty'", answer: "cincuenta" },
          { type: "fill-blank", question: "35 = treinta ___ cinco", answer: "y" },
          { type: "multiple-choice", question: "What number is 'setenta'?", options: ["60", "70", "80", "90"], answer: "70" },
        ],
      },
    ],
  },
  {
    id: "essentials",
    title: "Frases Esenciales",
    description: "Frases útiles para cualquier situación",
    emoji: "🆘",
    requiredTopicId: "greetings",
    lessons: [
      {
        id: "essentials-survival",
        title: "Frases de Supervivencia",
        titleFr: "Frases de Supervivencia",
        description: "Frases que debes saber",
        emoji: "🆘",
        type: "conversation",
        content: [
          {
            heading: "Cortesía",
            body: "Las palabras mágicas.",
            examples: [
              { fr: "Por favor", en: "Please" },
              { fr: "Gracias", en: "Thank you" },
              { fr: "Muchas gracias", en: "Thank you very much" },
              { fr: "De nada", en: "You're welcome" },
              { fr: "Perdón / Disculpe", en: "Excuse me / Sorry" },
              { fr: "Lo siento", en: "I'm sorry" },
            ],
          },
          {
            heading: "Pedir ayuda",
            body: "Cuando necesitas ayuda.",
            examples: [
              { fr: "No entiendo", en: "I don't understand" },
              { fr: "¿Habla inglés?", en: "Do you speak English?" },
              { fr: "¿Cómo se dice... en español?", en: "How do you say ... in Spanish?" },
              { fr: "¿Puedes repetir?", en: "Can you repeat?" },
              { fr: "Más despacio, por favor", en: "Slower, please" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'Thank you very much'", answer: "Muchas gracias" },
          { type: "translate", question: "Translate: 'I don't understand'", answer: "No entiendo" },
          { type: "multiple-choice", question: "How do you say 'You're welcome' in Spanish?", options: ["Perdón", "De nada", "Por favor", "Lo siento"], answer: "De nada" },
        ],
      },
    ],
  },
  {
    id: "articles-gender",
    title: "Artículos y Género",
    description: "El, la, los, las, un, una",
    emoji: "⚤",
    requiredTopicId: "essentials",
    lessons: [
      {
        id: "articles-definite",
        title: "El / La / Los / Las",
        titleFr: "El / La / Los / Las",
        description: "Los artículos definidos",
        emoji: "📎",
        type: "grammar",
        content: [
          {
            heading: "El género en español",
            body: "Todos los sustantivos tienen género: masculino o femenino.",
            table: {
              columns: ["Género", "Singular", "Plural"],
              rows: [
                ["Masculino", "el", "los"],
                ["Femenino", "la", "las"],
              ],
            },
            examples: [
              { fr: "el libro", en: "the book (masc.)" },
              { fr: "la mesa", en: "the table (fem.)" },
              { fr: "los niños", en: "the children (masc. pl.)" },
              { fr: "las flores", en: "the flowers (fem. pl.)" },
            ],
            tip: "Regla general: palabras que terminan en -o suelen ser masculinas; en -a, femeninas. ¡Hay excepciones!",
          },
        ],
        exercises: [
          { type: "multiple-choice", question: "Which is correct? 'casa' is...", options: ["el casa", "la casa", "los casa", "las casa"], answer: "la casa" },
          { type: "fill-blank", question: "___ libros (masculine plural)", answer: "los" },
          { type: "multiple-choice", question: "How do you say 'the flower'?", options: ["el flor", "la flor", "los flor", "las flor"], answer: "la flor" },
        ],
      },
      {
        id: "articles-indefinite",
        title: "Un / Una / Unos / Unas",
        titleFr: "Un / Una / Unos / Unas",
        description: "Los artículos indefinidos",
        emoji: "🔘",
        type: "grammar",
        content: [
          {
            heading: "Artículos indefinidos",
            body: "Equivalen a 'a/an' y 'some' en inglés.",
            table: {
              columns: ["Género", "Singular", "Plural"],
              rows: [
                ["Masculino", "un", "unos"],
                ["Femenino", "una", "unas"],
              ],
            },
            examples: [
              { fr: "un coche", en: "a car" },
              { fr: "una manzana", en: "an apple" },
              { fr: "unos amigos", en: "some friends (masc.)" },
              { fr: "unas chicas", en: "some girls" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'a book'", answer: "un libro" },
          { type: "translate", question: "Translate: 'some apples'", answer: "unas manzanas" },
          { type: "fill-blank", question: "___ amigo (masculino singular)", answer: "un" },
        ],
      },
    ],
  },
  {
    id: "subject-pronouns",
    title: "Pronombres y Ser",
    description: "Yo, tú, él, y el verbo ser",
    emoji: "👤",
    requiredTopicId: "articles-gender",
    lessons: [
      {
        id: "pronouns-basic",
        title: "Pronombres Personales",
        titleFr: "Pronombres Personales",
        description: "Yo, tú, él, ella, nosotros...",
        emoji: "👤",
        type: "grammar",
        content: [
          {
            heading: "Los pronombres personales",
            body: "Pronombres que reemplazan el sujeto.",
            table: {
              columns: ["Español", "Inglés"],
              rows: [
                ["yo", "I"],
                ["tú", "you (informal)"],
                ["él / ella", "he / she"],
                ["usted", "you (formal)"],
                ["nosotros / nosotras", "we"],
                ["vosotros / vosotras", "you all (Spain)"],
                ["ellos / ellas", "they"],
                ["ustedes", "you all"],
              ],
            },
            tip: "En español, los pronombres a menudo se omiten porque el verbo ya indica el sujeto.",
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'we' (masculine)", answer: "nosotros" },
          { type: "multiple-choice", question: "Which means 'they' (feminine)?", options: ["ellos", "ellas", "ustedes", "vosotras"], answer: "ellas" },
        ],
      },
      {
        id: "ser-verb",
        title: "El Verbo Ser",
        titleFr: "El Verbo Ser",
        description: "Conjugación de 'ser' (to be)",
        emoji: "✨",
        type: "grammar",
        content: [
          {
            heading: "El verbo 'ser' en presente",
            body: "'Ser' se usa para identidad, origen, profesión y características permanentes.",
            table: {
              columns: ["Pronombre", "Ser"],
              rows: [
                ["yo", "soy"],
                ["tú", "eres"],
                ["él/ella/usted", "es"],
                ["nosotros", "somos"],
                ["vosotros", "sois"],
                ["ellos/ellas/ustedes", "son"],
              ],
            },
            examples: [
              { fr: "Yo soy estudiante.", en: "I am a student." },
              { fr: "Ella es doctora.", en: "She is a doctor." },
              { fr: "Somos amigos.", en: "We are friends." },
            ],
            tip: "Recuerda: 'ser' es para cosas permanentes (identidad, origen). 'Estar' es para estados y ubicación.",
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Yo ___ estudiante. (I am a student.)", answer: "soy" },
          { type: "fill-blank", question: "Nosotros ___ amigos. (We are friends.)", answer: "somos" },
          { type: "multiple-choice", question: "How do you say 'She is'?", options: ["Ella soy", "Ella eres", "Ella es", "Ella son"], answer: "Ella es" },
        ],
      },
    ],
  },
  {
    id: "estar-verb",
    title: "Estar (To Be) y Expresiones",
    description: "El otro verbo 'ser'",
    emoji: "🤲",
    requiredTopicId: "subject-pronouns",
    lessons: [
      {
        id: "estar-conjugation",
        title: "Conjugando Estar",
        titleFr: "Conjugando Estar",
        description: "Estar en presente",
        emoji: "🤲",
        type: "grammar",
        content: [
          {
            heading: "El verbo 'estar'",
            body: "'Estar' se usa para estados temporales, emociones y ubicación.",
            table: {
              columns: ["Pronombre", "Estar"],
              rows: [
                ["yo", "estoy"],
                ["tú", "estás"],
                ["él/ella/usted", "está"],
                ["nosotros", "estamos"],
                ["vosotros", "estáis"],
                ["ellos/ellas/ustedes", "están"],
              ],
            },
            examples: [
              { fr: "Estoy cansado.", en: "I am tired." },
              { fr: "¿Cómo estás?", en: "How are you?" },
              { fr: "Madrid está en España.", en: "Madrid is in Spain." },
            ],
            tip: "Ser = característica permanente. Estar = estado temporal o ubicación.",
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Yo ___ cansado hoy. (I am tired today.)", answer: "estoy" },
          { type: "multiple-choice", question: "Ser or estar? 'Madrid ___ en España.'", options: ["es", "está", "son", "están"], answer: "está" },
          { type: "fill-blank", question: "Ellos ___ felices. (They are happy.)", answer: "están" },
        ],
      },
    ],
  },
  {
    id: "present-tense",
    title: "Presente (verbos -ar/-er/-ir)",
    description: "Conjugación regular en presente",
    emoji: "🏃",
    requiredTopicId: "estar-verb",
    lessons: [
      {
        id: "regular-verbs",
        title: "Verbos Regulares",
        titleFr: "Verbos Regulares",
        description: "Conjugar verbos -ar, -er, -ir",
        emoji: "🏃",
        type: "grammar",
        content: [
          {
            heading: "Verbos -AR (hablar)",
            body: "La conjugación regular de los verbos -AR.",
            table: {
              columns: ["Pronombre", "hablar"],
              rows: [
                ["yo", "hablo"],
                ["tú", "hablas"],
                ["él/ella", "habla"],
                ["nosotros", "hablamos"],
                ["vosotros", "habláis"],
                ["ellos", "hablan"],
              ],
            },
          },
          {
            heading: "Verbos -ER (comer)",
            body: "La conjugación regular de los verbos -ER.",
            table: {
              columns: ["Pronombre", "comer"],
              rows: [
                ["yo", "como"],
                ["tú", "comes"],
                ["él/ella", "come"],
                ["nosotros", "comemos"],
                ["vosotros", "coméis"],
                ["ellos", "comen"],
              ],
            },
          },
          {
            heading: "Verbos -IR (vivir)",
            body: "La conjugación regular de los verbos -IR.",
            table: {
              columns: ["Pronombre", "vivir"],
              rows: [
                ["yo", "vivo"],
                ["tú", "vives"],
                ["él/ella", "vive"],
                ["nosotros", "vivimos"],
                ["vosotros", "vivís"],
                ["ellos", "viven"],
              ],
            },
            tip: "Patrón general: quita la terminación (-ar/-er/-ir) y añade las nuevas.",
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Yo ___ español. (hablar — I speak Spanish.)", answer: "hablo" },
          { type: "fill-blank", question: "Nosotros ___ pizza. (comer — We eat pizza.)", answer: "comemos" },
          { type: "fill-blank", question: "Ellos ___ en Madrid. (vivir — They live in Madrid.)", answer: "viven" },
          { type: "multiple-choice", question: "How do you conjugate 'tú' + 'hablar'?", options: ["hablo", "hablas", "habla", "hablamos"], answer: "hablas" },
        ],
      },
    ],
  },
  {
    id: "adjectives",
    title: "Adjetivos y Descripciones",
    description: "Describir personas y cosas",
    emoji: "🎨",
    requiredTopicId: "present-tense",
    lessons: [
      {
        id: "adjectives-basics",
        title: "Cómo Funcionan los Adjetivos",
        titleFr: "Cómo Funcionan los Adjetivos",
        description: "Concordancia de género y número",
        emoji: "🎨",
        type: "grammar",
        content: [
          {
            heading: "Concordancia",
            body: "Los adjetivos concuerdan en género y número con el sustantivo.",
            examples: [
              { fr: "el chico alto", en: "the tall boy" },
              { fr: "la chica alta", en: "the tall girl" },
              { fr: "los chicos altos", en: "the tall boys" },
              { fr: "las chicas altas", en: "the tall girls" },
            ],
            tip: "La mayoría de adjetivos van DESPUÉS del sustantivo en español.",
          },
          {
            heading: "Adjetivos comunes",
            body: "Algunos adjetivos útiles.",
            examples: [
              { fr: "grande", en: "big" },
              { fr: "pequeño/pequeña", en: "small" },
              { fr: "bonito/bonita", en: "pretty" },
              { fr: "feo/fea", en: "ugly" },
              { fr: "nuevo/nueva", en: "new" },
              { fr: "viejo/vieja", en: "old" },
            ],
          },
        ],
        exercises: [
          { type: "fill-blank", question: "La casa ___ (bonito/bonita — the house is pretty)", answer: "bonita" },
          { type: "multiple-choice", question: "Which is correct? 'Los libros...'", options: ["nuevo", "nueva", "nuevos", "nuevas"], answer: "nuevos" },
        ],
      },
    ],
  },
  {
    id: "food-drinks",
    title: "Comida y Bebidas",
    description: "Vocabulario para comer y beber",
    emoji: "🍽️",
    requiredTopicId: "adjectives",
    lessons: [
      {
        id: "food-basics",
        title: "Comida y Bebidas Comunes",
        titleFr: "Comida y Bebidas Comunes",
        description: "Palabras esenciales en el restaurante",
        emoji: "🥘",
        type: "vocabulary",
        content: [
          {
            heading: "Comidas",
            body: "Vocabulario básico.",
            examples: [
              { fr: "el pan", en: "bread" },
              { fr: "el queso", en: "cheese" },
              { fr: "la carne", en: "meat" },
              { fr: "el pescado", en: "fish" },
              { fr: "la ensalada", en: "salad" },
              { fr: "la fruta", en: "fruit" },
              { fr: "el postre", en: "dessert" },
            ],
          },
          {
            heading: "Bebidas",
            body: "Qué pedir para beber.",
            examples: [
              { fr: "el agua", en: "water" },
              { fr: "el café", en: "coffee" },
              { fr: "el té", en: "tea" },
              { fr: "el vino", en: "wine" },
              { fr: "la cerveza", en: "beer" },
              { fr: "el zumo / jugo", en: "juice" },
            ],
          },
          {
            heading: "En el restaurante",
            body: "Frases útiles.",
            examples: [
              { fr: "Quiero un café, por favor.", en: "I want a coffee, please." },
              { fr: "La cuenta, por favor.", en: "The check, please." },
              { fr: "¿Qué recomienda?", en: "What do you recommend?" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'water'", answer: "agua" },
          { type: "translate", question: "Translate: 'the check, please'", answer: "la cuenta, por favor" },
          { type: "multiple-choice", question: "¿Qué significa 'queso'?", options: ["bread", "meat", "cheese", "fish"], answer: "cheese" },
        ],
      },
    ],
  },
  {
    id: "directions-places",
    title: "Direcciones y Lugares",
    description: "Navegar por la ciudad",
    emoji: "🗺️",
    requiredTopicId: "food-drinks",
    lessons: [
      {
        id: "places-city",
        title: "Lugares de la Ciudad",
        titleFr: "Lugares de la Ciudad",
        description: "Edificios y direcciones",
        emoji: "🏙️",
        type: "vocabulary",
        content: [
          {
            heading: "Lugares comunes",
            body: "Ubicaciones de la ciudad.",
            examples: [
              { fr: "la calle", en: "street" },
              { fr: "la plaza", en: "square" },
              { fr: "el banco", en: "bank" },
              { fr: "la tienda", en: "store" },
              { fr: "el mercado", en: "market" },
              { fr: "el hospital", en: "hospital" },
              { fr: "la estación", en: "station" },
              { fr: "el aeropuerto", en: "airport" },
            ],
          },
          {
            heading: "Pedir direcciones",
            body: "Frases para orientarte.",
            examples: [
              { fr: "¿Dónde está...?", en: "Where is...?" },
              { fr: "a la derecha", en: "to the right" },
              { fr: "a la izquierda", en: "to the left" },
              { fr: "todo recto / derecho", en: "straight ahead" },
              { fr: "cerca", en: "near" },
              { fr: "lejos", en: "far" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'Where is the bank?'", answer: "¿Dónde está el banco?" },
          { type: "translate", question: "Translate: 'to the right'", answer: "a la derecha" },
          { type: "multiple-choice", question: "¿Qué significa 'lejos'?", options: ["near", "far", "left", "right"], answer: "far" },
        ],
      },
    ],
  },
  {
    id: "time-days",
    title: "Hora, Días y Fechas",
    description: "Medir el tiempo en español",
    emoji: "📅",
    requiredTopicId: "directions-places",
    lessons: [
      {
        id: "time-telling",
        title: "Decir la Hora y los Días",
        titleFr: "Decir la Hora y los Días",
        description: "Horas, días, meses",
        emoji: "🕐",
        type: "vocabulary",
        content: [
          {
            heading: "Los días de la semana",
            body: "Lunes a domingo.",
            examples: [
              { fr: "lunes", en: "Monday" },
              { fr: "martes", en: "Tuesday" },
              { fr: "miércoles", en: "Wednesday" },
              { fr: "jueves", en: "Thursday" },
              { fr: "viernes", en: "Friday" },
              { fr: "sábado", en: "Saturday" },
              { fr: "domingo", en: "Sunday" },
            ],
            tip: "En español, los días no se escriben con mayúscula.",
          },
          {
            heading: "Los meses",
            body: "Enero a diciembre.",
            examples: [
              { fr: "enero, febrero, marzo", en: "Jan, Feb, Mar" },
              { fr: "abril, mayo, junio", en: "Apr, May, Jun" },
              { fr: "julio, agosto, septiembre", en: "Jul, Aug, Sep" },
              { fr: "octubre, noviembre, diciembre", en: "Oct, Nov, Dec" },
            ],
          },
          {
            heading: "La hora",
            body: "Decir la hora.",
            examples: [
              { fr: "¿Qué hora es?", en: "What time is it?" },
              { fr: "Es la una.", en: "It's one o'clock." },
              { fr: "Son las tres.", en: "It's three o'clock." },
              { fr: "Son las cinco y media.", en: "It's five thirty." },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'Monday'", answer: "lunes" },
          { type: "fill-blank", question: "Son ___ tres. (It's 3 o'clock)", answer: "las" },
          { type: "multiple-choice", question: "What month is 'julio'?", options: ["June", "July", "January", "August"], answer: "July" },
        ],
      },
    ],
  },
  {
    id: "negation",
    title: "Negación (Decir No)",
    description: "Cómo decir no y negar",
    emoji: "🚫",
    requiredTopicId: "time-days",
    lessons: [
      {
        id: "negation-basics",
        title: "No y Más Allá",
        titleFr: "No y Más Allá",
        description: "Formar frases negativas",
        emoji: "🚫",
        type: "grammar",
        content: [
          {
            heading: "Negación simple",
            body: "Para negar, solo pon 'no' antes del verbo.",
            examples: [
              { fr: "No hablo francés.", en: "I don't speak French." },
              { fr: "No tengo hambre.", en: "I'm not hungry." },
              { fr: "Ella no viene.", en: "She isn't coming." },
            ],
            tip: "¡Mucho más simple que en francés!",
          },
          {
            heading: "Palabras negativas",
            body: "Otros negativos útiles.",
            examples: [
              { fr: "nada", en: "nothing" },
              { fr: "nadie", en: "nobody" },
              { fr: "nunca", en: "never" },
              { fr: "tampoco", en: "neither / either" },
            ],
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'I don't speak Spanish'", answer: "No hablo español" },
          { type: "fill-blank", question: "Yo ___ tengo tiempo.", answer: "no" },
          { type: "multiple-choice", question: "What does 'nunca' mean?", options: ["nothing", "never", "nobody", "neither"], answer: "never" },
        ],
      },
    ],
  },
  {
    id: "questions",
    title: "Hacer Preguntas",
    description: "Palabras interrogativas",
    emoji: "❓",
    requiredTopicId: "negation",
    lessons: [
      {
        id: "questions-basics",
        title: "Palabras Interrogativas",
        titleFr: "Palabras Interrogativas",
        description: "Qué, cuándo, dónde, cómo",
        emoji: "❓",
        type: "grammar",
        content: [
          {
            heading: "Las palabras interrogativas",
            body: "Palabras clave para preguntar. ¡Siempre con acento!",
            examples: [
              { fr: "¿Qué?", en: "What?" },
              { fr: "¿Cuándo?", en: "When?" },
              { fr: "¿Dónde?", en: "Where?" },
              { fr: "¿Cómo?", en: "How?" },
              { fr: "¿Por qué?", en: "Why?" },
              { fr: "¿Quién?", en: "Who?" },
              { fr: "¿Cuánto?", en: "How much?" },
              { fr: "¿Cuál?", en: "Which?" },
            ],
            tip: "En español, las preguntas comienzan con ¿ (signo invertido) y terminan con ?",
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'Where are you?'", answer: "¿Dónde estás?" },
          { type: "fill-blank", question: "¿___ te llamas? (What's your name?)", answer: "Cómo" },
          { type: "multiple-choice", question: "What does '¿Por qué?' mean?", options: ["What?", "When?", "Why?", "Where?"], answer: "Why?" },
        ],
      },
    ],
  },
  {
    id: "past-tense",
    title: "Hablar del Pasado",
    description: "El pretérito indefinido",
    emoji: "⏪",
    requiredTopicId: "questions",
    lessons: [
      {
        id: "preterito",
        title: "Pretérito Indefinido",
        titleFr: "Pretérito Indefinido",
        description: "Acciones completadas en el pasado",
        emoji: "⏪",
        type: "grammar",
        content: [
          {
            heading: "Verbos -AR en pretérito",
            body: "Conjugación regular del pretérito para -AR (hablar).",
            table: {
              columns: ["Pronombre", "hablar (pretérito)"],
              rows: [
                ["yo", "hablé"],
                ["tú", "hablaste"],
                ["él/ella", "habló"],
                ["nosotros", "hablamos"],
                ["vosotros", "hablasteis"],
                ["ellos", "hablaron"],
              ],
            },
          },
          {
            heading: "Verbos -ER/-IR en pretérito",
            body: "Comparten la misma terminación. Ej: comer.",
            table: {
              columns: ["Pronombre", "comer (pretérito)"],
              rows: [
                ["yo", "comí"],
                ["tú", "comiste"],
                ["él/ella", "comió"],
                ["nosotros", "comimos"],
                ["vosotros", "comisteis"],
                ["ellos", "comieron"],
              ],
            },
            tip: "El pretérito indefinido se usa para acciones completadas en un tiempo específico del pasado.",
          },
        ],
        exercises: [
          { type: "fill-blank", question: "Yo ___ español ayer. (hablar, preterite — I spoke Spanish yesterday.)", answer: "hablé" },
          { type: "fill-blank", question: "Ellos ___ pizza. (comer, preterite — They ate pizza.)", answer: "comieron" },
          { type: "multiple-choice", question: "How do you conjugate 'tú + comer' in the preterite?", options: ["comí", "comiste", "comió", "comimos"], answer: "comiste" },
        ],
      },
    ],
  },
  {
    id: "future-plans",
    title: "Hablar del Futuro",
    description: "Futuro próximo con 'ir a'",
    emoji: "⏩",
    requiredTopicId: "past-tense",
    lessons: [
      {
        id: "near-future",
        title: "Futuro Próximo (ir a + infinitivo)",
        titleFr: "Futuro Próximo (ir a + infinitivo)",
        description: "Planes y acciones cercanas",
        emoji: "⏩",
        type: "grammar",
        content: [
          {
            heading: "La fórmula: ir a + infinitivo",
            body: "Es la forma más común de hablar del futuro cercano.",
            table: {
              columns: ["Pronombre", "ir"],
              rows: [
                ["yo", "voy"],
                ["tú", "vas"],
                ["él/ella", "va"],
                ["nosotros", "vamos"],
                ["vosotros", "vais"],
                ["ellos", "van"],
              ],
            },
            examples: [
              { fr: "Voy a estudiar.", en: "I'm going to study." },
              { fr: "Vamos a comer.", en: "We're going to eat." },
              { fr: "¿Qué vas a hacer?", en: "What are you going to do?" },
            ],
            tip: "Conjuga 'ir' + 'a' + infinitivo. ¡Muy similar a 'going to' en inglés!",
          },
        ],
        exercises: [
          { type: "translate", question: "Translate: 'I'm going to eat'", answer: "Voy a comer" },
          { type: "fill-blank", question: "Nosotros ___ a estudiar. (ir — We are going to study.)", answer: "vamos" },
          { type: "multiple-choice", question: "How do you say 'She is going to sing'?", options: ["Ella va cantar", "Ella va a cantar", "Ella voy cantar", "Ella van a cantar"], answer: "Ella va a cantar" },
        ],
      },
    ],
  },
];

export function getAllLessonsEs(): (Lesson & { topicId: string; topicTitle: string })[] {
  return LEARNING_PATH_ES.flatMap((topic) =>
    topic.lessons.map((lesson) => ({
      ...lesson,
      topicId: topic.id,
      topicTitle: topic.title,
    }))
  );
}

export function getLessonByIdEs(lessonId: string): (Lesson & { topicId: string; topicTitle: string }) | undefined {
  return getAllLessonsEs().find((l) => l.id === lessonId);
}

export function getTopicByIdEs(topicId: string): Topic | undefined {
  return LEARNING_PATH_ES.find((t) => t.id === topicId);
}
