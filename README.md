# DID Web Server

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![DID Web](https://img.shields.io/badge/DID-Web%20Method-orange.svg)](https://w3c-ccg.github.io/did-method-web/)
[![W3C](https://img.shields.io/badge/W3C-DID%20Core-red.svg)](https://w3c.github.io/did-core/)

🇺🇸 English | [🇨🇳 中文](./README.zh-CN.md)

## Project Introduction

This is a modern DID Web server built with Express.js, providing complete decentralized identifier (DID) services using the official `@digitalbazaar/did-method-web` library.

### Core Features

- 🔐 **Official Library Support**: Uses `@digitalbazaar/did-method-web` to ensure compliance with the latest specifications
- 🔑 **Modern Key Types**: Supports Ed25519VerificationKey2020 and X25519KeyAgreementKey2020
- 🌐 **Dynamic Domain**: Supports deployment on any domain without modifying DID documents
- ⚡ **Auto Generation**: Provides DID document auto-generation API
- 📋 **Complete Permissions**: Supports authentication, assertionMethod, capabilityDelegation, and more
- 🔒 **Duplicate Detection**: Automatically detects and prevents DID identifier conflicts

## Server Configuration

- **Default Port**: 8522
- **Framework**: Express.js 4.18+
- **DID Library**: @digitalbazaar/did-method-web
- **Key Types**: Ed25519VerificationKey2020, X25519KeyAgreementKey2020
- **Protocol**: HTTP/HTTPS
- **Node.js**: 18+ support

## Features

### 1. DID Document Resolution Service

Supports standard DID Web format resolution, complying with W3C DID Web specifications. All DID documents are generated using the official `@digitalbazaar/did-method-web` library to ensure compliance with the latest W3C standards.

### 2. Automatic DID Document Generation

Supports automatic generation of specification-compliant DID documents, including:

- **Ed25519VerificationKey2020**: For digital signatures and identity verification
- **X25519KeyAgreementKey2020**: For key agreement and encrypted communication
- **Complete Permission System**: authentication, assertionMethod, capabilityDelegation, capabilityInvocation
- **Duplicate Detection**: Automatically detects and prevents DID identifier duplication

### 3. Route Support

#### Core DID Routes

- **GET** `/.well-known/did.json`
  - Function: Get root domain DID document
  - Access example: `http://localhost:8522/.well-known/did.json`
  - Corresponding DID: `did:web:localhost:8522`
  - Returns: DID document in JSON format

- **GET** `/{path}/did.json`
  - Function: Get path-specific DID document (W3C DID Web compliant)
  - Access example: `http://localhost:8522/alice/did.json`
  - Corresponding DID: `did:web:localhost:8522:alice`
  - Returns: DID document for the corresponding path

- **GET** `/{path1}/{path2}/did.json`
  - Function: Get multi-level path DID document
  - Access example: `http://localhost:8522/user/alice/did.json`
  - Corresponding DID: `did:web:localhost:8522:user:alice`
  - Returns: DID document for the corresponding multi-level path

#### DID Generation API

- **POST** `/api/did/generate`
  - Function: Generate new user DID document using @digitalbazaar/did-method-web
  - Format: `did:web:{domain}:user:{16-character random string}`
  - Example: `curl -X POST http://localhost:8522/api/did/generate`
  - Returns: Complete DID document and key information

- **POST** `/api/did/generate-root`
  - Function: Generate/update root domain DID document
  - Format: `did:web:{domain}`
  - Example: `curl -X POST http://localhost:8522/api/did/generate-root`
  - Returns: Complete root domain DID document

#### Utility APIs

- **GET** `/api/info`
  - Function: Get API version and service information
  - Access example: `http://localhost:8522/api/info`
  - Returns: API version, supported feature list, key types, etc.

#### Health Check

- **GET** `/health`
  - Function: Server health status check
  - Access example: `http://localhost:8522/health`
  - Returns: Server status information

## Project Structure

```
did-web-server/
├── main.js                      # Server entry file
├── package.json                # Project configuration and dependencies
├── package-lock.json           # Dependency version lock
├── README.md                  # Project documentation (English)
├── README.zh-CN.md            # Project documentation (Chinese)
├── .env.example               # Environment variable example
└── data/
    └── did-documents/        # DID document storage directory
        ├── root.json           # Root domain DID document
        └── user:*.json         # User DID documents (auto-generated)
```

## Dependencies

### Core Dependencies

- **@digitalbazaar/did-method-web**: Official W3C DID Web method implementation
- **@digitalbazaar/ed25519-verification-key-2020**: Ed25519 verification keys
- **@digitalbazaar/x25519-key-agreement-key-2020**: X25519 key agreement keys
- **express**: Web application framework
- **cors**: Cross-origin resource sharing support
- **dotenv**: Environment variable management

## DID Document Management

### Generate DID Documents Using API (Recommended)

Use the built-in API endpoints to automatically generate W3C specification-compliant DID documents:

```bash
# Generate new user DID
curl -X POST http://localhost:8522/api/did/generate

# Generate/update root domain DID
curl -X POST http://localhost:8522/api/did/generate-root
```

### Manually Add DID Documents

1. Create new JSON files in the `data/did-documents/` directory
2. File naming format: `user:{16-character random}.json` or `{path}.json`
3. File content must comply with W3C DID specifications and use `{{DOMAIN}}` placeholders

### Modern DID Document Format (Generated with Official Library)

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1",
    "https://w3id.org/security/suites/x25519-2020/v1"
  ],
  "id": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7",
  "verificationMethod": [{
    "id": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf...",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7",
    "publicKeyMultibase": "z6Mkf..."
  }],
  "authentication": ["did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf..."],
  "assertionMethod": ["did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf..."],
  "capabilityDelegation": ["did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf..."],
  "capabilityInvocation": ["did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf..."],
  "keyAgreement": [{
    "id": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6LS...",
    "type": "X25519KeyAgreementKey2020",
    "controller": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7",
    "publicKeyMultibase": "z6LS..."
  }]
}
```

## Quick Start

### Installation and Startup

```bash
# Clone the project
git clone <repository-url>
cd did-web-server

# Install dependencies
npm install

# Start the server
npm start
```

### Different Environment Startup Methods

```bash
# Development mode
npm run dev    # Use nodemon for hot reload

# Production mode
npm run prod   # Set NODE_ENV=production

# Direct startup
npm start      # Run main.js directly
```

### Verify Deployment

After server startup, visit the following addresses to verify deployment:

```bash
# Check service status
curl http://localhost:8522/health

# View API information
curl http://localhost:8522/api/info

# Access root DID document
curl http://localhost:8522/.well-known/did.json
```

## API Usage Examples

### 1. Generate DID Documents

```bash
# Generate new user DID
curl -X POST http://localhost:8522/api/did/generate \
  -H "Content-Type: application/json"

# Example response:
# {
#   "success": true,
#   "did": "did:web:localhost:8522:user:ABC123DEF456GHI7",
#   "document": { ... },
#   "accessUrl": "http://localhost:8522/user/ABC123DEF456GHI7/did.json",
#   "keyPairs": { ... }
# }
```

### 2. Get DID Documents

```bash
# Get root domain DID document
curl http://localhost:8522/.well-known/did.json

# Get user DID document
curl http://localhost:8522/user/ABC123DEF456GHI7/did.json

# Get multi-level path DID document
curl http://localhost:8522/user/alice/did.json
```

### 3. Management and Monitoring

```bash
# Check service health status
curl http://localhost:8522/health

# View API and service information
curl http://localhost:8522/api/info

# Generate new root DID document
curl -X POST http://localhost:8522/api/did/generate-root
```

## W3C DID Web Specification

This server strictly complies with the W3C DID Web Method specification and uses the official `@digitalbazaar/did-method-web` library:

### DID Format
- **Root Domain**: `did:web:{domain}`
- **User Path**: `did:web:{domain}:user:{16-character random string}`
- **Multi-level Path**: `did:web:{domain}:{path1}:{path2}`

### Resolution Rules
1. `did:web:example.com` → `https://example.com/.well-known/did.json`
2. `did:web:example.com:user:ABC123` → `https://example.com/user/ABC123/did.json`
3. `did:web:example.com:user:alice` → `https://example.com/user/alice/did.json`

### Key Differences
- **Root domain uses** `/.well-known/did.json`
- **DIDs with paths directly use path** + `/did.json`, no longer using `.well-known`

### Supported Key Types
- **Ed25519VerificationKey2020**: Digital signatures, identity verification
- **X25519KeyAgreementKey2020**: Key agreement, encrypted communication

### Permission System
- **authentication**: Identity authentication
- **assertionMethod**: Assertion method
- **capabilityDelegation**: Capability delegation
- **capabilityInvocation**: Capability invocation
- **keyAgreement**: Key agreement

## Error Handling

The server provides comprehensive error handling mechanisms:

- **404 Not Found**: DID document does not exist
- **400 Bad Request**: Invalid DID format or request parameters
- **500 Internal Server Error**: Internal server error

### Error Response Example

```json
{
  "error": "DID document not found",
  "message": "No DID document found for path: nonexistent",
  "requestedPath": "/nonexistent/did.json"
}
```

## Configuration

### Environment Variable Configuration

The server supports the following environment variable configurations:

- `PORT`: Service port (default: 8522)
- `DID_DOMAIN`: DID domain configuration (default: localhost:PORT)
- `NODE_ENV`: Runtime environment (development/production)

### Domain Configuration

1. **Local Development**:
   ```bash
   DID_DOMAIN=localhost:8522
   ```

2. **Production Environment**:
   ```bash
   DID_DOMAIN=yourdomain.com
   # or
   DID_DOMAIN=did-server.example.com
   ```

3. **Using .env File**:
   ```bash
   cp .env.example .env
   # Edit DID_DOMAIN configuration in .env file
   ```

### Dynamic Domain for DID Documents

DID documents use `{{DOMAIN}}` placeholders, which are automatically replaced with the configured domain when the server starts:

```json
{
  "id": "did:web:{{DOMAIN}}:alice",
  "verificationMethod": [{
    "id": "did:web:{{DOMAIN}}:alice#key-1",
    "controller": "did:web:{{DOMAIN}}:alice"
  }]
}
```

## Extended Features

### Implemented Features

- ✅ **DID Document Resolution**: W3C specification-compliant DID Web resolution
- ✅ **Automatic DID Generation**: Generate secure DID documents using official library
- ✅ **Modern Key Types**: Ed25519 and X25519 key support
- ✅ **Dynamic Domain**: Support arbitrary domain configuration
- ✅ **Duplicate Detection**: Prevent DID identifier conflicts
- ✅ **RESTful API**: Complete API interface
- ✅ **Health Check**: Service monitoring and status checking

---

## Contributing

Welcome to submit Issues and Pull Requests!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## License

BSD 3-Clause License - See [LICENSE](LICENSE) file for details

## Related Links

- [W3C DID Core Specification](https://w3c.github.io/did-core/)
- [W3C DID Web Method Specification](https://w3c-ccg.github.io/did-method-web/)
- [@digitalbazaar/did-method-web](https://github.com/digitalbazaar/did-method-web)
- [Express.js Official Documentation](https://expressjs.com/)