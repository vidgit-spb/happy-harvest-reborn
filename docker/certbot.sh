#!/bin/bash
set -e

# Usage: ./certbot.sh your-domain.com your-email@example.com

DOMAIN="$1"
EMAIL="$2"
DATA_PATH="./certbot"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: $0 <domain> <email>"
  exit 1
fi

# Create required directories
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
mkdir -p "$DATA_PATH/www"

# Request Let's Encrypt certificate using certonly method
echo "Requesting Let's Encrypt certificate for $DOMAIN..."

docker run --rm \
  -v "$PWD/$DATA_PATH/conf:/etc/letsencrypt" \
  -v "$PWD/$DATA_PATH/www:/var/www/certbot" \
  certbot/certbot:latest \
  certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --register-unsafely-without-email --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "Certificate successfully obtained!"
echo "Your certificates are stored in $DATA_PATH/conf/live/$DOMAIN/"

# Make the script executable
chmod +x "$0"

echo "Don't forget to replace \${DOMAIN} in the docker-compose.yml with: $DOMAIN"
echo "To renew certificates manually (normally handled automatically by the certbot container):"
echo "./certbot.sh $DOMAIN $EMAIL"
