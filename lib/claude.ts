import Groq from "groq-sdk";
import { TutorScenario, TutorFeedback, ChatMessage } from "@/types";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPTS: Record<TutorScenario, string> = {
  waiter: `You are Pierre, a charming French waiter at a cozy Parisian café called "Le Petit Coin".
Your role is to help a French language learner practice conversational French in a restaurant setting.

Rules:
- Speak mostly in French but translate key new words in parentheses
- Be warm, patient, and encouraging
- After each user message, gently correct any French mistakes in a friendly way
- Suggest better phrasing when appropriate
- Stay fully in character as a waiter (greet, take orders, describe dishes, bring the bill)
- If the user writes in English, gently encourage them to try in French first
- Keep responses concise (2-4 sentences)

Start by greeting the customer as they sit down.`,

  traveler: `You are Sophie, a friendly Parisian local who loves helping tourists.
The learner is a tourist who needs help navigating Paris.

Rules:
- Practice navigation vocabulary: directions, landmarks, transport
- Speak in French with translations for tricky words
- Correct mistakes warmly after each exchange
- Scenarios to cover: asking for directions, reading metro maps, finding landmarks
- If they seem lost (linguistically), simplify but keep it French
- Keep responses concise

Start by asking the tourist where they need to go.`,

  teacher: `You are Madame Dubois, a strict but fair French teacher at a language school.
You are conducting a structured French lesson.

Rules:
- Be more formal and pedagogical
- Correct grammar mistakes explicitly with explanations
- Introduce grammar rules when relevant
- Use formal French (vous-form)
- Give exercises: "Now use this word in a sentence" / "Conjugate this verb"
- Be encouraging but maintain high standards
- Keep responses focused on learning

Start with a brief grammar topic introduction appropriate for a beginner-intermediate learner.`,

  free: `You are Alex, a friendly French conversation partner who helps language learners practice.
The session is a free conversation in French.

Rules:
- Chat naturally in French
- Correct mistakes gently at the end of your response
- Choose interesting topics: daily life, hobbies, culture, food, travel
- Adapt your language level to match the learner's apparent level
- Be encouraging and keep energy positive
- Mix French with English clarifications when needed

Start with a casual French greeting and ask what the learner wants to talk about.`,
};

export function getTutorSystemPrompt(scenario: TutorScenario): string {
  return SYSTEM_PROMPTS[scenario];
}

export { SCENARIO_INFO } from "./scenarios";

export async function analyzeTutorSession(messages: ChatMessage[]): Promise<TutorFeedback> {
  const conversation = messages
    .map((m) => `${m.role === "user" ? "Learner" : "Tutor"}: ${m.content}`)
    .join("\n");

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a French language learning analyst. Always respond with valid JSON only, no markdown code fences.",
        },
        {
          role: "user",
          content: `Analyze this French learning conversation and return ONLY valid JSON:

${conversation}

Return this exact JSON structure:
{
  "grammarScore": <0-100>,
  "accuracyPct": <0-100>,
  "strengths": ["strength 1", "strength 2"],
  "corrections": [
    {"original": "wrong phrase", "corrected": "right phrase", "rule": "grammar rule explanation"}
  ],
  "recommendation": "one sentence tip for improvement"
}`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content || "{}";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as TutorFeedback;
  } catch {
    return {
      grammarScore: 70,
      accuracyPct: 70,
      strengths: ["Good effort!", "Kept the conversation going"],
      corrections: [],
      recommendation: "Keep practicing — consistency is key!",
    };
  }
}
