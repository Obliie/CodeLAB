#!/bin/bash

# Function to check and install doctl if not already installed
install_doctl() {
    if ! command -v doctl &> /dev/null
    then
        echo "doctl is not installed. Proceeding with installation..."
        cd ~
        wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
        tar xf ~/doctl-1.104.0-linux-amd64.tar.gz
        sudo mv ~/doctl /usr/local/bin
        echo "doctl has been installed."
    else
        echo "doctl is already installed."
    fi
}

# Call the function to install doctl
install_doctl

# Source .env
source .env

# Log in to DigitalOcean with doctl
doctl auth init --access-token $DIGITAL_REGISTRY_ACCESS_TOKEN

# Delete the latest tag and manifest for the repositories
delete_latest_manifest() {
    local repository_name=$1
    local total_manifests=$(doctl registry repository list-manifests "$repository_name" | wc -l)

    for ((i = 2; i <= total_manifests; i++)); do
        latest_digest=$(doctl registry repository list-manifests "$repository_name" | awk 'NR==2{print $1}')
        echo $latest_digest
        tag=$(doctl registry repository list-manifests "$repository_name" | awk 'NR==2{print $10}')
        doctl registry repository delete-manifest "$repository_name" "$latest_digest" -f
        echo "Deleted manifest with digest $latest_digest for service $tag"
    done

    echo "Deleted latest tags and manifests for repository $repository_name"
}

delete_latest_manifest "codelab"

# Initiating garbage collection on the registry
doctl registry garbage-collection start -f

# Function to check garbage collection status
check_gc_status() {
    local status
    while true; do
        status=$(doctl registry garbage-collection list | awk 'NR==2{print $3}')
        if [ "$status" == "succeeded" ]; then
            echo "Garbage collection succeeded."
            break
        else
            echo "Garbage collection is still in progress..."
            sleep 10  # Wait for 10 seconds before checking again
        fi
    done
}

check_gc_status

# Function to build, tag, push, and clean up Docker image
build_tag_push() {
    local service_name=$1
    local dockerfile_path=$2

    # Build Docker image
    docker build \
      --tag "$service_name" \
      --file "$dockerfile_path" \
      --build-arg ENVIRONMENT=prod \
      ./

    # Tag the image for DigitalOcean Container Registry
    docker tag "$service_name" "registry.digitalocean.com/codelab/codelab:$service_name"
    docker push "registry.digitalocean.com/codelab/codelab:$service_name"

    # Delete the local image
    docker rmi "$service_name"

    echo "done $service_name"
}

# Call the build_tag_push function for each service
build_tag_push "code-runner" "./src/code-runner/Dockerfile"
build_tag_push "problem" "./src/problem/Dockerfile"
build_tag_push "submission" "./src/submission/Dockerfile"
build_tag_push "status" "./src/status/Dockerfile"
build_tag_push "proto-builder" "./containers/proto-builder/Dockerfile"
build_tag_push "frontend" "./src/frontend/Dockerfile"
