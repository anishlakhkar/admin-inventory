@echo off
REM Generate RSA key pair for JWT signing
echo Generating JWT RSA key pair...

REM Check if OpenSSL is available
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo OpenSSL is not installed or not in PATH.
    echo Please install OpenSSL or use Git Bash/WSL to run generate-jwt-keys.sh
    pause
    exit /b 1
)

REM Generate private key
openssl genrsa -out src\main\resources\privateKey.pem 2048

REM Generate public key
openssl rsa -in src\main\resources\privateKey.pem -pubout -out src\main\resources\publicKey.pem

echo JWT keys generated successfully!
echo Private key: src\main\resources\privateKey.pem
echo Public key: src\main\resources\publicKey.pem
pause
