declare module '@solana-mobile/mobile-wallet-adapter-protocol-web3js' {
  import { Cluster, PublicKey, Transaction } from '@solana/web3.js';

  export function transact<T>(
    callback: (wallet: any) => Promise<T>
  ): Promise<T>;

  export interface AuthorizeAPI {
    authorize(params: {
      cluster: Cluster;
      identity: {
        name: string;
        uri: string;
        icon?: string;
      };
    }): Promise<{
      accounts: Array<{
        address: string;
        label?: string;
      }>;
      auth_token: string;
    }>;

    reauthorize(params: {
      auth_token: string;
      identity: {
        name: string;
        uri: string;
        icon?: string;
      };
    }): Promise<{
      accounts: Array<{
        address: string;
        label?: string;
      }>;
      auth_token: string;
    }>;

    deauthorize(params: {
      auth_token: string;
    }): Promise<void>;
  }
}

declare module '@solana-mobile/mobile-wallet-adapter-protocol' {
  export * from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
}
