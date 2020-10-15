import {Language} from "../language/Language";

export class Message {
    language:Language;
    text:string;

    constructor (language:Language, text:string) {
        this.language = language;
        this.text = text;
    }
}