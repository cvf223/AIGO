#!/bin/bash

# Script to check Telegram client functionality
echo "===== Checking Telegram Client Configuration ====="

# Check if the Telegram token is set
if grep -q "TELEGRAM_BOT_TOKEN=" .env; then
  TOKEN=$(grep "TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
  echo "✅ Telegram bot token found: ${TOKEN:0:10}..."
else
  echo "❌ ERROR: TELEGRAM_BOT_TOKEN not found in .env file"
  exit 1
fi

# Verify the packages directory exists
if [ -d "./packages/client-telegram" ]; then
  echo "✅ Telegram client package directory found"
else
  echo "❌ ERROR: packages/client-telegram directory not found"
  exit 1
fi

# Check if the Telegram client is built
if [ -d "./packages/client-telegram/dist" ]; then
  echo "✅ Telegram client is built"
else
  echo "⚠️ WARNING: Telegram client is not built, building now..."
  cd packages/client-telegram
  pnpm build
  cd ../..
  
  if [ -d "./packages/client-telegram/dist" ]; then
    echo "✅ Telegram client built successfully"
  else
    echo "❌ ERROR: Failed to build Telegram client"
    exit 1
  fi
fi

# Check if all character files use the real Telegram client
TELEGRAM_IMPORT="import telegram from \"../../packages/client-telegram/dist/index.js\";"
TELEGRAM_MOCK_IMPORT="import telegram from \"./telegramMock.ts\";"

echo "Checking character files for Telegram client imports..."
for file in agent/src/*Character.ts; do
  if grep -q "$TELEGRAM_IMPORT" "$file"; then
    echo "✅ $file uses real Telegram client"
  elif grep -q "$TELEGRAM_MOCK_IMPORT" "$file"; then
    echo "❌ $file uses mock Telegram client"
    echo "   Fixing import in $file..."
    sed -i '' "s|$TELEGRAM_MOCK_IMPORT|$TELEGRAM_IMPORT|g" "$file"
    
    if grep -q "$TELEGRAM_IMPORT" "$file"; then
      echo "   ✅ Fixed $file"
    else
      echo "   ❌ Failed to fix $file"
    fi
  else
    echo "⚠️ WARNING: $file does not import Telegram client"
  fi
done

echo "===== Telegram Client Check Complete ====="
echo "You can now run the full build script with: sudo ./scripts/build-and-run.sh" 