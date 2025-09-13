import { Linking } from "react-native";
import { WalletType, WalletDeepLinkScheme } from "@/src/enums/wallet.enums";

export class WalletUtils {
  static async checkWalletInstalled(
    scheme: WalletDeepLinkScheme
  ): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      return canOpen;
    } catch (error) {
      return false;
    }
  }

  static getWalletScheme(walletType: WalletType): WalletDeepLinkScheme {
    switch (walletType) {
      case WalletType.PHANTOM:
        return WalletDeepLinkScheme.PHANTOM;
      case WalletType.SOLFLARE:
        return WalletDeepLinkScheme.SOLFLARE;
      case WalletType.BACKPACK:
        return WalletDeepLinkScheme.BACKPACK;
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }

  static getKeypairStorageKey(walletType: WalletType): string {
    return `${walletType}_keypair`;
  }

  static parseDeepLinkUrl(url: string): URLSearchParams {
    const urlParts = url.split("?");
    const queryString = urlParts[1] || "";
    return new URLSearchParams(queryString);
  }

  static validateConnectionResponse(params: URLSearchParams): {
    isValid: boolean;
    error?: string;
  } {
    if (params.has("errorCode")) {
      const errorMessage = params.get("errorMessage") || "Unknown error";
      return {
        isValid: false,
        error: `Wallet connection failed: ${errorMessage}`,
      };
    }

    return { isValid: true };
  }

  static extractConnectionData(
    params: URLSearchParams,
    walletType: string
  ): {
    walletPublicKey: string | null;
    nonce: string | null;
    data: string | null;
  } {
    let walletPublicKey: string | null = null;

    if (walletType === "phantom") {
      walletPublicKey = params.get("phantom_encryption_public_key");
    } else if (walletType === "solflare") {
      walletPublicKey = params.get("solflare_encryption_public_key");

      if (!walletPublicKey) {
        walletPublicKey =
          params.get("encryption_public_key") ||
          params.get("public_key") ||
          params.get("wallet_public_key");
      }
    } else if (walletType === "backpack") {
      walletPublicKey =
        params.get("wallet_encryption_public_key") ||
        params.get("backpack_encryption_public_key") ||
        params.get("encryption_public_key") ||
        params.get("public_key");
    }

    return {
      walletPublicKey,
      nonce: params.get("nonce"),
      data: params.get("data"),
    };
  }

  static async openWalletApp(url: string): Promise<void> {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        throw new Error("Cannot open wallet app");
      }
      await Linking.openURL(url);
    } catch (error) {
      throw new Error("Failed to open wallet app");
    }
  }

  static isValidPublicKey(publicKey: string): boolean {
    try {
      if (!publicKey || typeof publicKey !== "string") {
        return false;
      }

      const base58Regex =
        /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$/;
      return base58Regex.test(publicKey);
    } catch {
      return false;
    }
  }

  static isValidSessionToken(token: string): boolean {
    try {
      if (!token || typeof token !== "string") {
        return false;
      }

      return token.trim().length > 0;
    } catch {
      return false;
    }
  }

  static generateSessionToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `session_${timestamp}_${random}`;
  }

  static cleanUrl(url: string): string {
    try {
      let cleanUrl = url.split("#")[0];

      if (
        !cleanUrl.startsWith("http://") &&
        !cleanUrl.startsWith("https://") &&
        !cleanUrl.startsWith("drive://")
      ) {
        cleanUrl = "https://" + cleanUrl;
      }

      return cleanUrl;
    } catch {
      return url;
    }
  }
}
