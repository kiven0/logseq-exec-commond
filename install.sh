#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the plugin
echo "Building the plugin..."
npm run build

sh ./cmd-server/start.sh