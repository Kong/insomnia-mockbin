const debug = require("debug")("mockbin");
const validate = require("har-validator");
const utils = require("../../utils");
const { mockSchema, mockFormats } = require("../../schemas");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({
	strict: false, // Used for setting the custom property (`violationMessage`) in mockSchema.
	useDefaults: true, // This will fill in default values within the schema. Resolves backward compatibility issues when changing schemas.
});

// Adds standard Ajv formats.
addFormats(ajv, { mode: "full", formats: ["uri-reference"] });

// Adds custom mockbin formats.
mockFormats.forEach((item) => {
	ajv.addFormat(item.name, item.format);
});

const mockValidate = ajv.compile(mockSchema);

module.exports = (client) => (req, res, next) => {
	const compoundId = utils.createCompoundId(
		req.headers["insomnia-mock-method"],
		req.params.uuid,
		req.params[0],
	);

	// Ensure the CompoundId (`id` + `path`) are correctly structured.
	const status = utils.isValidCompoundId(req.params.uuid, req.params[0]);
	if (status) {
		res.body = {
			error: status.error,
			message: status.message,
		};
		next();
		return;
	}
	let mock = req.jsonBody;
	// overritten by application/x-www-form-urlencoded or multipart/form-data
	if (req.simple.postData.text) {
		try {
			mock = JSON.parse(req.simple.postData.text);
		} catch (e) {
			debug(e);
		}
	}
	if (!mock) {
		res.body = {
			error: "Response body is required",
			message: 'The "response" field is required',
		};
		next();
		return;
	}

	if (!mock.content) {
		mock.content = {};
	}

	// Enforce adherence to expected mock structure.
	if (!mockValidate(mock)) {
		const status = {};
		status.error = "Invalid mock structure";

		// This will only return the first violation per request.
		try {
			const err = mockValidate.errors[0];
			let customMessage = null;
			try {
				const segments = err.schemaPath
					.replace(/^#\//, "")
					.split("/")
					.slice(0, -1);
				let node = mockSchema;
				for (const seg of segments) {
					node = node[seg];
					if (node === undefined) break;
				}
				customMessage = node?.errorMessage ?? null;
			} catch (_) {}
			status.message = customMessage || err.message;
		} catch (e) {
			debug(e);
			status.message =
				"The mock data structure is invalid; one or more properties violate the accepted schema.";
		}

		res.body = {
			error: status.error,
			message: status.message,
		};
		next();
		return;
	}

	// Moved below the schema validation to prevent a crash.
	// Express is sensitive to mismatched content-length header.
	mock.headers = mock.headers.filter(
		(header) => header.name.toLowerCase() !== "content-length",
	);

	validate
		.response(mock)
		.then(function () {
			client.set(
				`bin:${compoundId}`,
				JSON.stringify(mock),
				"EX",
				process.env.MOCKBIN_REDIS_EXPIRE_SECONDS || "1000000000",
			);

			res.view = "redirect";
			res.status(200).location(`/bin/${compoundId}`).body = req.params.uuid;
		})
		.catch((err) => {
			res.body = {
				error: "Failed to set response",
				message: err.message,
			};
		})
		.then(() => {
			next();
		});
};
