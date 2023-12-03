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

-   [Architechture](#architechture)
-   [Development](#development)
    -   [Prerequisites](#prerequisites)
    -   [Setup](#setup)
    -   [Running](#running)
    -   [Testing](#testing)
        - [Test Filtering](#test-filtering)
    -   [Build](#build)

# Architechture

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

## Running

1. Copy the env.example file and adjust values appropriately

```sh
cp .env.example .env
```

2. Start the backend microservice containers and frontend

```sh
docker compose --profile backend --profile frontend up
```

## Testing

Run service integration tests:

```sh
docker compose --profile integration up
```

Run service unit tests:

```sh
docker compose --profile test up
```

### Test filtering

Optionally provide the environment variable `TEST_FILTER` to the run command to filter by test name.

## Build

Rebuild protobuf files:

```sh
docker compose --profile build up
```
