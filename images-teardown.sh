#!/bin/bash

# Log in to DigitalOcean with doctl
doctl auth init

# Delete the latest tag and manifest for the repositories
delete_latest_manifest() {
    local repository_name=$1
    doctl registry repository delete-tag "$repository_name" latest -f
    latest_digest=$(doctl registry repository list-manifests "$repository_name" | awk 'NR==2{print $1}')
    doctl registry repository delete-manifest "$repository_name" "$latest_digest" -f
    echo "Deleted latest tag and manifest for repository $repository_name with digest $latest_digest"
}


delete_latest_manifest "frontend-web"
delete_latest_manifest "code-runner"
delete_latest_manifest "problem"
delete_latest_manifest "submission"
delete_latest_manifest "status"
delete_latest_manifest "status-queue"
delete_latest_manifest "proto-builder"
delete_latest_manifest "api-gateway"
delete_latest_manifest "prometheus"

# Initiating garbage collection on the registry
doctl registry garbage-collection start -f
