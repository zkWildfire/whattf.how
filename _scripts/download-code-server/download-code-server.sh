#!/usr/bin/bash
# Usage: ./download-code-server.sh
set -e

# The download link for the code-server CLI uses "alpine" but is usable
#   on Ubuntu
readonly OS=alpine
readonly CPU=x64
readonly BUILD_CHANNEL=stable
readonly BASE_URL="https://code.visualstudio.com/sha/download"
readonly DOWNLOAD_URL="${BASE_URL}?build=${BUILD_CHANNEL}&os=cli-${OS}-${CPU}"

# Acquire and set up the code-server binary
ARCHIVE_FILE="code-server.tar.gz"
echo "Downloading code-server from ${DOWNLOAD_URL}..."
wget -O "${ARCHIVE_FILE}" "${DOWNLOAD_URL}"
echo "Successfully downloaded the code-server archive."

echo "Extracting the code-server binary..."
tar -xvf "${ARCHIVE_FILE}"
echo "Successfully extracted the code-server binary."

echo "Cleaning up..."
rm "${ARCHIVE_FILE}"
echo "All done! Run ./code tunnel to establish a tunnel."
