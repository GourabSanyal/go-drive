import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { storage } from "@/src/utils/storage/mmkv";
import { WalletKeypairData } from "@/src/types/wallet/wallet.types";

export class KeypairUtils {
  static generateKeypair(): Keypair {
    return Keypair.generate();
  }

  static storeKeypair(keypair: Keypair, storageKey: string): void {
    try {
      const keypairData: WalletKeypairData = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: bs58.encode(keypair.secretKey),
      };

      const dataToStore = JSON.stringify(keypairData);

      // Try to store in chunks if the data is too large
      if (dataToStore.length > 1000) {
        storage.set(
          `${storageKey}_meta`,
          JSON.stringify({
            parts: Math.ceil(dataToStore.length / 1000),
            totalLength: dataToStore.length,
            timestamp: Date.now(),
          })
        );

        // Split and store in chunks
        for (let i = 0; i < dataToStore.length; i += 1000) {
          const chunk = dataToStore.substring(i, i + 1000);
          const partKey = `${storageKey}_part_${Math.floor(i / 1000)}`;
          const success = storage.set(partKey, chunk);

          if (!success) {
            throw new Error(`Failed to store keypair chunk`);
          }
        }
      } else {
        // for smaller data
        const success = storage.set(storageKey, dataToStore);

        if (!success) {
          throw new Error("Storage operation failed");
        }
      }
    } catch (error) {
      throw new Error("Failed to store keypair");
    }
  }

  static getStoredKeypair(storageKey: string): Keypair | null {
    try {
      let keypairStr = storage.getString(storageKey);

      if (!keypairStr) {
        const metaStr = storage.getString(`${storageKey}_meta`);
        if (metaStr) {
          const meta = JSON.parse(metaStr);

          let reconstructed = "";
          for (let i = 0; i < meta.parts; i++) {
            const partKey = `${storageKey}_part_${i}`;
            const chunk = storage.getString(partKey);

            if (!chunk) {
              return null;
            }

            reconstructed += chunk;
          }

          keypairStr = reconstructed;
        } else {
          return null;
        }
      }

      const keypairData: WalletKeypairData = JSON.parse(keypairStr);

      try {
        const publicKey = new PublicKey(keypairData.publicKey);
        const secretKey = bs58.decode(keypairData.secretKey);

        return new Keypair({ publicKey: publicKey.toBytes(), secretKey });
      } catch (keypairError) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  static clearKeypair(storageKey: string): void {
    try {
      storage.delete(storageKey);

      const metaStr = storage.getString(`${storageKey}_meta`);
      if (metaStr) {
        const meta = JSON.parse(metaStr);

        for (let i = 0; i < meta.parts; i++) {
          const partKey = `${storageKey}_part_${i}`;
          storage.delete(partKey);
        }

        storage.delete(`${storageKey}_meta`);
      }
    } catch (error) {
      throw new Error("Failed to clear keypair");
    }
  }

  static convertToX25519(keypair: Keypair): {
    publicKey: string;
    secretKey: Uint8Array;
  } {
    const nacl = require("tweetnacl");
    const dappKeyPair = nacl.box.keyPair.fromSecretKey(
      keypair.secretKey.slice(0, 32)
    );
    return {
      publicKey: bs58.encode(dappKeyPair.publicKey),
      secretKey: dappKeyPair.secretKey,
    };
  }
}
