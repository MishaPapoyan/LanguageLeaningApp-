import { TutorScenario } from "@/types";

export const SCENARIO_INFO: Record<TutorScenario, { label: string; emoji: string; description: string; color: string }> = {
  waiter: {
    label: "At the Café",
    emoji: "☕",
    description: "Order food & drinks in your target language",
    color: "amber",
  },
  traveler: {
    label: "Exploring the City",
    emoji: "🏙️",
    description: "Navigate and ask for directions",
    color: "blue",
  },
  teacher: {
    label: "Language Class",
    emoji: "📚",
    description: "Structured grammar lesson",
    color: "purple",
  },
  free: {
    label: "Free Chat",
    emoji: "💬",
    description: "Open conversation practice",
    color: "green",
  },
};
