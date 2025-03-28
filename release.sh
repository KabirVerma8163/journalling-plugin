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

# macOS specific sed command
sed -i '' "s/\"version\": \"[0-9.]*\"/\"version\": \"$VERSION\"/" $MANIFEST_FILE

# Verify the file was changed
if grep -q "\"version\": \"$VERSION\"" $MANIFEST_FILE; then
    echo "Successfully updated $MANIFEST_FILE to version $VERSION"
else
    echo "Error: Failed to update version in $MANIFEST_FILE"
    exit 1
fi

# Stage the changes to manifest.json
git add $MANIFEST_FILE

# Commit the changes with an "Updated manifest" message
git commit -m "Updated manifest to version $VERSION"

# Create git tag and push to origin
git tag -a $VERSION -m "Release version $VERSION"
git push origin $VERSION
git push origin main

echo "Version $VERSION tagged and pushed successfully"
