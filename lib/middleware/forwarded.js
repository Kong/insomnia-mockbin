const forwarded = require("forwarded-http/lib/middleware");

module.exports = forwarded({ allowPrivate: true });
