export interface LanguageConfig {
  code: string;
  label: string;
  flag: string;
  /** BCP-47 tag for Web Speech API / TTS */
  ttsLocale: string;
  /** Voxtral/Mistral voice ID — null falls back to Web Speech */
  voxtralVoice: string | null;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "fr",
    label: "French",
    flag: "🇫🇷",
    ttsLocale: "fr-FR",
    voxtralVoice: "fr",
    nativeName: "Français",
  },
  {
    code: "es",
    label: "Spanish",
    flag: "🇪🇸",
    ttsLocale: "es-ES",
    voxtralVoice: "es",
    nativeName: "Español",
  },
];

export const LANGUAGE_MAP: Record<string, LanguageConfig> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, l])
);

export function getLanguageConfig(code: string): LanguageConfig {
  return LANGUAGE_MAP[code] ?? LANGUAGE_MAP["fr"];
}
