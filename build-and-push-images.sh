#!/bin/bash

# Log in to DigitalOcean with doctl
doctl auth init

# Load environment variables from .env file
source .env

# Function to build, tag, push, and clean up Docker image
build_tag_push() {
    local service_name=$1
    local dockerfile_path=$2

    # Build Docker image
    docker build \
      -t "codelab/$service_name" \
      -f "$dockerfile_path" \
      ./

    # Tag the image for DigitalOcean Container Registry
    docker tag "codelab/$service_name" "registry.digitalocean.com/codelab/$service_name"
    docker push "registry.digitalocean.com/codelab/$service_name"

    # Delete the local image
    docker rmi "codelab/$service_name"

    echo "done $service_name"
}

build_tag_push "frontend-web" "./app/Dockerfile"
build_tag_push "code-runner" "./services/code-runner/Dockerfile"
build_tag_push "problem" "./services/problem/Dockerfile"
build_tag_push "submission" "./services/submission/Dockerfile"
build_tag_push "status" "./services/status/Dockerfile"
build_tag_push "status-queue" "./services/status-queue/Dockerfile"
build_tag_push "proto-builder" "./containers/proto-builder/Dockerfile"
build_tag_push "api-gateway" "./containers/api-gateway/Dockerfile"
build_tag_push "prometheus" "./containers/prometheus/Dockerfile"
