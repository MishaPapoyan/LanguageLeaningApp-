/**
 * Native-language word overlays.
 *
 * The app teaches a target language (fr/es/en). A learner whose native
 * language is Armenian must see the *Armenian* translation/definition of a
 * target word — not English (you can't learn French through English you
 * don't speak). Vocabulary rows carry optional `translationHy`/`definitionHy`
 * (and Ru) overlays; when absent we fall back to English so nothing breaks
 * while the overlays are backfilled progressively.
 *
 * Pass the user's UI locale (already computed via getLocale(nativeLanguage)
 * in every word game) — it is exactly "en" | "hy" | "ru".
 */

interface TranslationLike {
  translation: string;
  translationHy?: string | null;
  translationRu?: string | null;
}
interface DefinitionLike {
  definition: string;
  definitionHy?: string | null;
  definitionRu?: string | null;
}

/** The translation a native speaker should see for this word. */
export function wordTranslation(w: TranslationLike, locale?: string | null): string {
  if (locale === "hy" && w.translationHy) return w.translationHy;
  if (locale === "ru" && w.translationRu) return w.translationRu;
  return w.translation;
}

/** The definition a native speaker should see for this word. */
export function wordDefinition(w: DefinitionLike, locale?: string | null): string {
  if (locale === "hy" && w.definitionHy) return w.definitionHy;
  if (locale === "ru" && w.definitionRu) return w.definitionRu;
  return w.definition;
}
