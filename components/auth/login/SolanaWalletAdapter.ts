import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey, Cluster } from '@solana/web3.js';

export interface SolanaWalletData {
  address: string;
  publicKey: string;
  authToken: string;
  username?: string;
  profilePicUrl?: string;
  attachmentData?: any;
}

/**
 * Helper class for Solana Mobile Wallet Adapter interactions
 */
export class SolanaWalletAdapter {
  /**
   * Get the Solana cluster to connect to
   */
  static getSolanaCluster(): Cluster {
    // You can make this configurable based on environment
    return 'devnet' as Cluster;
  }

  /**
   * Authorize with a Solana wallet using MWA
   * @returns Wallet data including address and auth token
   */
  static async authorize(): Promise<SolanaWalletData> {
    try {
      const cluster = this.getSolanaCluster();
      console.log(`Connecting to Solana ${cluster}`);

      const result = await transact(async wallet => {
        const authorizationResult = await wallet.authorize({
          cluster,
          identity: {
            name: 'Go Drive',
            uri: 'drive://', // scheme from your app.config.ts
            icon: './assets/images/icon.png',
          },
        });

        return {
          publicKey: authorizationResult.accounts[0].address,
          authToken: authorizationResult.auth_token,
          label: authorizationResult.accounts[0].label,
        };
      });

      if (!result || !result.publicKey) {
        throw new Error('Authorization failed: No public key returned');
      }

      // Address sent from the wallet is base64 encoded, convert it to base58
      const base64Address = result.publicKey;
      const addressBytes = Buffer.from(base64Address, 'base64');

      // Create pubkey from raw bytes
      const publicKey = new PublicKey(addressBytes);
      const address = publicKey.toBase58();
      
      return {
        address,
        publicKey: address,
        authToken: result.authToken,
        username: result.label || address.substring(0, 6),
        profilePicUrl: undefined,
        attachmentData: {
          walletType: 'solana-mwa',
          cluster: this.getSolanaCluster(),
          connectedAt: new Date().toISOString()
        },
      };
    } catch (error) {
      console.error('Error authorizing with Solana wallet:', error);
      throw error;
    }
  }

  /**
   * Reauthorize with a previously connected wallet
   * @param authToken Previous auth token
   * @returns Updated wallet data
   */
  static async reauthorize(authToken: string): Promise<SolanaWalletData> {
    try {
      const cluster = this.getSolanaCluster();
      console.log(`Reauthorizing with Solana ${cluster}`);

      const result = await transact(async wallet => {
        const reauthorizeResult = await wallet.reauthorize({
          auth_token: authToken,
          identity: {
            name: 'Go Drive',
            uri: 'drive://',
            icon: './assets/images/icon.png',
          },
        });

        return {
          publicKey: reauthorizeResult.accounts[0].address,
          authToken: reauthorizeResult.auth_token,
          label: reauthorizeResult.accounts[0].label,
        };
      });

      if (!result || !result.publicKey) {
        throw new Error('Reauthorization failed: No public key returned');
      }

      // Address sent from the wallet is base64 encoded, convert it to base58
      const base64Address = result.publicKey;
      const addressBytes = Buffer.from(base64Address, 'base64');

      // Create pubkey from raw bytes
      const publicKey = new PublicKey(addressBytes);
      const address = publicKey.toBase58();
      
      return {
        address,
        publicKey: address,
        authToken: result.authToken,
        username: result.label || address.substring(0, 6),
        profilePicUrl: undefined,
        attachmentData: {
          walletType: 'solana-mwa',
          cluster: this.getSolanaCluster(),
          connectedAt: new Date().toISOString(),
          reauthorized: true,
        },
      };
    } catch (error) {
      console.error('Error reauthorizing with Solana wallet:', error);
      throw error;
    }
  }

  /**
   * Deauthorize the current wallet connection
   * @param authToken Auth token to deauthorize
   */
  static async deauthorize(authToken: string): Promise<void> {
    try {
      await transact(async wallet => {
        await wallet.deauthorize({
          auth_token: authToken,
        });
      });
      console.log('Successfully deauthorized wallet');
    } catch (error) {
      console.error('Error deauthorizing wallet:', error);
      throw error;
    }
  }
}
