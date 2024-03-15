#!/bin/bash

# Log in to DigitalOcean with doctl
doctl auth init

# Load environment variables from .env file
source .env

# Delete the latest tag and manifest for the repository "frontend-web"
doctl registry repository delete-tag frontend-web latest -f
doctl registry repository delete-tag code-runner latest -f
doctl registry repository delete-tag problem latest -f

latest_digest=$(doctl registry repository list-manifests frontend-web | awk 'NR==2{print $1}')
doctl registry repository delete-manifest frontend-web "$latest_digest" -f

latest_digest=$(doctl registry repository list-manifests code-runner | awk 'NR==2{print $1}')
doctl registry repository delete-manifest frontend-web "$latest_digest" -f

doctl registry repository delete-tag problem latest -f

# Initiating garbage collection on the registry
doctl registry garbage-collection start 

# Build Docker image with specified arguments
docker build \
  --build-arg ENVIRONMENT="$ENVIRONMENT" \
  --build-arg NEXT_PUBLIC_FRONTEND_URL="$NEXT_PUBLIC_FRONTEND_URL" \
  -t codelab/frontend-web \
  -f ./app/Dockerfile \
  ./

# Tag the image for DigitalOcean Container Registry
docker tag codelab/frontend-web registry.digitalocean.com/codelab/frontend-web
docker push registry.digitalocean.com/codelab/frontend-web

# Delete the local frontend-web image
docker rmi codelab/frontend-web

echo "done frontendweb"

# Build Docker image for code-runner
docker build \
  -t codelab/code-runner \
  -f ./services/code-runner/Dockerfile \
  ./

# Tag the image for DigitalOcean Container Registry
docker tag codelab/code-runner registry.digitalocean.com/codelab/code-runner
docker push registry.digitalocean.com/codelab/code-runner

# Delete the local code-runner image
docker rmi codelab/code-runner

echo "done code-runner"

# Build the Docker image for the problem service
docker build \
  -t codelab/problem \
  -f ./services/problem/Dockerfile \
  ./

# Tag the image for DigitalOcean Container Registry
docker tag codelab/problem registry.digitalocean.com/codelab/problem
docker push registry.digitalocean.com/codelab/problem

# Delete the local problem image
docker rmi codelab/problem

echo "done problem"
