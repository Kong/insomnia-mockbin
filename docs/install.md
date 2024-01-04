## Requirements

- [Node.js](http://nodejs.org/) *(v21 or higher)*
- [Redis](http://redis.io/)
- npm modules *listed in [package.json](package.json)*

## Install from source

```shell
git clone https://github.com/Kong/mockbin.git ./mockbin
cd mockbin
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
```
