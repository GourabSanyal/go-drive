import { WalletType, WalletDeepLinkScheme, WalletEncryptionType } from '@/src/enums/wallet.enums';
import { WalletAdapterConfig } from '@/src/types/wallet/wallet.types';
import { BaseWalletAdapter } from './BaseWalletAdapter';
import { WalletUtils } from '@/src/utils/wallet/wallet.utils';
import { KeypairUtils } from '@/src/utils/wallet/keypair.utils';

export class SolflareAdapter extends BaseWalletAdapter {
  constructor(sessionHook: ReturnType<typeof import('@/src/hooks/session').useSession>) {
    const config: WalletAdapterConfig = {
      type: WalletType.SOLFLARE,
      deepLink: {
        scheme: WalletDeepLinkScheme.SOLFLARE,
        connectUrl: 'https://solflare.com/ul/v1/connect',
        redirectLink: 'drive://',
        appUrl: 'https://go-drive.app',
        cluster: 'devnet'
      },
      encryption: {
        type: WalletEncryptionType.NACL_BOX,
        requiresKeypair: true
      },
      storageKey: WalletUtils.getKeypairStorageKey(WalletType.SOLFLARE)
    };
    
    super(config, sessionHook);
  }

  async connect(): Promise<void> {
    try {
      this.setConnectionState({
        state: 'connecting' as any,
        isConnecting: true,
        error: null
      });

      const isInstalled = await this.checkInstalled();
      if (!isInstalled) {
        throw new Error('Solflare wallet is not installed');
      }

      this.generateAndStoreKeypair();
      const keypair = this.getStoredKeypair();
      
      if (!keypair) {
        throw new Error('Failed to generate keypair');
      }

      const dappKeyPair = KeypairUtils.convertToX25519(keypair);
      
      const connectUrl = `${this.config.deepLink.connectUrl}?` +
        `dapp_encryption_public_key=${encodeURIComponent(dappKeyPair.publicKey)}&` +
        `cluster=${this.config.deepLink.cluster}&` +
        `app_url=${encodeURIComponent(this.config.deepLink.appUrl)}&` +
        `redirect_link=${encodeURIComponent(this.config.deepLink.redirectLink)}`;

      await WalletUtils.openWalletApp(connectUrl);
    } catch (error) {
      this.setConnectionState({
        state: 'error' as any,
        isConnecting: false,
        error: error instanceof Error ? `Solflare: ${error.message}` : 'Failed to connect to Solflare'
      });
    }
  }

  async handleConnectionResponse(url: string): Promise<void> {
    await this.handleEncryptedResponse(url);
  }

}
