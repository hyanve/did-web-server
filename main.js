require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const {driver} = require('@digitalbazaar/did-method-web');
const {Ed25519VerificationKey2020} = require('@digitalbazaar/ed25519-verification-key-2020');
const {X25519KeyAgreementKey2020} = require('@digitalbazaar/x25519-key-agreement-key-2020');

const app = express();
const PORT = process.env.PORT || 8522;
const DID_DOMAIN = process.env.DID_DOMAIN || `localhost:${PORT}`;

const didWebDriver = driver();
didWebDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519VerificationKey2020.from
});
didWebDriver.use({
  multibaseMultikeyHeader: 'z6LS',
  fromMultibase: X25519KeyAgreementKey2020.from
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DID_DOCUMENTS_PATH = path.join(__dirname, 'data', 'did-documents');

async function loadDIDDocument(filename) {
  try {
    const filePath = path.join(DID_DOCUMENTS_PATH, filename);
    const data = await fs.readFile(filePath, 'utf8');
    const processedData = data.replace(/\{\{DOMAIN\}\}/g, DID_DOMAIN);
    return JSON.parse(processedData);
  } catch (error) {
    console.error(`Error loading DID document ${filename}:`, error);
    return null;
  }
}

async function didDocumentExists(filename) {
  try {
    const filePath = path.join(DID_DOCUMENTS_PATH, filename);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function generateRandomId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateUniqueDID(maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    const randomId = generateRandomId();
    const didPath = `user:${randomId}`;
    const filename = `${didPath}.json`;
    
    const exists = await didDocumentExists(filename);
    if (!exists) {
      return {
        did: `did:web:${DID_DOMAIN}:${didPath}`,
        path: didPath,
        filename: filename,
        randomId: randomId
      };
    }
  }
  
  throw new Error(`Failed to generate unique DID after ${maxRetries} attempts`);
}

async function createDIDDocumentWithDriver(didInfo) {
  const { did, randomId } = didInfo;
  
  try {
    const verificationKeyPair = await Ed25519VerificationKey2020.generate();
    const keyAgreementKeyPair = await X25519KeyAgreementKey2020.generate();
    
    const didDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
        'https://w3id.org/security/suites/x25519-2020/v1'
      ],
      id: did,
      verificationMethod: [{
        id: `${did}#${verificationKeyPair.fingerprint()}`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: verificationKeyPair.publicKeyMultibase
      }],
      authentication: [`${did}#${verificationKeyPair.fingerprint()}`],
      assertionMethod: [`${did}#${verificationKeyPair.fingerprint()}`],
      capabilityDelegation: [`${did}#${verificationKeyPair.fingerprint()}`],
      capabilityInvocation: [`${did}#${verificationKeyPair.fingerprint()}`],
      keyAgreement: [{
        id: `${did}#${keyAgreementKeyPair.fingerprint()}`,
        type: 'X25519KeyAgreementKey2020',
        controller: did,
        publicKeyMultibase: keyAgreementKeyPair.publicKeyMultibase
      }]
    };
    
    const keyPairs = new Map();
    keyPairs.set(`${did}#${verificationKeyPair.fingerprint()}`, verificationKeyPair);
    keyPairs.set(`${did}#${keyAgreementKeyPair.fingerprint()}`, keyAgreementKeyPair);
    
    return {
      didDocument,
      keyPairs,
      verificationKeyPair,
      keyAgreementKeyPair
    };
  } catch (error) {
    console.error('Error creating DID document with driver:', error);
    throw error;
  }
}

async function saveDIDDocument(didInfo, didDocument) {
  try {
    const filePath = path.join(DID_DOCUMENTS_PATH, didInfo.filename);
    
    await fs.mkdir(DID_DOCUMENTS_PATH, { recursive: true });
    
    const documentWithPlaceholder = JSON.stringify(didDocument, null, 2)
      .replace(new RegExp(DID_DOMAIN, 'g'), '{{DOMAIN}}');
    
    await fs.writeFile(filePath, documentWithPlaceholder, 'utf8');
    
    return true;
  } catch (error) {
    console.error('Error saving DID document:', error);
    throw error;
  }
}

app.get('/.well-known/did.json', async (req, res) => {
  try {
    const didDocument = await loadDIDDocument('root.json');
    
    if (!didDocument) {
      return res.status(404).json({ error: 'Root DID document not found' });
    }
    
    res.json(didDocument);
  } catch (error) {
    console.error('Error serving root DID document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/:path/did.json', async (req, res) => {
  try {
    const { path: userPath } = req.params;
    
    if (!userPath || userPath.includes('..') || userPath.includes('/')) {
      return res.status(400).json({ error: 'Invalid path format' });
    }
    
    const filename = `${userPath}.json`;
    const exists = await didDocumentExists(filename);
    
    if (!exists) {
      return res.status(404).json({ 
        error: 'DID document not found',
        message: `No DID document found for path: ${userPath}`
      });
    }
    
    const didDocument = await loadDIDDocument(filename);
    
    if (!didDocument) {
      return res.status(500).json({ error: 'Failed to load DID document' });
    }
    
    res.json(didDocument);
  } catch (error) {
    console.error('Error serving user DID document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/*/*/did.json', async (req, res) => {
  try {
    const pathSegments = req.path.split('/').filter(segment => segment && segment !== 'did.json');
    const fullPath = pathSegments.join(':');
    
    const filename = `${fullPath}.json`;
    const exists = await didDocumentExists(filename);
    
    if (!exists) {
      return res.status(404).json({ 
        error: 'DID document not found',
        message: `No DID document found for path: ${fullPath}`
      });
    }
    
    const didDocument = await loadDIDDocument(filename);
    
    if (!didDocument) {
      return res.status(500).json({ error: 'Failed to load DID document' });
    }
    
    res.json(didDocument);
  } catch (error) {
    console.error('Error serving multi-level DID document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('./package.json').version
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'DID Web Server',
    version: require('./package.json').version,
    description: 'A lightweight server for DID Web services using @digitalbazaar/did-method-web',
    endpoints: {
      'GET /.well-known/did.json': 'Root domain DID document',
      'GET /{path}/did.json': 'Path-specific DID document (W3C compliant)',
      'GET /{path1}/{path2}/did.json': 'Multi-level path DID document',
      'POST /api/did/generate': 'Generate new user DID document using @digitalbazaar/did-method-web',
      'POST /api/did/generate-root': 'Generate/update root DID document using @digitalbazaar/did-method-web',
      'GET /health': 'Health check',
      'GET /api/info': 'API information'
    },
    didWebSupport: true,
    cryptographicSuites: [
      'Ed25519VerificationKey2020',
      'X25519KeyAgreementKey2020'
    ]
  });
});

app.post('/api/did/generate', async (req, res) => {
  try {
    const didInfo = await generateUniqueDID();
    
    const result = await createDIDDocumentWithDriver(didInfo);
    
    await saveDIDDocument(didInfo, result.didDocument);
    
    const displayDomain = DID_DOMAIN.replace('%3A', ':');
    
    res.status(201).json({
      success: true,
      did: didInfo.did,
      document: result.didDocument,
      accessUrl: `http://${displayDomain}/${didInfo.path.replace(':', '/')}/did.json`,
      keyPairs: {
        verificationKey: {
          id: `${didInfo.did}#${result.verificationKeyPair.fingerprint()}`,
          type: result.verificationKeyPair.type,
          publicKeyMultibase: result.verificationKeyPair.publicKeyMultibase
        },
        keyAgreementKey: {
          id: `${didInfo.did}#${result.keyAgreementKeyPair.fingerprint()}`,
          type: result.keyAgreementKeyPair.type,
          publicKeyMultibase: result.keyAgreementKeyPair.publicKeyMultibase
        }
      },
      message: 'DID generated successfully using @digitalbazaar/did-method-web library'
    });
    
  } catch (error) {
    console.error('Error generating DID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate DID',
      message: error.message
    });
  }
});

app.post('/api/did/generate-root', async (req, res) => {
  try {
    const verificationKeyPair = await Ed25519VerificationKey2020.generate();
    const keyAgreementKeyPair = await X25519KeyAgreementKey2020.generate();
    
    const rootDid = `did:web:${DID_DOMAIN}`;
    
    const rootDidDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
        'https://w3id.org/security/suites/x25519-2020/v1'
      ],
      id: rootDid,
      verificationMethod: [{
        id: `${rootDid}#${verificationKeyPair.fingerprint()}`,
        type: 'Ed25519VerificationKey2020',
        controller: rootDid,
        publicKeyMultibase: verificationKeyPair.publicKeyMultibase
      }],
      authentication: [`${rootDid}#${verificationKeyPair.fingerprint()}`],
      assertionMethod: [`${rootDid}#${verificationKeyPair.fingerprint()}`],
      capabilityDelegation: [`${rootDid}#${verificationKeyPair.fingerprint()}`],
      capabilityInvocation: [`${rootDid}#${verificationKeyPair.fingerprint()}`],
      keyAgreement: [{
        id: `${rootDid}#${keyAgreementKeyPair.fingerprint()}`,
        type: 'X25519KeyAgreementKey2020',
        controller: rootDid,
        publicKeyMultibase: keyAgreementKeyPair.publicKeyMultibase
      }],
      service: [{
        id: `${rootDid}#did-generation`,
        type: 'DIDGenerationService',
        serviceEndpoint: `https://{{DOMAIN}}/api/did/generate`
      }]
    };
    
    const rootFilePath = path.join(DID_DOCUMENTS_PATH, 'root.json');
    await fs.mkdir(DID_DOCUMENTS_PATH, { recursive: true });
    
    const documentWithPlaceholder = JSON.stringify(rootDidDocument, null, 2)
      .replace(new RegExp(DID_DOMAIN, 'g'), '{{DOMAIN}}');
    
    await fs.writeFile(rootFilePath, documentWithPlaceholder, 'utf8');
    
    const displayDomain = DID_DOMAIN.replace('%3A', ':');
    
    res.status(201).json({
      success: true,
      did: rootDid,
      document: rootDidDocument,
      accessUrl: `http://${displayDomain}/.well-known/did.json`,
      keyPairs: {
        verificationKey: {
          id: `${rootDid}#${verificationKeyPair.fingerprint()}`,
          type: verificationKeyPair.type,
          publicKeyMultibase: verificationKeyPair.publicKeyMultibase
        },
        keyAgreementKey: {
          id: `${rootDid}#${keyAgreementKeyPair.fingerprint()}`,
          type: keyAgreementKeyPair.type,
          publicKeyMultibase: keyAgreementKeyPair.publicKeyMultibase
        }
      },
      message: 'Root DID generated successfully using @digitalbazaar/did-method-web library'
    });
    
  } catch (error) {
    console.error('Error generating root DID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate root DID',
      message: error.message
    });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'DID document not found',
    message: 'The requested DID document does not exist',
    requestedPath: req.originalUrl
  });
});

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

app.listen(PORT, () => {
  const displayDomain = DID_DOMAIN.replace('%3A', ':');
  console.log(`🚀 DID Web Server is running on port ${PORT}`);
  console.log(`🌐 Domain: ${displayDomain}`);
  console.log(`📖 Root DID document: http://${displayDomain}/.well-known/did.json`);
  console.log(`🔍 Health check: http://${displayDomain}/health`);
  console.log(`ℹ️  API info: http://${displayDomain}/api/info`);
  console.log(`📝 Example user DID: http://${displayDomain}/alice/did.json`);
  console.log(`📝 Multi-level DID: http://${displayDomain}/user/alice/did.json`);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});