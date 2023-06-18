#!/usr/bin/env bash
# Usage: ./init.sh
# This script handles initial setup that can't be handled via the dockerfile
#   (e.g. because it relies on repository files being available).
set -e

# Install required gems, packages, etc
bundle
npm install

# jekyll-webpack is broken with Ruby >=3.2 (as of 2023-06-17) because it uses
#   `File.exists` and `Dir.exists`. These methods were deprecated in Ruby 2.1.0
#   and removed in Ruby 3.2.0.
# This can be fixed by patching the gem's sources to use `File.exist?` instead.
JEKYLL_WEBPACK_INSTALL_DIR=$(bundle info jekyll-webpack | grep -oP "(?<=Path: ).*")
readonly JEKYLL_WEBPACK_INSTALL_DIR
if [[ -z "$JEKYLL_WEBPACK_INSTALL_DIR" ]]; then
	echo "Failed to find jekyll-webpack install directory"
	exit 1
else
	echo "Found jekyll-webpack install directory: $JEKYLL_WEBPACK_INSTALL_DIR"
fi

# Patch all ruby scripts in the jekyll-webpack gem to use the non-deprecated
#   methods
echo "Patching jekyll-webpack to use File.exist? instead of File.exists..."
find "$JEKYLL_WEBPACK_INSTALL_DIR" -type f -name "*.rb" \
	-exec sed -i 's/File.exists?/File.exist?/g' {} \;

echo "Patching jekyll-webpack to use Dir.exist? instead of Dir.exists..."
find "$JEKYLL_WEBPACK_INSTALL_DIR" -type f -name "*.rb" \
	-exec sed -i 's/Dir.exists?/Dir.exist?/g' {} \;
echo "Successfully patched jekyll-webpack."
