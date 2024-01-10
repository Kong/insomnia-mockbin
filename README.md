# Mockbin ![version][npm-version] [![License][npm-license]][license-url]

[![Gitter][gitter-image]][gitter-url]

Mockbin is used internally and maintained by [Kong](https://github.com/Kong), who also maintain the open-source API Gateway [Kong](https://github.com/Kong/kong).

## Table of contents

- [Features](#features)
- [Installation](#installation)
  - [Requirements](#requirements)
  - [Running with Node](#running-with-node)
  - [Running with Docker Compose](#running-with-docker-compose)
- [Documentation](#documentation)
- [Bugs and feature requests](#bugs-and-feature-requests)
- [Contributing](#contributing)
- [License](#license)

## Features

- uses HAR format
- supports JSON, YAML, XML, HTML output
- plays nice with proxies (uses the X-Forwarded-* headers for IP resolution)
- allows for HTTP Method Override using the header `X-HTTP-Method-Override` or through query string parameter: `_method`
- create custom bins for experimenting log collection

## Installation

### Requirements

- [Redis](http://redis.io/)

```shell
brew install redis
brew services start redis
```

Redis should be now running on localhost:6379
Mockbin will start without redis but you wont be able to set or get response bins.

```shell
git clone https://github.com/Kong/mockbin.git ./mockbin
cd mockbin
cp .env.sample .env
brew install fnm
fnm use
npm install
```

Note: nvm, n or volta can be used instead of fnm.

### Running with Node

```shell
npm start
# OR watch for changes
npm run dev
# OR with debug logs
DEBUG=mockbin npm run dev
```

## Running with Docker Compose

```shell
docker compose up
```

## Documentation

Read the full API documentation, please review the [API Docs](https://github.com/Kong/mockbin/tree/master/docs).

## Bugs and feature requests

Have a bug or a feature request? Please first read the [issue guidelines](CONTRIBUTING.md#using-the-issue-tracker) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](/issues).

## Contributing

Please read through our [contributing guidelines](CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

More over, if your pull request contains JavaScript patches or features, you must include relevant unit tests.

Editor preferences are available in the [editor config](.editorconfig) for easy use in common text editors. Read more and download plugins at <http://editorconfig.org>.

## License

[MIT](LICENSE) &copy; [Kong](https://www.konghq.com)

[license-url]: https://github.com/Kong/mockbin/blob/master/LICENSE

[npm-license]: https://img.shields.io/npm/l/mockbin.svg?style=flat-square
[npm-version]: https://img.shields.io/npm/v/mockbin.svg?style=flat-square
[gitter-url]: https://gitter.im/Kong/mockbin
[gitter-image]: https://img.shields.io/badge/Gitter-Join%20Chat-blue.svg?style=flat-square

## TODO

- [x] update node
- [x] github action
- [x] autofix on save
- [x] upsert bin endpoint
- [x] simplify entrypoint and environment
- [x] replace unirest with fetch
- [ ] redis function binding
- [ ] callback tests
- [ ] bin tests
- [ ] support method as parameter
