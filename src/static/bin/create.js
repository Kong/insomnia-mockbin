/* globals $, hljs, FileReader */

const sample = {
	text: {
		status: 200,
		statusText: "OK",
		httpVersion: "HTTP/1.1",
		headers: [
			{
				name: "Content-Type",
				value: "text/plain",
			},
		],
		cookies: [],
		content: {
			mimeType: "text/plain",
			text: "Hello World",
		},
	},

	json: {
		status: 200,
		statusText: "OK",
		httpVersion: "HTTP/1.1",
		headers: [
			{
				name: "Content-Type",
				value: "application/json",
			},
		],
		cookies: [],
		content: {
			mimeType: "application/json",
			text: '{\n    "foo": "Hello World"\n}',
		},
	},

	jsonp: {
		status: 200,
		statusText: "OK",
		httpVersion: "HTTP/1.1",
		headers: [
			{
				name: "Content-Type",
				value: "application/javascript",
			},
		],
		cookies: [],
		content: {
			mimeType: "application/javascript",
			text: 'callback({\n    "foo": "Hello World"\n})',
		},
	},

	xml: {
		status: 200,
		statusText: "OK",
		httpVersion: "HTTP/1.1",
		headers: [
			{
				name: "Content-Type",
				value: "application/xml",
			},
		],
		cookies: [],
		content: {
			mimeType: "application/xml",
			text: '<?xml version="1.0"?>\n<foo>Hello World</foo>',
		},
	},
};

$(() => {
	$('select[name="example"]').on("change", function (e) {
		const data = sample[$(this).val()];

		if (data) {
			$('input[name="response"]').val(JSON.stringify(data));
			$("pre code").text(JSON.stringify(data, null, 2));
			hljs.highlightBlock($("pre code")[0]);
		}
	});

	$('input[type="file"]').on("change", (e) => {
		const file = e.target.files[0];

		if (!file) {
			return;
		}

		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				var data = JSON.parse(e.target.result);
			} catch (e) {
				console.log(e);
			}

			if (data) {
				$('input[name="response"]').val(JSON.stringify(data));

				$("pre code").text(JSON.stringify(data, null, 2));
				hljs.highlightBlock($("pre code")[0]);
			}
		};

		reader.readAsText(file);
	});

	const addKeyPair = function (event) {
		const self = $(this);

		const group = self.parents(".form-group");
		const form = self.parents("form");

		group.clone().appendTo(form);
	};

	const processFormData = (event) => {
		const response = {
			status: "",
			statusText: "",
			httpVersion: "HTTP/1.1",
			headers: [],
			cookies: [],
			content: {
				mimeType: "",
				text: "",
			},
		};

		$(".has-error").removeClass("has-error");

		$(".form input:not(:valid)").each(function () {
			$(this).parents(".form-group").addClass("has-error");
		});

		const forms = [
			{ form: "status", parent: response },
			{ form: "content", parent: response.content },
		];

		forms.forEach((item) => {
			$(
				'form[name="' +
					item.form +
					'"] div.form-group:not(.pair) .form-control',
			).each(function () {
				const self = $(this);

				item.parent[self.attr("name")] = self.val();
			});
		});

		const groups = ["headers", "cookies"];

		groups.forEach((pair) => {
			const params = [];

			$('form[name="' + pair + '"] .pair input[name="name"]')
				.slice(0, -1)
				.each((index, header) => {
					const value = $(header).val();

					if (value.trim() !== "") {
						params.push({ name: value });
					}
				});

			$('form[name="' + pair + '"] .pair input[name="value"]')
				.slice(0, -1)
				.each((index, header) => {
					if (params[index]) {
						params[index].value = $(header).val();
					}
				});

			response[pair] = params;
		});

		// fix type issues
		response.status = parseInt(response.status, 10);

		$('input[name="response"]').val(JSON.stringify(response));
		$("pre code").text(JSON.stringify(response, null, 2));

		hljs.highlightBlock($("pre code")[0]);
	};

	$(".toggle-comments").on("click", function (event) {
		$(".form").toggleClass("no-comments");
		$('.form  input[name="comment"]').attr(
			"disabled",
			$(this).hasClass("active"),
		);
	});

	$("form").on(
		"click",
		".form-group.pair:last-of-type .btn-success",
		addKeyPair,
	);

	$("form").on("focus", ".form-group.pair:last-child input", addKeyPair);

	$("form").on("click", ".form-group.pair .btn-danger", function (event) {
		$(this).parents(".form-group").remove();
	});

	$("form").on("keyup keypress change blur", ".form-control", processFormData);
	$("form").on("click", '[type!="submit"].btn', processFormData);

	$(document).ready(() => {
		processFormData();
	});
});
