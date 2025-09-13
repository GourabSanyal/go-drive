export enum WalletType {
  PHANTOM = 'phantom',
  SOLFLARE = 'solflare',
  BACKPACK = 'backpack',
  OTHER = 'other'
}

export enum WalletConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CHECKING_CONNECTION = 'checking_connection',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export enum WalletDeepLinkScheme {
  PHANTOM = 'phantom://',
  SOLFLARE = 'solflare://',
  BACKPACK = 'backpack://',
  DRIVE = 'drive://'
}

export enum WalletEncryptionType {
  NACL_BOX = 'nacl_box',
  NONE = 'none'
}
