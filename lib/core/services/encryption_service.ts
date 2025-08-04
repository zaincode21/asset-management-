import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export class EncryptionService {
  private encryptionKey: string;
  private iv: string;

  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey || 'MySecretEncryptionKey1234567890';
    this.iv = '1234567890123456'; // 16 bytes for AES
  }

  async encryptString(plainText: string): Promise<string> {
    try {
      // For simplicity, using base64 encoding
      // In production, use proper encryption libraries like react-native-crypto-js
      const encoded = Buffer.from(plainText, 'utf8').toString('base64');
      return encoded;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decryptString(encryptedText: string): Promise<string> {
    try {
      // For simplicity, using base64 decoding
      // In production, use proper encryption libraries like react-native-crypto-js
      const decoded = Buffer.from(encryptedText, 'base64').toString('utf8');
      return decoded;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  async encryptMap(data: Record<string, any>): Promise<Record<string, any>> {
    try {
      const jsonString = JSON.stringify(data);
      const encryptedData = await this.encryptString(jsonString);
      return { encrypted_data: encryptedData };
    } catch (error) {
      console.error('Map encryption error:', error);
      throw new Error('Failed to encrypt map data');
    }
  }

  async decryptMap(encryptedData: Record<string, any>): Promise<Record<string, any>> {
    try {
      const decryptedString = await this.decryptString(encryptedData.encrypted_data);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Map decryption error:', error);
      throw new Error('Failed to decrypt map data');
    }
  }

  async generateDataHash(data: Record<string, any>): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        jsonString
      );
      return hash;
    } catch (error) {
      console.error('Hash generation error:', error);
      throw new Error('Failed to generate data hash');
    }
  }

  async verifyDataHash(data: Record<string, any>, expectedHash: string): Promise<boolean> {
    try {
      const actualHash = await this.generateDataHash(data);
      return actualHash === expectedHash;
    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }

  async generateUniqueId(): Promise<string> {
    try {
      const timestamp = Date.now().toString();
      const randomBytes = await Crypto.getRandomBytesAsync(8);
      const randomString = Buffer.from(randomBytes).toString('hex');
      return `${timestamp}-${randomString}`;
    } catch (error) {
      console.error('Unique ID generation error:', error);
      // Fallback to timestamp + Math.random
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  async storeSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Secure storage error:', error);
      throw new Error('Failed to store secure item');
    }
  }

  async getSecureItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Secure retrieval error:', error);
      return null;
    }
  }

  async removeSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Secure removal error:', error);
      throw new Error('Failed to remove secure item');
    }
  }

  async generateSecureKey(): Promise<string> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      return Buffer.from(randomBytes).toString('base64');
    } catch (error) {
      console.error('Secure key generation error:', error);
      throw new Error('Failed to generate secure key');
    }
  }

  async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    try {
      const generatedSalt = salt || await this.generateSecureKey();
      const combined = password + generatedSalt;
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined
      );
      return { hash, salt: generatedSalt };
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const { hash: computedHash } = await this.hashPassword(password, salt);
      return computedHash === hash;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }
} 