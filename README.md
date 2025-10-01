# Insomnia Mockbin ![version][npm-version] [![License][npm-license]][license-url]

**Note:** This repository is source visibile, but not open-source. Please check the [LICENSE](LICENSE) before using this software.

Insomnia Mockbin is maintained by [Kong](https://github.com/Kong), who also maintains the open-source API Gateway [Kong](https://github.com/Kong/kong) and [Insomnia](https://github.com/Kong/insomnia).

## Table of contents

- [Insomnia Mockbin  ](#insomnia-mockbin--)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
    - [Requirements](#requirements)
    - [Running with Node](#running-with-node)
  - [Running with Docker Compose](#running-with-docker-compose)
  - [Documentation](#documentation)
    - [API Docs](#api-docs)
  - [Releasing](#releasing)
    - [Software Bill of materials](#software-bill-of-materials)
    - [Verify a container image signature](#verify-a-container-image-signature)
    - [Verify a container image provenance](#verify-a-container-image-provenance)
  - [Bugs and feature requests](#bugs-and-feature-requests)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- uses HAR format
- supports JSON, YAML, XML, HTML output
- plays nice with proxies (uses the X-Forwarded-* headers for IP resolution)
- allows for HTTP Method Override using the header `X-HTTP-Method-Override` or through query string parameter: `_method`
- create custom bins for experimenting log collection

## Local Development

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

### Running with Docker Compose

```shell
docker compose up
```

### Releasing

Run the following command and push the newly created commit into your PR.
This will bump commit and tag, you will need to push this to the remote, which trigger the release action upon merging the PR.

Please note that separate branches are currently maintained for cloud mocks and self hosted mocks. Merging to the default branch or creating a tag on a commit on the default branch will result in the cloud mock server image being published. Merging to the `self-hosted` branch of creating a tag on a commit on the `self-hosted` branch (please use the format v.x.x.x-self-hosted in this case) will result in the self-hosted mock server image being published.

```sh
npm version patch
git push origin tag <tag_name>
```

## Documentation

### API Docs

Read the full API documentation, please review the [API Docs](https://github.com/Kong/mockbin/tree/master/docs).

### Deployment

See [https://developer.konghq.com/insomnia/mock-servers/](https://developer.konghq.com/insomnia/mock-servers/) for the available options for deploying mockbin.

### Software Bill of materials

Kong Insomnia Mockbin produces SBOMs for the below categories:

- For docker container images
- For source code repository

The SBOMs are available to download at:

- Github Release / Tag Assets
- Github workflow assets for other workflow runs

### Verify a container image signature

Docker container images are now signed using cosign with signatures published to a [Github Container registry](https://ghcr.io) with `insomnia-mockbin` repository. Separate images are published for cloud hosted mocks ([ghcr.io/kong/insomnia-mockbin-cloud](https://developer.konghq.com/how-to/create-a-cloud-hosted-mock-server/)) and self-hosted mocks ([ghcr.io/kong/insomnia-mockbin-self-hosted](https://developer.konghq.com/insomnia/self-hosted-mocks/)). Modify the examples below if you need to verify the image for self-hosted mocks.

Steps to verify signatures for signed Kong Insomnia Mockbin Docker container images in two different ways:

A minimal example, used to verify an image without leveraging any annotations. For the minimal example, you only need Docker details, a GitHub repo name, and a GitHub workflow filename.

```code
cosign verify \
  ghcr.io/kong/insomnia-mockbin-cloud:<tag>@sha256:<digest> \
  --certificate-oidc-issuer='https://token.actions.githubusercontent.com' \
  --certificate-identity-regexp='https://github.com/Kong/insomnia-mockbin/.github/workflows/release.yaml'
```

A complete example, leveraging optional annotations for increased trust. For the complete example, you need the same details as the minimal example, as well as any of the optional annotations you wish to verify:

```code
cosign verify \
  ghcr.io/kong/insomnia-mockbin-cloud:<tag>@sha256:<digest> \
  --certificate-oidc-issuer='https://token.actions.githubusercontent.com' \
  --certificate-identity-regexp='https://github.com/Kong/insomnia-mockbin/.github/workflows/release.yaml' \
  -a repo='Kong/insomnia-mockbin' \
  -a workflow='Package & Release'
```

### Verify a container image provenance

Kong Insomnia Mockbin produces build provenance for docker container images for `Github tags`, which can be verified using cosign / slsa-verifier with attestations published to a [Github Container registry](https://ghcr.io) with `insomnia-mockbin` repository.

Steps to verify provenance for signed Kong Insomnia Mockbin Docker container images:

1. Fetch the image `<manifest_digest>` using regctl:

    ```code
    regctl image digest ghcr.io/kong/insomnia-mockbin-cloud:<tag>
    ```

2. A minimal example, used to verify an image without leveraging any annotations. For the minimal example, you only need Docker Image manifest, a GitHub repo name.

    ```code
    cosign verify-attestation \
      ghcr.io/kong/insomnia-mockbin-cloud:<tag>@sha256:<manifest_digest> \
      --type='slsaprovenance' \
      --certificate-oidc-issuer='https://token.actions.githubusercontent.com' \
      --certificate-identity-regexp='^https://github.com/slsa-framework/slsa-github-generator/.github/workflows/generator_container_slsa3.yml@refs/tags/v[0-9]+.[0-9]+.[0-9]+$'
    ```

    ```code
    slsa-verifier verify-image \
      ghcr.io/kong/insomnia-mockbin-cloud:<tag>@sha256:<manifest_digest> \
      --print-provenance \
      --source-uri 'github.com/Kong/insomnia-mockbin'
    ```

3. A complete example, leveraging optional annotations for increased trust. For the complete example, you need the same details as the minimal example, as well as any of the optional annotations you wish to verify:

    ```code
    cosign verify-attestation \
      ghcr.io/kong/insomnia-mockbin-cloud:<tag>@sha256:<manifest_digest> \
      --type='slsaprovenance' \
      --certificate-oidc-issuer='https://token.actions.githubusercontent.com' \
      --certificate-identity-regexp='^https://github.com/slsa-framework/slsa-github-generator/.github/workflows/generator_container_slsa3.yml@refs/tags/v[0-9]+.[0-9]+.[0-9]+$' \
      --certificate-github-workflow-repository='Kong/insomnia-mockbin' \
      --certificate-github-workflow-name='Package & Release'
    ```

    ```code
    slsa-verifier verify-image \
      ghcr.io/kong/insomnia-mockbin-cloud:<tag>@sha256:<manifest_digest> \
      --print-provenance \
      --source-uri 'github.com/Kong/insomnia-mockbin' \
      --source-tag '<tag>'
    ```

## Bugs and feature requests

Have a bug or a feature request? Please first read the [issue guidelines](CONTRIBUTING.md#using-the-issue-tracker) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](/issues).

## Contributing

Please read through our [contributing guidelines](CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

More over, if your pull request contains JavaScript patches or features, you must include relevant unit tests.

Editor preferences are available in the [editor config](.editorconfig) for easy use in common text editors. Read more and download plugins at <http://editorconfig.org>.

## License

[Enterprise](LICENSE) &copy; [Kong](https://www.konghq.com)

[license-url]: https://github.com/Kong/mockbin/blob/master/LICENSE

[npm-license]: https://img.shields.io/npm/l/mockbin.svg?style=flat-square
[npm-version]: https://img.shields.io/npm/v/mockbin.svg?style=flat-square
