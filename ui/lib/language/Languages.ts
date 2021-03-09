import {Language} from "./Language";

// TODO: Add a metric assload more options
export const Languages: Record<string, Language> = {
    english: new Language('English', 'en'),
    spanish: new Language('Spanish', 'es'),
    french: new Language('French', 'fr'),
    italian: new Language('Italian', 'it'),
    bulgarian: new Language('Bulgarian', 'bg')
} as const;