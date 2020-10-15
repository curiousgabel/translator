import {Language} from "../language/Language";

export interface Translator{
	translate(from:Language, to:Language, text:string);
}