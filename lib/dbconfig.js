import redis from "redis";

const client = redis.createClient(process.env.MOCKBIN_REDIS);

client.on("connect", () => {
	console.log("Redis Database connected" + "\n");
});

client.on("reconnecting", () => {
	console.log("Redis client reconnecting");
});

client.on("ready", () => {
	console.log("Redis client is ready");
});

client.on("error", (err) => {
	console.log(`Something went wrong ${err}`);
});

client.on("end", () => {
	console.log("\nRedis client disconnected");
	console.log("Server is going down now...");
	process.exit();
});
export default client;

// const set = (key, value) => {
// 	client.set(key, value, redis.print);
// 	return "done";
// };

// const get = (key) => {
// 	return new Promise((resolve, reject) => {
// 		client.get(key, (error, result) => {
// 			if (error) {
// 				console.log(error);
// 				reject(error);
// 			}
// 			resolve(result);
// 		});
// 	});
// };

// const close = () => {
// 	client.quit();
// };
