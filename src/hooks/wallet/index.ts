// Generic wallet connection hook
export { useWalletConnection } from './useWalletConnection';

// Re-export wallet types and enums
export { WalletType, WalletConnectionState, WalletDeepLinkScheme, WalletEncryptionType } from '@/src/enums/wallet.enums';
export type { 
  WalletSession, 
  WalletConnectionState as IWalletConnectionState, 
  WalletAuthData,
  WalletAdapterConfig 
} from '@/src/types/wallet/wallet.types';