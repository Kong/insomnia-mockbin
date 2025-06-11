const debug = require("debug")("mockbin");
const { faker } = require("@faker-js/faker");
const { Liquid, Drop } = require("liquidjs");

module.exports = (client) => (req, res, next) => {
	// compoundId allows us to provide paths in the id to resolve to a specific bin
	const compoundId = req.params.uuid + req.params[0];
	client.get(`bin:${compoundId}`, function (err, value) {
		if (err) {
			debug(err);

			throw err;
		}

		if (value) {
			const har = JSON.parse(value);

			// log interaction & send the appropriate response based on HAR
			client.rpush(`log:${compoundId}`, JSON.stringify(req.har.log.entries[0]));
			client.ltrim(`log:${compoundId}`, 0, 100);

			// headers
			har.headers.map((header) => {
				res.set(header.name.trim(), header.value);
			});

			// cookies
			har.cookies.map((cookie) => {
				res.cookie(cookie.name, cookie.value);
			});

			// status
			res.httpVersion = har.httpVersion.split("/")[1];
			res.statusCode = har.status || 200;
			res.statusMessage = har.statusText
				? encodeURIComponent(har.statusText)
				: "OK";

			// special condition
			if (har.redirectURL !== "") {
				res.location(har.redirectURL);
			}

			let body = har.content.text || null;
			if (body && har._dynamicMockInBody) {
				try {
					body = renderBody({
						template: body,
						req,
					});
				} catch (e) {
					debug(`Error rendering body template for ${compoundId}: ${e.message}`);
					return res.status(500).json({
						error: "Error rendering body template",
						message: e.message,
					});
				}
			}

			return res.send(body);
		}

		next();
	});
};

let engine = null;

(function initEngine() {
	engine = new Liquid();

	const builtInFilterWhiteList = [
		'default',
	];

	function disabledFilter(name) {
		return function () {
			throw new Error(`filter "${name}" disabled`);
		};
	}

	for (const filterName in engine.filters) {
		if (!builtInFilterWhiteList.includes(filterName)) {
			engine.registerFilter(filterName, disabledFilter(filterName));
		}
	}

	const builtInTagWhiteList = [
		"assign",
		"break",
		"continue",
		"for",
		"if",
		"raw",
		"unless",
	];

	const disabledTag = {
		parse: function (token) {
			throw new Error(`tag "${token.name}" disabled`);
		},
	};

	for (const tagName in engine.tags) {
		if (!builtInTagWhiteList.includes(tagName)) {
			engine.registerTag(tagName, disabledTag);
		}
	}
})();

function renderBody({
	template,
	req,
}) {
	const pathSegments = req.params[0].split("/");
	pathSegments.shift(); // remove the leading slash
	
	return engine.parseAndRenderSync(template, {
		faker: new FakerDrop(),
		req: {
			headers: new HeadersDrop(req.headers),
			queryParams: req.query,
			pathSegments,
			body: new BodyDrop(req),
		},
	});
}


const MAX_BODY_CHAR_LENGTH = 1000000; // 1 MB
const reqSymbol = Symbol("req");
const multipartContetTypes = [
	"multipart/mixed",
	"multipart/related",
	"multipart/form-data",
	"multipart/alternate",
];
class BodyDrop extends Drop {
	constructor(req) {
		super();
		// use a symbol to avoid name collisions with the headers
		this[reqSymbol] = req;
	}
	valueOf() {
		// return the whole body as a string
		// truncated to MAX_BODY_CHAR_LENGTH
		return this[reqSymbol]?.body?.substring(0, MAX_BODY_CHAR_LENGTH) || "";
	}
	liquidMethodMissing(key) {
		const req = this[reqSymbol];
		if (req.contentType === "application/json" && req.jsonBody) {
			return req.jsonBody[key];
		} else if (req.contentType === "application/x-www-form-urlencoded" && req.formBody) {
			return req.formBody[key];
		} else if (multipartContetTypes.includes(req.contentType) && req.multiPartSimple) {
			// req.multiPartSimple[key] is either a string or an array of strings here
			return req.multiPartSimple[key];
		} else {
			// do not support parsing body for other content types
			return undefined;
		}
	}
}

