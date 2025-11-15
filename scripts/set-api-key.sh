#!/bin/bash

# Secure script to set Claude API key for Naama-AI backend
# This key is separate from your Claude Code subscription

echo "================================================"
echo "  Naama-AI Claude API Key Setup"
echo "================================================"
echo ""
echo "This will set the Claude API key for Naama-AI backend only."
echo "It will NOT interfere with your Claude Code subscription."
echo ""

# Prompt for API key (hidden input)
read -sp "Enter your Claude API key (sk-ant-...): " API_KEY
echo ""

# Validate key format
if [[ ! $API_KEY =~ ^sk-ant- ]]; then
    echo "❌ Error: API key should start with 'sk-ant-'"
    exit 1
fi

# Update .env file
ENV_FILE="backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: backend/.env file not found"
    exit 1
fi

# Use sed to replace the API key line
sed -i "s/^NAAMA_CLAUDE_API_KEY=.*/NAAMA_CLAUDE_API_KEY=$API_KEY/" "$ENV_FILE"

echo "✅ API key successfully set in backend/.env"
echo ""
echo "The backend server will use this key for AI generation."
echo "Your Claude Code subscription is NOT affected."
echo ""
echo "================================================"
