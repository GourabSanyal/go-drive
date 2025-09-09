export interface WalletSession {
  publicKey: string;
  sessionToken: string;
  connectedAt: number;
  walletType: WalletType;
}

export type WalletType = 'phantom' | 'solflare' | 'backpack' | 'other';

export interface PhantomConnectionState {
  isConnecting: boolean;
  isCheckingConnection: boolean;
  error: string | null;
  isConnected: boolean;
}

export interface WalletAuthData {
  address: string;
  publicKey: string;
  authToken: string;
  username: string;
}
