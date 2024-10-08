# Security

## Password Security

Passwords are secured using HMAC-512. HMAC
([Hash-based Message Authentication Code](https://en.wikipedia.org/wiki/HMAC))
is a MAC defined in [RFC2104](http://www.ietf.org/rfc/rfc2104.txt) and
[FIPS-198](http://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.198-1.pdf) and
constructed using a cryptographic hash algorithm.

## Data Security

Data is secured using AES-CBC. AES
([Advanced Encryption Standard](http://en.wikipedia.org/wiki/Advanced_Encryption_Standard))
is a symmetric block cipher standardized by
[NIST](http://csrc.nist.gov/publications/fips/fips197/fips-197.pdf) . It has a
fixed data block size of 16 bytes. Its keys can be 128, 192, or 256 bits long.

## Cryptographic Methods Used in the Vault

These cryptographic methods are implemented in the [crypto.py](../src/crypto.py)
file within the vault.

### 1. AES Encryption

**AES (Advanced Encryption Standard)**:

- **Key Size**: 32 bytes
- **Mode of Operation**: AES.MODE_EAX
- **Usage**:
  - Encrypts and decrypts data at rest in the vault.

### 2. HMAC Generation

**HMAC (Hash-based Message Authentication Code)**:

- **Algorithm**: SHA-512
- **Key Size**: 32 bytes
- **Usage**:
  - Generates and verifies HMACs for unique values in the vault.

### 3. Fernet Encryption

**Fernet encryption**:

- **Key Size**: 32 bytes
- **Usage**:
  - Encrypts and decrypts identity tokens used by the vault.
