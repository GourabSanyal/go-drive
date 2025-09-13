import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { storage } from '@/src/utils/storage/mmkv';
import { WalletKeypairData } from '@/src/types/wallet/wallet.types';

export class KeypairUtils {
  static generateKeypair(): Keypair {
    return Keypair.generate();
  }

  static storeKeypair(keypair: Keypair, storageKey: string): void {
    try {
      const keypairData: WalletKeypairData = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: bs58.encode(keypair.secretKey)
      };
      
      storage.set(storageKey, JSON.stringify(keypairData));
    } catch (error) {
      throw new Error('Failed to store keypair');
    }
  }

  static getStoredKeypair(storageKey: string): Keypair | null {
    try {
      const keypairStr = storage.getString(storageKey);
      if (!keypairStr) {
        return null;
      }
      
      const keypairData: WalletKeypairData = JSON.parse(keypairStr);
      const publicKey = new PublicKey(keypairData.publicKey);
      const secretKey = bs58.decode(keypairData.secretKey);
      
      return new Keypair({ publicKey: publicKey.toBytes(), secretKey });
    } catch (error) {
      return null;
    }
  }

  static clearKeypair(storageKey: string): void {
    try {
      storage.delete(storageKey);
    } catch (error) {
      throw new Error('Failed to clear keypair');
    }
  }

  static convertToX25519(keypair: Keypair): { publicKey: string; secretKey: Uint8Array } {
    const nacl = require('tweetnacl');
    const dappKeyPair = nacl.box.keyPair.fromSecretKey(keypair.secretKey.slice(0, 32));
    return {
      publicKey: bs58.encode(dappKeyPair.publicKey),
      secretKey: dappKeyPair.secretKey
    };
  }
}
