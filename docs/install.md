## Requirements

- [Node.js](http://nodejs.org/) *(v0.10.x or higher)*
- [Redis](http://redis.io/)
- npm modules *listed in [package.json](package.json)*

## Install from source

```shell
git clone https://github.com/Kong/mockbin.git ./mockbin
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

To run, this image needs to be linked to a Redis container:

```shell
docker run -d --name mockbin_redis redis
docker run -d -p 8080:8080 --link mockbin_redis:redis mashape/mockbin
```
