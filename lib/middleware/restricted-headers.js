const getRestrictedHeaders = () => {
	return (process.env.MOCKBIN_CLOUD_RESTRICTED_HEADERS || "")
		.split(",")
		.map((header) => header.trim().toLowerCase())
		.filter(Boolean);
};

module.exports = (req, res, next) => {
	const restrictedHeaders = getRestrictedHeaders();

	for (const headerName of restrictedHeaders) {
		delete req.headers[headerName];
	}

	next();
};
