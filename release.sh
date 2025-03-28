#!/bin/bash

# Check if both version number and commit message are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <version_number> <commit_message>"
    echo "Example: $0 1.1.5 \"Add new journaling features\""
    exit 1
fi

VERSION=$1
COMMIT_MESSAGE=$2
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

# Commit the changes with the user-provided commit message
git add -A
git commit -m "$COMMIT_MESSAGE"

# Stage the changes to manifest.json
git add $MANIFEST_FILE
git commit -m "update version in $MANIFEST_FILE to $VERSION"

# Create git tag after the commit
git tag -a $VERSION -m "Release version $VERSION"

# Push both the commit and the tag
git push origin main
git push origin $VERSION

echo "Version $VERSION tagged and pushed successfully with commit message: \"$COMMIT_MESSAGE\""
