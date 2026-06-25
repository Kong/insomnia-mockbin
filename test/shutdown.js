/* global describe, it */

const assert = require("node:assert");
const path = require("node:path");
const { spawn } = require("node:child_process");

require("should");

const SERVER = path.join(__dirname, "..", "server.js");

// Spawn server.js as its own process, wait until it is listening, then send
// `signal` and resolve with the exit code. Proves the signal is handled rather
// than ignored until Docker's 10s SIGKILL.
function runAndSignal(signal, port) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [SERVER], {
			env: {
				...process.env,
				MOCKBIN_PORT: String(port),
				MOCKBIN_REDIS: "redis://127.0.0.1:6379",
			},
		});

		let started = false;
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			reject(new Error("server did not start in time"));
		}, 5000);

		child.stdout.on("data", (chunk) => {
			if (!started && chunk.toString().includes("starting server")) {
				started = true;
				child.kill(signal);
			}
		});

		child.on("exit", (code, sig) => {
			clearTimeout(timer);
			resolve({ code, sig });
		});

		child.on("error", (err) => {
			clearTimeout(timer);
			reject(err);
		});
	});
}

describe("graceful shutdown", () => {
	it("should exit cleanly on SIGTERM", async () => {
		const r = await runAndSignal("SIGTERM", 18091);
		assert.strictEqual(r.code, 0, JSON.stringify(r));
	});

	it("should exit cleanly on SIGINT", async () => {
		const r = await runAndSignal("SIGINT", 18092);
		assert.strictEqual(r.code, 0, JSON.stringify(r));
	});
});
