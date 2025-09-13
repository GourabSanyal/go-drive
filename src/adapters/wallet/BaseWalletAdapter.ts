
import { WalletConnectionState, WalletDeepLinkScheme } from '@/src/enums/wallet.enums';
import { 
  WalletAdapterConfig, 
  WalletConnectionState as IWalletConnectionState,
  WalletSession,
  WalletConnectionResponse 
} from '@/src/types/wallet/wallet.types';
import { KeypairUtils } from '@/src/utils/wallet/keypair.utils';
import { EncryptionUtils } from '@/src/utils/wallet/encryption.utils';
import { WalletUtils } from '@/src/utils/wallet/wallet.utils';
import { DebugUtils } from '@/src/utils/wallet/debug.utils';
import { useSession } from '@/src/hooks/session';

export abstract class BaseWalletAdapter {
  protected config: WalletAdapterConfig;
  protected connectionState: IWalletConnectionState;
  protected sessionHook: ReturnType<typeof useSession>;
  private lastProcessedUrl: string | null = null;
  private lastProcessedTime: number = 0;

  constructor(config: WalletAdapterConfig, sessionHook: ReturnType<typeof useSession>) {
    this.config = config;
    this.sessionHook = sessionHook;
    this.connectionState = {
      state: WalletConnectionState.DISCONNECTED,
      isConnecting: false,
      isCheckingConnection: false,
      error: null,
      isConnected: false
    };
  }

  /**
   * Abstract method to be implemented by specific wallet adapters
   */
  abstract connect(): Promise<void>;
  abstract handleConnectionResponse(url: string): Promise<void>;

  /**
   * Check if wallet is installed
   */
  async checkInstalled(): Promise<boolean> {
    const scheme = WalletUtils.getWalletScheme(this.config.type);
    return WalletUtils.checkWalletInstalled(scheme);
  }

  /**
   * Generate and store keypair for encryption
   */
  protected generateAndStoreKeypair(): void {
    const keypair = KeypairUtils.generateKeypair();
    KeypairUtils.storeKeypair(keypair, this.config.storageKey);
    console.log('🔑 Keypair generated and stored:', {
      storageKey: this.config.storageKey,
      walletType: this.config.type,
      publicKey: keypair.publicKey.toBase58().substring(0, 20) + '...'
    });
  }

  /**
   * Get stored keypair for decryption
   */
  protected getStoredKeypair() {
    const keypair = KeypairUtils.getStoredKeypair(this.config.storageKey);
    console.log('🔑 Keypair retrieval:', {
      storageKey: this.config.storageKey,
      found: !!keypair,
      walletType: this.config.type
    });
    return keypair;
  }

  /**
   * Clear stored keypair
   */
  protected clearKeypair(): void {
    console.log('🗑️ Clearing keypair:', {
      storageKey: this.config.storageKey,
      walletType: this.config.type
    });
    KeypairUtils.clearKeypair(this.config.storageKey);
  }

  /**
   * Handle encrypted connection response
   */
  protected async handleEncryptedResponse(url: string): Promise<void> {
    try {
      console.log('🔗 Processing deep link URL:', url);
      console.log('🔗 Current connection state:', this.connectionState);
      
      // Check for duplicate URL processing (within 5 seconds)
      const currentTime = Date.now();
      if (this.lastProcessedUrl === url && (currentTime - this.lastProcessedTime) < 5000) {
        console.log('⚠️ Duplicate URL detected, ignoring:', url);
        return;
      }
      
      // Check if we're already connected or processing
      if (this.connectionState.isConnected) {
        console.log('⚠️ Already connected, ignoring duplicate deep link');
        return;
      }
      
      if (this.connectionState.isCheckingConnection) {
        console.log('⚠️ Already checking connection, ignoring duplicate deep link');
        return;
      }
      
      // Mark this URL as being processed
      this.lastProcessedUrl = url;
      this.lastProcessedTime = currentTime;

      this.setConnectionState({
        state: WalletConnectionState.CHECKING_CONNECTION,
        isCheckingConnection: true,
        error: null
      });

      // Debug the URL parameters
      DebugUtils.analyzeWalletResponse(url);
      
      const params = WalletUtils.parseDeepLinkUrl(url);
      console.log('🔗 BaseWalletAdapter - Parsed URL parameters:', Object.fromEntries(params.entries()));
      
      // Validate response
      const validation = WalletUtils.validateConnectionResponse(params);
      console.log('🔗 BaseWalletAdapter - Response validation:', validation);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Extract connection data
      const { walletPublicKey, nonce, data } = WalletUtils.extractConnectionData(params, this.config.type);
      console.log('🔗 BaseWalletAdapter - Extracted connection data:', {
        walletType: this.config.type,
        hasWalletPublicKey: !!walletPublicKey,
        hasNonce: !!nonce,
        hasData: !!data,
        walletPublicKey: walletPublicKey ? walletPublicKey.substring(0, 20) + '...' : null,
        nonce: nonce ? nonce.substring(0, 10) + '...' : null,
        dataLength: data ? data.length : 0
      });
      
      console.log('🔍 Response analysis:', {
        walletType: this.config.type,
        requiresKeypair: this.config.encryption.requiresKeypair,
        hasWalletPublicKey: !!walletPublicKey,
        hasNonce: !!nonce,
        hasData: !!data,
        walletPublicKey: walletPublicKey ? walletPublicKey.substring(0, 20) + '...' : null,
        nonce: nonce ? nonce.substring(0, 10) + '...' : null,
        dataLength: data ? data.length : 0
      });
      
      // Check if this wallet uses encryption or direct parameters
      if (this.config.encryption.requiresKeypair && walletPublicKey && nonce && data) {
        console.log('🔐 Using encrypted response handling');
        // Handle encrypted response
        await this.handleEncryptedWalletResponse(walletPublicKey, nonce, data);
      } else if (this.config.encryption.requiresKeypair && nonce && data) {
        // Fallback: if we have encrypted data but walletPublicKey extraction failed,
        // try to extract it from the URL parameters directly
        console.log('🔐 Fallback: Trying to extract wallet public key from URL parameters');
        const fallbackWalletPublicKey = params.get('solflare_encryption_public_key') || 
                                       params.get('phantom_encryption_public_key') ||
                                       params.get('wallet_encryption_public_key') ||
                                       params.get('backpack_encryption_public_key') ||
                                       params.get('encryption_public_key');
        
        if (fallbackWalletPublicKey) {
          console.log('✅ Found wallet public key via fallback:', fallbackWalletPublicKey.substring(0, 20) + '...');
          await this.handleEncryptedWalletResponse(fallbackWalletPublicKey, nonce, data);
        } else {
          console.log('❌ No wallet public key found, falling back to direct response');
          await this.handleDirectWalletResponse(params);
        }
      } else {
        console.log('📝 Using direct parameter response handling');
        // Handle direct parameter response (no encryption)
        await this.handleDirectWalletResponse(params);
      }
    } catch (error) {
      console.error(`Error handling connection response for ${this.config.type}:`, error);
      this.setConnectionState({
        state: WalletConnectionState.ERROR,
        isConnected: false,
        isCheckingConnection: false,
        error: error instanceof Error ? `${this.config.type}: ${error.message}` : `Failed to connect with ${this.config.type} wallet`
      });
    }
  }

