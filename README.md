# Mockbin [![version][npm-version]][npm-url] [![License][npm-license]][license-url]

[![Build Status][travis-image]][travis-url]
[![Downloads][npm-downloads]][npm-url]
[![Dependencies][david-image]][david-url]
[![Gitter][gitter-image]][gitter-url]

Mockbin is used internally and maintained by [Kong](https://github.com/Kong), who also maintain the open-source API Gateway [Kong](https://github.com/Kong/kong). 


## Table of contents

- [Features](#features)
- [Installation](#installation)
  - [Heroku](#heroku)
  - [Docker](#docker)
  - [Requirements](#requirements)
  - [Configuration](#configuration)
  - [Running](#running)
- [Usage](#usage)
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

install from source or through [npm](https://www.npmjs.com/):

```shell
npm install mockbin
```

### Heroku

[![Deploy][docker-image]][docker-url]

*read more on [Installation](docs/install.md)*.

### Docker

[![Docker][docker-logo]](docs/install.md#install-with-docker)

*read more on [Installation](docs/install.md#install-with-docker)*.

### Requirements

other than the dependencies listed in [package.json](package.json) The following are required:

- [Redis](http://redis.io/)

### Configuration

you will need to tell *mockbin* where Redis is:

```shell
npm config set mockbin:redis redis://127.0.0.1:6379
```

By Default the server will run on port `8080`, you can customize the port like so: 

```shell
npm config set mockbin:port 8001
```

*read more on [Configuration](docs/config.md)*.

### Running

After installing the `npm` package you can now start the server like so:

```shell
npm start
```

## Usage

```shell
  Usage: mockbin [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port <port>  Port that the HTTP server will run on
    -r, --redis [dsn]  Redis dsn
    -q, --quiet        Disable console logging

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

[travis-url]: https://travis-ci.org/Kong/mockbin
[travis-image]: https://img.shields.io/travis/Kong/mockbin.svg?style=flat-square

[npm-url]: https://www.npmjs.com/package/mockbin
[npm-license]: https://img.shields.io/npm/l/mockbin.svg?style=flat-square
[npm-version]: https://img.shields.io/npm/v/mockbin.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/mockbin.svg?style=flat-square

[codeclimate-url]: https://codeclimate.com/github/Kong/mockbin
[codeclimate-quality]: https://img.shields.io/codeclimate/github/Kong/mockbin.svg?style=flat-square
[codeclimate-coverage]: https://img.shields.io/codeclimate/coverage/github/Kong/mockbin.svg?style=flat-square

[david-url]: https://david-dm.org/Kong/mockbin
[david-image]: https://img.shields.io/david/Kong/mockbin.svg?style=flat-square

[docker-image]: https://www.herokucdn.com/deploy/button.svg
[docker-url]: https://heroku.com/deploy?template=https://github.com/Kong/mockbin
[docker-logo]: https://d3oypxn00j2a10.cloudfront.net/0.16.0/images/pages/brand_guidelines/small_h.png

[gitter-url]: https://gitter.im/Kong/mockbin
[gitter-image]: https://img.shields.io/badge/Gitter-Join%20Chat-blue.svg?style=flat-square
