import { Linking } from "react-native";
import { useSession } from "@/src/hooks/session";
import { WalletConnectionState } from "@/src/types/wallet/wallet.types";
import { KeypairUtils } from "@/src/utils/wallet/keypair.utils";
import { EncryptionUtils } from "@/src/utils/wallet/encryption.utils";

export class SolflareAdapter {
  private connectionState: WalletConnectionState;
  private sessionHook: ReturnType<typeof useSession>;
  private lastProcessedUrl: string | null = null;
  private lastProcessedTime: number = 0;

  constructor(sessionHook: ReturnType<typeof useSession>) {
    this.sessionHook = sessionHook;
    this.connectionState = {
      state: "disconnected" as any,
      isConnecting: false,
      isCheckingConnection: false,
      error: null,
      isConnected: false,
    };
  }

  async connect(): Promise<void> {
    try {
      this.setConnectionState({
        state: "connecting" as any,
        isConnecting: true,
        error: null,
      });

      const isInstalled = await this.checkInstalled();
      if (!isInstalled) {
        throw new Error("Solflare wallet is not installed");
      }

      this.generateAndStoreKeypair();

      const keypair = this.getStoredKeypair();
      if (!keypair) {
        throw new Error("Failed to generate keypair");
      }

      const dappKeyPair = KeypairUtils.convertToX25519(keypair);

      const connectUrl =
        `https://solflare.com/ul/v1/connect?` +
        `dapp_encryption_public_key=${encodeURIComponent(
          dappKeyPair.publicKey
        )}&` +
        `cluster=devnet&` +
        `app_url=${encodeURIComponent("https://go-drive.app")}&` +
        `redirect_link=${encodeURIComponent("drive://")}`;

      await Linking.openURL(connectUrl);
    } catch (error) {
      this.setConnectionState({
        state: "error" as any,
        isConnecting: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to Solflare",
      });
    }
  }

  async handleConnectionResponse(url: string): Promise<void> {
    try {
      const currentTime = Date.now();
      if (
        this.lastProcessedUrl === url &&
        currentTime - this.lastProcessedTime < 5000
      ) {
        return;
      }

      if (this.connectionState.isConnected) {
        return;
      }

      if (this.connectionState.isCheckingConnection) {
        return;
      }

      this.lastProcessedUrl = url;
      this.lastProcessedTime = currentTime;

      this.setConnectionState({
        state: "checking_connection" as any,
        isCheckingConnection: true,
        error: null,
      });

      let cleanUrl = url;
      if (url.includes("#")) {
        cleanUrl = url.split("#")[0];
      }

      const urlObj = new URL(cleanUrl);
      const params = urlObj.searchParams;

      const walletPublicKey =
        params.get("solflare_encryption_public_key") ||
        params.get("encryption_public_key");
      const nonce = params.get("nonce");
      const data = params.get("data");

      if (walletPublicKey && nonce && data) {
        await this.handleEncryptedWalletResponse(walletPublicKey, nonce, data);
      } else {
        await this.handleDirectWalletResponse(params);
      }
    } catch (error) {
      this.setConnectionState({
        state: "error" as any,
        isConnected: false,
        isCheckingConnection: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect with Solflare",
      });
    }
  }

  private async handleEncryptedWalletResponse(
    walletPublicKey: string,
    nonce: string,
    data: string
  ): Promise<void> {
    let keypair = this.getStoredKeypair();
    if (!keypair) {
      this.generateAndStoreKeypair();
      keypair = this.getStoredKeypair();

      if (!keypair) {
        throw new Error(
          "No keypair available for decryption and regeneration failed"
        );
      }
    }

    const dappKeyPair = KeypairUtils.convertToX25519(keypair);
    const sharedSecret = EncryptionUtils.createSharedSecret(
      walletPublicKey,
      dappKeyPair.secretKey
    );
    const decryptedData = EncryptionUtils.decryptPayload(
      data,
      nonce,
      sharedSecret
    );

    const session = {
      publicKey: decryptedData.public_key,
      sessionToken: decryptedData.session,
      connectedAt: Date.now(),
      walletType: "solflare",
    };

    await this.saveSessionAndComplete(session);
  }

  private async handleDirectWalletResponse(
    params: URLSearchParams
  ): Promise<void> {
    const publicKey =
      params.get("public_key") ||
      params.get("address") ||
      params.get("wallet_address");

    const sessionToken =
      params.get("session") ||
      params.get("session_token") ||
      params.get("auth_token") ||
      "solflare_session_" + Date.now();

    if (!publicKey) {
      throw new Error("No public key found in Solflare response");
    }

    const session = {
      publicKey,
      sessionToken,
      connectedAt: Date.now(),
      walletType: "solflare",
    };

    await this.saveSessionAndComplete(session);
  }

  private async saveSessionAndComplete(session: any): Promise<void> {
    const success = await this.sessionHook.saveSessionWithAuth(session);

    if (success) {
      this.setConnectionState({
        state: "connected" as any,
        isConnected: true,
        isCheckingConnection: false,
        error: null,
      });

      this.clearKeypair();
    } else {
      throw new Error("Failed to store Solflare wallet data");
    }
  }

  async checkInstalled(): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL("solflare://");
      return canOpen;
    } catch (error) {
      return false;
    }
  }

  private generateAndStoreKeypair(): void {
    const keypair = KeypairUtils.generateKeypair();
    KeypairUtils.storeKeypair(keypair, "solflare_keypair");
  }

  private getStoredKeypair() {
    return KeypairUtils.getStoredKeypair("solflare_keypair");
  }

  private clearKeypair(): void {
    KeypairUtils.clearKeypair("solflare_keypair");
  }

  private setConnectionState(state: Partial<WalletConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...state };
  }

  getConnectionState(): WalletConnectionState {
    return this.connectionState;
  }

  async disconnect(): Promise<void> {
    try {
      this.sessionHook.clearSession();
      this.clearKeypair();
      this.setConnectionState({
        state: "disconnected" as any,
        isConnected: false,
        isConnecting: false,
        isCheckingConnection: false,
        error: null,
      });
    } catch (error) {
      throw new Error("Failed to disconnect Solflare wallet");
    }
  }
}
