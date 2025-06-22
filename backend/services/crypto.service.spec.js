import {
  deriveKey,
  encryptNote,
  decryptNote,
  generateUUID,
} from './crypto.service.js';

describe('Crypto Service', () => {
  const secretKey = 'mySuperSecretKey!';
  const plaintext = 'This is a top secret note.';

  describe('deriveKey', () => {
    it('should consistently derive the same key for same input', () => {
      const salt = Buffer.from('1234567890abcdef');
      const key1 = deriveKey(secretKey, salt);
      const key2 = deriveKey(secretKey, salt);

      expect(key1.equals(key2)).toBe(true);
    });

    it('should produce different keys for different salts', () => {
      const salt1 = Buffer.from('1234567890abcdef');
      const salt2 = Buffer.from('abcdef1234567890');

      const key1 = deriveKey(secretKey, salt1);
      const key2 = deriveKey(secretKey, salt2);

      expect(key1.equals(key2)).toBe(false);
    });
  });

  describe('encryptNote & decryptNote', () => {
    it('should encrypt and decrypt a note correctly', () => {
      const encrypted = encryptNote(secretKey, plaintext);
      const decrypted = decryptNote(secretKey, encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same input (random IV)', () => {
      const encrypted1 = encryptNote(secretKey, plaintext);
      const encrypted2 = encryptNote(secretKey, plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw an error when decrypting with wrong key', () => {
      const encrypted = encryptNote(secretKey, plaintext);
      const wrongKey = 'wrongSecretKey';

      expect(() => decryptNote(wrongKey, encrypted)).toThrow();
    });

    it('should throw an error if encrypted data is corrupted', () => {
      const encrypted = encryptNote(secretKey, plaintext);
      const corrupted = encrypted.slice(0, -4) + 'abcd';

      expect(() => decryptNote(secretKey, corrupted)).toThrow();
    });
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUUID();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(uuid)).toBe(true);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();

      expect(uuid1).not.toBe(uuid1);
    });
  });
});
