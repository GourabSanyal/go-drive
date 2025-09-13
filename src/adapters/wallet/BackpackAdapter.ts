import {
  WalletType,
  WalletDeepLinkScheme,
  WalletEncryptionType,
} from "@/src/enums/wallet.enums";
import { WalletAdapterConfig } from "@/src/types/wallet/wallet.types";
import { BaseWalletAdapter } from "./BaseWalletAdapter";
import { WalletUtils } from "@/src/utils/wallet/wallet.utils";
import { KeypairUtils } from "@/src/utils/wallet/keypair.utils";

export class BackpackAdapter extends BaseWalletAdapter {
  constructor(
    sessionHook: ReturnType<typeof import("@/src/hooks/session").useSession>
  ) {
    const config: WalletAdapterConfig = {
      type: WalletType.BACKPACK,
      deepLink: {
        scheme: WalletDeepLinkScheme.BACKPACK,
        connectUrl: "https://backpack.app/ul/v1/connect",
        redirectLink: "drive://",
        appUrl: "https://go-drive.app",
        cluster: "devnet",
      },
      encryption: {
        type: WalletEncryptionType.NACL_BOX,
        requiresKeypair: true,
      },
      storageKey: WalletUtils.getKeypairStorageKey(WalletType.BACKPACK),
    };

    super(config, sessionHook);
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
        throw new Error("Backpack wallet is not installed");
      }

      this.generateAndStoreKeypair();
      const keypair = this.getStoredKeypair();

      if (!keypair) {
        throw new Error("Failed to generate keypair");
      }

      // Convert to x25519 for encryption
      const dappKeyPair = KeypairUtils.convertToX25519(keypair);

      const connectUrl =
        `${this.config.deepLink.connectUrl}?` +
        `dapp_encryption_public_key=${encodeURIComponent(
          dappKeyPair.publicKey
        )}&` +
        `cluster=${this.config.deepLink.cluster}&` +
        `app_url=${encodeURIComponent(this.config.deepLink.appUrl)}&` +
        `redirect_link=${encodeURIComponent(
          this.config.deepLink.redirectLink
        )}`;

      // Opens Backpack
      await WalletUtils.openWalletApp(connectUrl);
    } catch (error) {
      this.setConnectionState({
        state: "error" as any,
        isConnecting: false,
        error:
          error instanceof Error
            ? `Backpack: ${error.message}`
            : "Failed to connect to Backpack",
      });
    }
  }

  async handleConnectionResponse(url: string): Promise<void> {
    await this.handleEncryptedResponse(url);
  }
}
