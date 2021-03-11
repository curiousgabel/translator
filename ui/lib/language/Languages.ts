import {Language} from "./Language";

// TODO: Add a metric assload more options
export const Languages: Record<string, Language> = {
    en: new Language(
    	'English',
    	'en',
    	new Map([
    		['en','English'],
    		['es','Spanish'],
    		['fr','French'],
    		['it','Italian'],
    		['bg','Bulgairan']
    	])),
    es: new Language(
    	'Español',
    	'es',
    	new Map([
    		['en','Inglés'],
    		['es','Español'],
    		['fr','Francés'],
    		['it','Italiano'],
    		['bg','Búlgaro']
    	])),
    fr: new Language(
    	'Français',
    	'fr',
    	new Map([
    		['en','Anglais'],
    		['es','Espagnol'],
    		['fr','Français'],
    		['it','Italien'],
    		['bg','Bulgare']
    	])),
    it: new Language(
    	'Italiano',
    	'it',
    	new Map([
    		['en','Inglese'],
    		['es','Spagnolo'],
    		['fr','Francese'],
    		['it','Italiano'],
    		['bg','Bulgaro']
    	])),
    bg: new Language(
    	'български',
    	'bg',
    	new Map([
    		['en','Английски'],
    		['es','Испански'],
    		['fr','Френски'],
    		['it','Италиански'],
    		['bg','български']
    	]))
} as const;