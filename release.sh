#!/bin/bash

# Check if version number is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <version_number>"
    echo "Example: $0 1.1.5"
    exit 1
fi

VERSION=$1
MANIFEST_FILE="manifest.json"

# Check if manifest.json exists
if [ ! -f "$MANIFEST_FILE" ]; then
    echo "Error: $MANIFEST_FILE not found in current directory"
    exit 1
fi

# Update version in manifest.json
# This uses sed to replace the version line while preserving formatting
sed -i "s/\"version\": \"[0-9.]*\"/\"version\": \"$VERSION\"/" $MANIFEST_FILE

echo "Updated $MANIFEST_FILE to version $VERSION"

# Create git tag and push to origin
git add $MANIFEST_FILE
git commit -m "Bump version to $VERSION"
git tag -a $VERSION -m "Release version $VERSION"
git push origin $VERSION
git push origin main

echo "Version $VERSION tagged and pushed successfully"
