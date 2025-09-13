import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

export class EncryptionUtils {
  static decryptPayload(
    data: string,
    nonce: string,
    sharedSecret: Uint8Array
  ): any {
    try {
      let cleanData = data.split('#')[0];
      let cleanNonce = nonce;
      
      const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
      
      if (!base58Regex.test(cleanData)) {
        cleanData = cleanData.replace(/[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g, '');
      }
      
      if (!base58Regex.test(cleanNonce)) {
        cleanNonce = cleanNonce.replace(/[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/g, '');
      }
      
      const decryptedData = nacl.secretbox.open(
        bs58.decode(cleanData),
        bs58.decode(cleanNonce),
        sharedSecret
      );
      
      if (!decryptedData) {
        throw new Error('Failed to decrypt payload');
      }
      
      return JSON.parse(new TextDecoder().decode(decryptedData));
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static createSharedSecret(
    walletPublicKey: string,
    dappSecretKey: Uint8Array
  ): Uint8Array {
    try {
      const walletPubKeyBytes = bs58.decode(walletPublicKey);
      const sharedSecret = nacl.box.before(walletPubKeyBytes, dappSecretKey);
      return sharedSecret;
    } catch (error) {
      throw new Error('Failed to create shared secret');
    }
  }

  static encryptPayload(
    data: any,
    sharedSecret: Uint8Array
  ): { data: string; nonce: string } {
    try {
      const nonce = nacl.randomBytes(24);
      const message = new TextEncoder().encode(JSON.stringify(data));
      const encrypted = nacl.secretbox(message, nonce, sharedSecret);
      
      return {
        data: bs58.encode(encrypted),
        nonce: bs58.encode(nonce)
      };
    } catch (error) {
      throw new Error('Failed to encrypt payload');
    }
  }

  static validateEncryptionParams(
    walletPublicKey: string,
    nonce: string,
    data: string
  ): boolean {
    try {
      if (!walletPublicKey || !nonce || !data) {
        return false;
      }
      
      const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
      
      return base58Regex.test(walletPublicKey) && 
             base58Regex.test(nonce) && 
             base58Regex.test(data);
    } catch {
      return false;
    }
  }

  static generateNonce(): string {
    const nonce = nacl.randomBytes(24);
    return bs58.encode(nonce);
  }
}
