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
-   [Deployment](#deployment)

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

# Deployment

## .env
The environment must be configured appropriately. The following configuration options must be updated in the `.env` file:
* HOST: The hostname for the application
* FRONTEND_URL: The frontend url
* ENVIRONMENT: The environment type, either `dev` or `prod`
* GOOGLE_OAUTH_CLIENT_ID: The google oauth client ID
    - You will need to create a project on [Google Cloud Console][1]
    - Create an OAuth client on the credentials page
* GOOGLE_OAUTH_CLIENT_SECRET: The google oauth client secret
    - The OAuth secret will be available after creating the OAuth client
* NEXTAUTH_URL: The url to the root page of the application
* NEXTAUTH_SECRET: A random string used for entropy in cryptography, easily generate using `openssl rand -base64 32`

## Secrets
Secret values in the `secrets/` folder should also be updated, especially passwords. The `api_gateway_cert.pem` and `api_gateway_key.pem` files should also be updated will a valid ssl certificate and key, a free one can be easily generated using [LetsEncrypt certbot][2].

## Running
Once configured the application can be started simply:
```sh
docker compose -f docker-compose.prod.yml --profile frontend --profile backend up
```

[1]: https://console.cloud.google.com/
[2]: https://letsencrypt.org/getting-started/