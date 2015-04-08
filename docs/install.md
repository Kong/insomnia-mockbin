## Requirements

- [Node.js](http://nodejs.org/) *(v0.10.x or higher)*
- [Redis](http://redis.io/)
- npm modules *listed in [package.json](package.json)*

## Install from source

```shell
git clone https://github.com/Mashape/mockbin.git ./mockbin
cd mockbin
```

## Install with [npm](https://www.npmjs.com/):

```shell
npm install mockbin
```

## Install with [Docker](https://www.docker.com/)

### Building the docker image

```shell
docker build -t mockbin .
```

### Running the docker container

```shell
docker run -d --name myredis redis
docker run -d -p 80:8080 --link myredis:redis mockbin
```



