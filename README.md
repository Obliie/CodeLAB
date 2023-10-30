<br />
<p align="center">
  <h3 align="center">CodeLAB</h3>

  <p align="center">
    A web application for evaluating solutions to code problems in various languages.
    <br />
    <br />
    <a href="https://github.com/Obliie/CodeLAB/issues">Issues</a>
    ·
    <a href="https://github.com/Obliie/CodeLAB/pulls">Pull Requests</a>
  </p>
</p>

# Contents

-   [Development](#development)
    -   [Prerequisites](#prerequisites)
    -   [Setup](#setup)
        -   [Frontend](#frontend)
        -   [Backend](#backend)
            -   [Mockserver](#Mockserver)
    -   [Testing](#testing)
    -   [Build](#build)

# Development

## Prerequisites

-   npm
-   docker
-   python
-   pip

## Setup

1. Install pre-commit

```sh
pip install pre-commit
```

2. Install pre-commit hooks

```sh
pre-commit install
```

### Frontend

1. Move into the frontend development directory

```sh
cd app
```

2. Install NPM packages

```sh
npm install
```

3. Start the Expo Metro bundler

```sh
npm run web
```

### Backend

1. Copy the env.example file and adjust values appropriately

```sh
cp .env.example .env
```

2. Start the backend microservice containers

```sh
docker compose --profile backend up
```

## Testing

Run service integration tests:

```sh
docker compose --profile test up
```

## Build

Rebuild protobuf files:

```sh
docker compose --profile build up
```
