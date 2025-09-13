import { WalletType, WalletConnectionState as WalletConnectionStateEnum, WalletEncryptionType } from '@/src/enums/wallet.enums';

export interface WalletSession {
  publicKey: string;
  sessionToken: string;
  connectedAt: number;
  walletType: WalletType;
}

export interface WalletConnectionState {
  state: WalletConnectionStateEnum;
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

export interface WalletKeypairData {
  publicKey: string;
  secretKey: string;
}

export interface WalletDeepLinkConfig {
  scheme: string;
  connectUrl: string;
  redirectLink: string;
  appUrl: string;
  cluster: string;
}

export interface WalletEncryptionConfig {
  type: WalletEncryptionType;
  requiresKeypair: boolean;
}

export interface WalletAdapterConfig {
  type: WalletType;
  deepLink: WalletDeepLinkConfig;
  encryption: WalletEncryptionConfig;
  storageKey: string;
}

export interface WalletConnectionResponse {
  publicKey: string;
  sessionToken: string;
  error?: string;
}

export interface WalletAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  checkInstalled(): Promise<boolean>;
  getConnectionState(): WalletConnectionState;
}
