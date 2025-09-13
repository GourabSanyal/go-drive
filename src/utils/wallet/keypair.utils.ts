import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { storage } from '@/src/utils/storage/mmkv';
import { WalletKeypairData } from '@/src/types/wallet/wallet.types';

/**
 * Utility functions for managing wallet keypairs
 */
export class KeypairUtils {
  /**
   * Generate a new Ed25519 keypair
   */
  static generateKeypair(): Keypair {
    return Keypair.generate();
  }

  /**
   * Store keypair data in secure storage
   */
  static storeKeypair(keypair: Keypair, storageKey: string): void {
    try {
      const keypairData: WalletKeypairData = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: bs58.encode(keypair.secretKey)
      };
      
      console.log('🔑 Storing keypair:', {
        storageKey,
        publicKey: keypairData.publicKey.substring(0, 20) + '...',
        secretKeyLength: keypairData.secretKey.length
      });
      
      storage.set(storageKey, JSON.stringify(keypairData));
      
      // Verify storage immediately
      const stored = storage.getString(storageKey);
      if (stored) {
        console.log('✅ Keypair stored successfully');
      } else {
        console.error('❌ Keypair storage verification failed');
      }
    } catch (error) {
      console.error('Error storing keypair:', error);
      throw new Error('Failed to store keypair');
    }
  }

  /**
   * Retrieve keypair from secure storage
   */
  static getStoredKeypair(storageKey: string): Keypair | null {
    try {
      console.log('🔑 Retrieving keypair from storage:', { storageKey });
      
      const keypairStr = storage.getString(storageKey);
      if (!keypairStr) {
        console.log('❌ No keypair found in storage for key:', storageKey);
        return null;
      }
      
      console.log('✅ Keypair string found, parsing...');
      const keypairData: WalletKeypairData = JSON.parse(keypairStr);
      const publicKey = new PublicKey(keypairData.publicKey);
      const secretKey = bs58.decode(keypairData.secretKey);
      
      console.log('✅ Keypair retrieved successfully:', {
        publicKey: publicKey.toBase58().substring(0, 20) + '...',
        secretKeyLength: secretKey.length
      });
      
      return new Keypair({ publicKey: publicKey.toBytes(), secretKey });
    } catch (error) {
      console.error('Error retrieving keypair:', error);
      return null;
    }
  }

  /**
   * Clear keypair from storage
   */
  static clearKeypair(storageKey: string): void {
    try {
      console.log('🗑️ Clearing keypair from storage:', { storageKey });
      storage.delete(storageKey);
      console.log('✅ Keypair cleared successfully');
    } catch (error) {
      console.error('Error clearing keypair:', error);
      throw new Error('Failed to clear keypair');
    }
  }

  /**
   * Convert Ed25519 keypair to x25519 for encryption
   */
  static convertToX25519(keypair: Keypair): { publicKey: string; secretKey: Uint8Array } {
    const nacl = require('tweetnacl');
    const dappKeyPair = nacl.box.keyPair.fromSecretKey(keypair.secretKey.slice(0, 32));
    return {
      publicKey: bs58.encode(dappKeyPair.publicKey),
      secretKey: dappKeyPair.secretKey
    };
  }
}
