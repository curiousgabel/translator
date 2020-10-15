const {Translate} = require('@google-cloud/translate').v2;
const config:any = require('config');

class GoogleTranslator {
	private static translator:typeof Translate;

	static getTranslator() {
		if (!GoogleTranslator.translator) {
			// TODO: Add validation here
			const projectId:string = config.get('projectId');
			const keyFilename:string = config.get('keyFilename');

			GoogleTranslator.translator = new Translate({
				projectId,
				keyFilename
			});
		}

		return GoogleTranslator.translator;
	}

	static async translate(from, to, text) {
		// console.log(`Translating ${text} from ${from} to ${to}`);
		const t = GoogleTranslator.getTranslator();
		// console.log('Translator setup');
		let translations;
 		
 		try {
			[translations] = await t.translate(text, {'from':from, 'to':to});
			translations = Array.isArray(translations) ? translations : [translations];
		} catch (exception) {
			console.log("Exception: ", exception);
		}

		return translations;
	}
}

module.exports = GoogleTranslator;