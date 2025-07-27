#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the plugin
echo "Building the plugin..."
npm run build

sh ./cmd-server/start.sh

echo "Installation complete!"
echo "You can load this plugin in Logseq:"
echo "1. Open Logseq"
echo "2. Click the three dots in the top-right corner -> Settings -> Developer mode (turn on)"
echo "3. Click the three dots in the top-right corner -> Plugins -> Load unpacked plugin"
echo "4. Select this folder"
echo ""
echo "Note: If you can't find the ExecCommand slash command, try restarting Logseq after loading the plugin."