import {Language} from "../language/Language";
import {Config} from "./config/Config";

// TODO: repalce the ../s with a reference to the root directory
const config:Config = require('../../config/translator.json');

export class ServiceTranslator {
    static async translate(from:Language, to:Language, text:string) {
    	// TODO: add error handling for not having the config value
    	const p = config.parameters;
        
        // TODO: add some sort of handling here for unsupported languages
        // not sure if that should happen before the request (which assumes this is tightly
        // coupled to the service it's calling and knows what languages it supports) or after the
        // request (but then what do we display as the message?)
        let url = new URL(config.url);
        url.searchParams.append(p.text, text);
        url.searchParams.append(p.from, from.apiName);
        url.searchParams.append(p.to, to.apiName);

        const response = await fetch(url.href);
        const body = await response.json();
        
        return body;
    }
}