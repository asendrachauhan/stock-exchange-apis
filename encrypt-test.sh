#!/bin/bash

# Write payload
echo '{
  "type": "seller",
  "qty": 20,
  "price": 100
}' > payload.json

# Encrypt with public key inside keys/
openssl pkeyutl -encrypt -pubin -inkey config/keys/public.pem -in payload.json -out payload.enc

# Base64 encode
base64 payload.enc > payload.b64

echo "Encrypted payload (base64):"
cat payload.b64
