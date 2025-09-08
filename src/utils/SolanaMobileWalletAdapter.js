import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';
import { Platform } from 'react-native';

/**
 * Helper class for Solana Mobile Wallet Adapter interactions
 */
export class SolanaMobileWalletAdapter {
  /**
   * Authorize with a Solana wallet using MWA
   * @param {string} cluster - The Solana cluster to connect to ('devnet', 'testnet', 'mainnet-beta')
   * @returns {Promise<Object>} Wallet data including address and auth token
   */
  static async authorize(cluster = 'devnet') {
    try {
      // Check if running on Android
      if (Platform.OS !== 'android') {
        throw new Error('Mobile Wallet Adapter is only supported on Android');
      }

      console.log(`Connecting to Solana ${cluster}`);

      const result = await transact(async wallet => {
        const authorizationResult = await wallet.authorize({
          cluster,
          identity: {
            name: 'Go Drive',
            uri: 'drive://',
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
          cluster,
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
   * @param {string} authToken - Previous auth token
   * @param {string} cluster - The Solana cluster to connect to
   * @returns {Promise<Object>} Updated wallet data
   */
  static async reauthorize(authToken, cluster = 'devnet') {
    try {
      // Check if running on Android
      if (Platform.OS !== 'android') {
        throw new Error('Mobile Wallet Adapter is only supported on Android');
      }
      
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
          cluster,
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
   * @param {string} authToken - Auth token to deauthorize
   */
  static async deauthorize(authToken) {
    try {
      // Check if running on Android
      if (Platform.OS !== 'android') {
        throw new Error('Mobile Wallet Adapter is only supported on Android');
      }
      
      await transact(async wallet => {
        await wallet.deauthorize({
          auth_token: authToken,
        });
      });
      console.log('Successfully deauthorized wallet');
      return true;
    } catch (error) {
      console.error('Error deauthorizing wallet:', error);
      throw error;
    }
  }
}