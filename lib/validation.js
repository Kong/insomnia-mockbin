const VALID_METHODS = [
	"GET",
	"POST",
	"PUT",
	"DELETE",
	"PATCH",
	"OPTIONS",
	"HEAD",
];

const validateRequestMethod = (method) => {
	if (!method) return method;
	if (!VALID_METHODS.includes(method)) {
		throw new Error(`Invalid request method: ${method}`);
	}
	return method;
};

module.exports = { validateRequestMethod };
