## Requirements

- Git (for cloning code)
- Docker (for building local image from code and then running actual containers)

### Install from source

```shell
git clone https://github.com/haotri-pham-kapsch/mockbin.git ./mockbin
cd mockbin
```

### Building the docker image

```shell
docker build -t localbuild/mockbin .
```

### Running the docker container (from built image)

To run, this image needs to be linked to a Redis container:

```shell
docker run -d --name mockbin_redis redis
docker run -d --name kong_mockbin -p 8080:8080 --link mockbin_redis:redis localbuild/mockbin
```

Alternatively, spin up both services with following _docker-compose.yml_ file:

```
version: '3'

services:
  mockbin_redis:
    image: 'redis'
    container_name: mockbin_redis
  kong_mockbin:
    image: 'localbuild/mockbin'
    container_name: kong_mockbin
    ports:
      - 8080:8080
    links:
      - mockbin_redis:redis
```
