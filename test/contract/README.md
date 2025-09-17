# Contract Tests

A set of contract tests to ensure the expected behaviour of the API is maintained when using
outdated versions of Insomnia.

Useful when refactoring the codebase, or when adding new capabilities to existing endpoints.

Ideally, these tests should not change (except to migrate to a more ideal testing framework).

## Running

(from repo root)

```sh
npm test:contract:docker
```