const headersSymbol = Symbol("headers");
class HeadersDrop extends Drop {
	constructor(headers) {
		super();
		// use a symbol to avoid name collisions with the headers
		this[headersSymbol] = headers;
	}
	liquidMethodMissing(key) {
		// normalize key to lowercase since keys in req.headers are lower-cased.
		// https://nodejs.org/api/http.html#http_message_headers
		key = key.toLowerCase();
		if (this[headersSymbol].hasOwnProperty(key) && typeof this[headersSymbol][key] === "string") {
			return this[headersSymbol][key];
		} else {
			return undefined;
		}
	}
}

class FakerDrop extends Drop {
	liquidMethodMissing(key) {
		if (fakerFunctions.hasOwnProperty(key) && typeof fakerFunctions[key] === "function") {
			return fakerFunctions[key]();
		} else {
			return undefined;
		}
	}
}

const fakerFunctions = {
	guid: () => faker.string.uuid(),
	timestamp: () => faker.date.anytime().getTime().toString(),
	isoTimestamp: () => faker.date.anytime().toISOString(),
	randomUUID: () => faker.string.uuid(),
	randomAlphaNumeric: () => faker.string.alphanumeric(),
	randomBoolean: () => faker.datatype.boolean(),
	randomInt: () => faker.number.int(),
	randomColor: () => faker.color.human(),
	randomHexColor: () => faker.internet.color(),
	randomAbbreviation: () => faker.hacker.abbreviation(),
	randomIP: () => faker.internet.ip(),
	randomIPV6: () => faker.internet.ipv6(),
	randomMACAddress: () => faker.internet.mac(),
	randomPassword: () => faker.internet.password(),
	randomLocale: () => faker.location.countryCode(),
	randomUserAgent: () => faker.internet.userAgent(),
	randomProtocol: () => faker.internet.protocol(),
	randomSemver: () => faker.system.semver(),
	randomFirstName: () => faker.person.firstName(),
	randomLastName: () => faker.person.lastName(),
	randomFullName: () => faker.person.fullName(),
	randomNamePrefix: () => faker.person.prefix(),
	randomNameSuffix: () => faker.person.suffix(),
	randomJobArea: () => faker.person.jobArea(),
	randomJobDescriptor: () => faker.person.jobDescriptor(),
	randomJobTitle: () => faker.person.jobTitle(),
	randomJobType: () => faker.person.jobType(),
	randomPhoneNumber: () => faker.phone.number(),
	randomPhoneNumberExt: () => faker.phone.number(),
	randomCity: () => faker.location.city(),
	randomStreetName: () => faker.location.street(),
	randomStreetAddress: () => faker.location.streetAddress(),
	randomCountry: () => faker.location.country(),
	randomCountryCode: () => faker.location.countryCode(),
	randomLatitude: () => faker.location.latitude(),
	randomLongitude: () => faker.location.longitude(),
	randomAvatarImage: () => faker.image.avatar(),
	randomImageUrl: () => faker.image.url(),
	randomAbstractImage: () => faker.image.urlLoremFlickr({ category: 'abstract' }),
	randomAnimalsImage: () => faker.image.urlLoremFlickr({ category: 'animals' }),
	randomBusinessImage: () => faker.image.urlLoremFlickr({ category: 'business' }),
	randomCatsImage: () => faker.image.urlLoremFlickr({ category: 'cats' }),
	randomCityImage: () => faker.image.urlLoremFlickr({ category: 'city' }),
	randomFoodImage: () => faker.image.urlLoremFlickr({ category: 'food' }),
	randomNightlifeImage: () => faker.image.urlLoremFlickr({ category: 'nightlife' }),
	randomFashionImage: () => faker.image.urlLoremFlickr({ category: 'fashion' }),
	randomPeopleImage: () => faker.image.urlLoremFlickr({ category: 'people' }),
	randomNatureImage: () => faker.image.urlLoremFlickr({ category: 'nature' }),
	randomSportsImage: () => faker.image.urlLoremFlickr({ category: 'sports' }),
	randomTransportImage: () => faker.image.urlLoremFlickr({ category: 'transport' }),
	randomImageDataUri: () => faker.image.dataUri(),
	randomBankAccount: () => faker.finance.accountNumber(),
	randomBankAccountName: () => faker.finance.accountName(),
	randomCreditCardMask: () => faker.finance.maskedNumber(),
	randomBankAccountBic: () => faker.finance.bic(),
	randomBankAccountIban: () => faker.finance.iban(),
	randomTransactionType: () => faker.finance.transactionType(),
	randomCurrencyCode: () => faker.finance.currencyCode(),
	randomCurrencyName: () => faker.finance.currencyName(),
	randomCurrencySymbol: () => faker.finance.currencySymbol(),
	randomBitcoin: () => faker.finance.bitcoinAddress(),
	randomCompanyName: () => faker.company.name(),
	randomCompanySuffix: () => faker.company.name(),
	randomBs: () => faker.company.buzzPhrase(),
	randomBsAdjective: () => faker.company.buzzAdjective(),
	randomBsBuzz: () => faker.company.buzzVerb(),
	randomBsNoun: () => faker.company.buzzNoun(),
	randomCatchPhrase: () => faker.company.catchPhrase(),
	randomCatchPhraseAdjective: () => faker.company.catchPhraseAdjective(),
	randomCatchPhraseDescriptor: () => faker.company.catchPhraseDescriptor(),
	randomCatchPhraseNoun: () => faker.company.catchPhraseNoun(),
	randomDatabaseColumn: () => faker.database.column(),
	randomDatabaseType: () => faker.database.type(),
	randomDatabaseCollation: () => faker.database.collation(),
	randomDatabaseEngine: () => faker.database.engine(),
	randomDateFuture: () => faker.date.future().toISOString(),
	randomDatePast: () => faker.date.past().toISOString(),
	randomDateRecent: () => faker.date.recent().toISOString(),
	randomWeekday: () => faker.date.weekday(),
	randomMonth: () => faker.date.month(),
	randomDomainName: () => faker.internet.domainName(),
	randomDomainSuffix: () => faker.internet.domainSuffix(),
	randomDomainWord: () => faker.internet.domainWord(),
	randomEmail: () => faker.internet.email(),
	randomExampleEmail: () => faker.internet.exampleEmail(),
	randomUserName: () => faker.internet.userName(),
	randomUrl: () => faker.internet.url(),
	randomFileName: () => faker.system.fileName(),
	randomFileType: () => faker.system.fileType(),
	randomFileExt: () => faker.system.fileExt(),
	randomCommonFileName: () => faker.system.commonFileName(),
	randomCommonFileType: () => faker.system.commonFileType(),
	randomCommonFileExt: () => faker.system.commonFileExt(),
	randomFilePath: () => faker.system.filePath(),
	randomDirectoryPath: () => faker.system.directoryPath(),
	randomMimeType: () => faker.system.mimeType(),
	randomPrice: () => faker.commerce.price(),
	randomProduct: () => faker.commerce.product(),
	randomProductAdjective: () => faker.commerce.productAdjective(),
	randomProductMaterial: () => faker.commerce.productMaterial(),
	randomProductName: () => faker.commerce.productName(),
	randomDepartment: () => faker.commerce.department(),
	randomNoun: () => faker.hacker.noun(),
	randomVerb: () => faker.hacker.verb(),
	randomIngverb: () => faker.hacker.ingverb(),
	randomAdjective: () => faker.hacker.adjective(),
	randomWord: () => faker.hacker.noun(),
	randomWords: () => faker.lorem.words(),
	randomPhrase: () => faker.hacker.phrase(),
	randomLoremWord: () => faker.lorem.word(),
	randomLoremWords: () => faker.lorem.words(),
	randomLoremSentence: () => faker.lorem.sentence(),
	randomLoremSentences: () => faker.lorem.sentences(),
	randomLoremParagraph: () => faker.lorem.paragraph(),
	randomLoremParagraphs: () => faker.lorem.paragraphs(),
	randomLoremText: () => faker.lorem.text(),
	randomLoremSlug: () => faker.lorem.slug(),
	randomLoremLines: () => faker.lorem.lines(),
};