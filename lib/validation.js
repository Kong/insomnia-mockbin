const VALID_METHODS = [
	"GET",
	"POST",
	"PUT",
	"DELETE",
	"PATCH",
	"OPTIONS",
	"HEAD",
];

const validateRequestMethod = (originalMethod) => {
	if (!originalMethod) return originalMethod;
	const method = originalMethod.toUpperCase();
	if (!VALID_METHODS.includes(method)) {
		throw new Error(`Invalid request method: ${method}`);
	}
	return method;
};

module.exports = { validateRequestMethod };
