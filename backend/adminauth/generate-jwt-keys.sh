#!/bin/bash

# Generate RSA key pair for JWT signing
echo "Generating JWT RSA key pair..."

# Generate private key
openssl genrsa -out src/main/resources/privateKey.pem 2048

# Generate public key
openssl rsa -in src/main/resources/privateKey.pem -pubout -out src/main/resources/publicKey.pem

echo "JWT keys generated successfully!"
echo "Private key: src/main/resources/privateKey.pem"
echo "Public key: src/main/resources/publicKey.pem"
