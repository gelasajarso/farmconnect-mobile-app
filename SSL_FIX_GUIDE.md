# SSL Certificate Error Fix Guide

## Problem
You're encountering an SSL certificate verification error when Expo tries to fetch data from `https://api.expo.dev`. This is common on Windows systems with corporate proxies or network configurations.

## Solutions Applied

### 1. Created `.npmrc` file
Added configuration to disable strict SSL checking for npm operations.

### 2. Environment Variable Solution (Recommended for Development Only)

#### Option A: Set for Current Session (PowerShell)
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npm start
```

#### Option B: Set for Current Session (CMD)
```cmd
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm start
```

#### Option C: Add to package.json scripts (Cross-platform)
Update your `package.json` scripts to include the environment variable:

```json
"scripts": {
  "start": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 expo start",
  "android": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 expo start --android",
  "ios": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 expo start --ios",
  "web": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 expo start --web"
}
```

Then install `cross-env`:
```bash
npm install --save-dev cross-env
```

### 3. Alternative: Use System CA Certificates

If you have the root CA installed locally, you can run Node.js with the `--use-system-ca` flag:

```powershell
node --use-system-ca node_modules/.bin/expo start
```

### 4. Network-Level Solutions

#### Check Corporate Proxy
If you're behind a corporate proxy, you may need to configure npm to use it:

```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

#### Install Corporate Root Certificate
1. Get the root CA certificate from your IT department
2. Install it in Windows Certificate Store (Trusted Root Certification Authorities)
3. Restart your terminal/IDE

## Quick Start Commands

### For immediate fix (PowerShell):
```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npm start
```

### For immediate fix (CMD):
```cmd
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm start
```

## Security Warning

⚠️ **Important**: Disabling SSL verification (`NODE_TLS_REJECT_UNAUTHORIZED=0`) should only be used in development environments. Never use this in production as it makes your application vulnerable to man-in-the-middle attacks.

## Permanent Solution

For a permanent solution without disabling SSL:
1. Contact your network administrator to get the proper root CA certificate
2. Install the certificate in your system's trusted certificate store
3. Remove the `.npmrc` file and environment variable overrides

## Testing

After applying the fix, try running:
```bash
npm start
```

The Expo development server should start without SSL errors.
