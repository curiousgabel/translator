// TODO: maybe move this to under the translator package?
export class Language {
    name:string;
    apiName:string;
    languageMap:Map<string, string>

    constructor (name:string, apiName:string, map:Map<string, string>) {
        this.name = name;
        this.apiName = apiName;
        this.languageMap = map;
    }
}