  /**
   * Handle encrypted wallet response
   */
  private async handleEncryptedWalletResponse(walletPublicKey: string, nonce: string, data: string): Promise<void> {
    console.log('🔐 Handling encrypted wallet response for:', this.config.type);
    console.log('🔐 Encryption parameters:', {
      walletPublicKey: walletPublicKey.substring(0, 20) + '...',
      nonce: nonce.substring(0, 10) + '...',
      dataLength: data.length
    });
    
    // Get stored keypair for decryption
    let keypair = this.getStoredKeypair();
    if (!keypair) {
      console.log('🔑 No keypair found, attempting to regenerate...');
      // Try to regenerate keypair as fallback
      this.generateAndStoreKeypair();
      keypair = this.getStoredKeypair();
      if (!keypair) {
        throw new Error(`No keypair available for decryption in ${this.config.type} wallet`);
      }
      console.log('✅ Keypair regenerated successfully');
    }

    // Create shared secret and decrypt
    const dappKeyPair = KeypairUtils.convertToX25519(keypair);
    const sharedSecret = EncryptionUtils.createSharedSecret(walletPublicKey, dappKeyPair.secretKey);
    const decryptedData = EncryptionUtils.decryptPayload(data, nonce, sharedSecret);

    console.log('🔍 Decrypted data from', this.config.type, ':', decryptedData);
    console.log('🔍 Decrypted data structure:', {
      hasPublicKey: !!decryptedData.public_key,
      hasSession: !!decryptedData.session,
      publicKey: decryptedData.public_key,
      session: decryptedData.session ? decryptedData.session.substring(0, 20) + '...' : null
    });

    // Create session
    const session: WalletSession = {
      publicKey: decryptedData.public_key,
      sessionToken: decryptedData.session,
      connectedAt: Date.now(),
      walletType: this.config.type
    };

    await this.saveSessionAndComplete(session);
  }

  /**
   * Handle direct wallet response (no encryption)
   */
  private async handleDirectWalletResponse(params: URLSearchParams): Promise<void> {
    console.log('📝 Handling direct wallet response');
    
    // Try to extract public key and session directly from parameters
    const publicKey = params.get('public_key') || 
                     params.get('address') || 
                     params.get('wallet_address');
    
    const sessionToken = params.get('session') || 
                        params.get('session_token') || 
                        params.get('auth_token') ||
                        'direct_session_' + Date.now(); // Fallback session token

    if (!publicKey) {
      throw new Error('No public key found in wallet response');
    }

    console.log('🔍 Direct response data:', { publicKey, sessionToken });

    // Create session
    const session: WalletSession = {
      publicKey,
      sessionToken,
      connectedAt: Date.now(),
      walletType: this.config.type
    };

    await this.saveSessionAndComplete(session);
  }

  /**
   * Save session and complete connection
   */
  private async saveSessionAndComplete(session: WalletSession): Promise<void> {
    console.log('💾 Saving session:', session);
    
    // Save session
    const success = await this.sessionHook.saveSessionWithAuth(session);
    
    if (success) {
      console.log('✅ Session saved successfully, updating connection state');
      this.setConnectionState({
        state: WalletConnectionState.CONNECTED,
        isConnected: true,
        isCheckingConnection: false,
        error: null
      });
      
      // Clear keypair after successful connection
      console.log('🗑️ Clearing keypair after successful connection');
      this.clearKeypair();
      console.log('✅ Wallet connection successful');
    } else {
      throw new Error('Failed to store wallet data');
    }
  }

  /**
   * Set connection state
   */
  protected setConnectionState(state: Partial<IWalletConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...state };
  }

  /**
   * Get current connection state
   */
  getConnectionState(): IWalletConnectionState {
    return this.connectionState;
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    try {
      this.sessionHook.clearSession();
      this.clearKeypair();
      this.setConnectionState({
        state: WalletConnectionState.DISCONNECTED,
        isConnected: false,
        isConnecting: false,
        isCheckingConnection: false,
        error: null
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw new Error('Failed to disconnect wallet');
    }
  }
}
