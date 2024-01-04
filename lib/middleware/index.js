const changeCase = require("change-case");

module.exports = require("require-directory")(module, {
	rename: (name) => changeCase.camelCase(name),
});
