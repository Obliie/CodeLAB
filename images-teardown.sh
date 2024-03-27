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

delete_untagged_manifests() {
    local repository_name=$1
    local total_manifests=$(doctl registry repository list-manifests "$repository_name" | wc -l)

    for ((i = 2; i <= total_manifests; i++)); do
        manifest_info=$(doctl registry repository list-manifests "$repository_name" | awk -v line="$i" 'NR==line')
        untagged_digest=$(echo "$manifest_info" | awk '{print $1}')
        tag=$(echo "$manifest_info" | awk '{print $10}')
        
        if [ "$tag" = "[]" ]; then
            doctl registry repository delete-manifest "$repository_name" "$untagged_digest" -f
            echo "Deleted manifest with digest $untagged_digest for service $tag"
        fi
    done

    echo "Deleted untagged manifests for repository $repository_name"
}


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

# Function to build, tag, push, and clean up Docker image
build_tag_push() {
    local service_name=$1
    local dockerfile_path=$2

    # Build Docker image
    docker build \
      -t "$service_name" \
      -f "$dockerfile_path" \
      ./

    # Tag the image for DigitalOcean Container Registry
    docker tag "$service_name" "registry.digitalocean.com/codelab/codelab:$service_name"
    docker push "registry.digitalocean.com/codelab/codelab:$service_name"

    # Delete the local image
    docker rmi "$service_name"
    echo "done $service_name"
}

# Call the functions to install doctl and delete latest manifest
install_doctl
source .env

# Log in to DigitalOcean with doctl
doctl auth init --access-token $DIGITAL_REGISTRY_ACCESS_TOKEN

# Call the build_tag_push function for each service
build_tag_push "code-runner" "./services/code-runner/Dockerfile"
build_tag_push "problem" "./services/problem/Dockerfile"
build_tag_push "submission" "./services/submission/Dockerfile"
build_tag_push "status" "./services/status/Dockerfile"
build_tag_push "status-queue" "./containers/status-queue/Dockerfile"
build_tag_push "proto-builder" "./containers/proto-builder/Dockerfile"
build_tag_push "api-gateway" "./containers/api-gateway/Dockerfile"
build_tag_push "prometheus" "./containers/prometheus/Dockerfile"
build_tag_push "frontend-web" "./app/Dockerfile"

# Initiating garbage collection on the registry
delete_untagged_manifests "codelab"
