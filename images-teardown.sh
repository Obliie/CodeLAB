#!/bin/bash

# Log in to DigitalOcean with doctl
doctl auth init

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
