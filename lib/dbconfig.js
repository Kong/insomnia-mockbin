import redis from 'redis';

var client = redis.createClient(process.env.MOCKBIN_REDIS);

client.on('connect', function () {
  console.log('Redis Database connected' + '\n');
});

client.on('reconnecting', function () {
  console.log('Redis client reconnecting');
});

client.on('ready', function () {
  console.log('Redis client is ready');
});

client.on('error', function (err) {
  console.log('Something went wrong ' + err);
});

client.on('end', function () {
  console.log('\nRedis client disconnected');
  console.log('Server is going down now...');
  process.exit();
});
export default client

const set = (key, value) => {
  client.set(key, value, redis.print);
  return 'done';
}

const get = (key) => {
  return new Promise((resolve, reject) => {
    client.get(key, function (error, result) {
      if (error) {
        console.log(error);
        reject(error);
      }
      resolve(result);
    });
  });
}

const close = () => {
  client.quit();
}