#!/bin/sh

# Enable zrok with the token from environment variable
if [ -z "$ZROK_ENABLE_TOKEN" ] || [ -z "$ZROK_SHARE_TOKEN" ]; then
  echo "Error: ZROK_ENABLE_TOKEN or ZROK_SHARE_TOKEN is not set."
  echo "Make sure they are set in GitHub Secrets and passed to Cloud Run."
  exit 1
fi

echo "Authenticating zrok..."
zrok enable "$ZROK_ENABLE_TOKEN"

echo "Starting zrok access tunnel..."
# Run zrok access in the background and bind it to localhost:5432
zrok access private "$ZROK_SHARE_TOKEN" --bind 127.0.0.1:5432 --headless &

# Wait for a few seconds to let the tunnel establish
sleep 5

echo "Starting the backend server..."
exec npm start
