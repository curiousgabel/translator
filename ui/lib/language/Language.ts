// TODO: maybe move this to under the translator package?
export class Language {
    name:string;
    apiName:string;

    constructor (name:string, apiName:string) {
        this.name = name;
        this.apiName = apiName;
    }
}