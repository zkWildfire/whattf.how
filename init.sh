#!/usr/bin/env bash
# Usage: ./init.sh
# This script handles initial setup that can't be handled via the dockerfile
#   (e.g. because it relies on repository files being available).
set -e

# Install required gems, packages, etc
bundle
npm install
