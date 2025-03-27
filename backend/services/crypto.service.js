import crypto from 'crypto';

export function deriveKey(
  secretKey,
  salt,
  iterations = 100000,
  keyLength = 32
) {
  return crypto.pbkdf2Sync(secretKey, salt, iterations, keyLength, 'sha256');
}

export function encryptNote(secretKey, plaintext) {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(secretKey, salt);

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Data = salt + iv + authTag + cipher text
  return Buffer.concat([salt, iv, authTag, encrypted]).toString('base64');
}

export function decryptNote(secretKey, encryptedData) {
  const data = Buffer.from(encryptedData, 'base64');

  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const authTag = data.slice(28, 44);
  const ciphertext = data.slice(44);

  const key = deriveKey(secretKey, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export function generateUUID() {
  return crypto.randomUUID();
}
