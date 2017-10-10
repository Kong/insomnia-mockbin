## Requirements

- [Node.js](http://nodejs.org/) *(v0.10.x or higher)*
- [Redis](http://redis.io/)
- npm modules *listed in [package.json](package.json)*


## Install with [Docker](https://www.docker.com/)

### Building the docker image

```shell
docker-compose up -d --build
```

### Please note: if you changed redis container name, you will need to update it in `package.json` in config section.
