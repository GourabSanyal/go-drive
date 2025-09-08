import React, { useCallback, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey, Cluster } from '@solana/web3.js';
import { Colors } from '@/theme/colors';
import { useRouter } from 'expo-router';

import SolanaIcon from '@/assets/images/icons/solana.svg';

interface LoginWithWalletProps {
  disabled?: boolean;
  onSuccess?: (walletData: {
    address: string;
    publicKey: string;
    authToken: string;
    username?: string;
    profilePicUrl?: string;
    attachmentData?: any;
  }) => void;
}

const LoginWithWallet: React.FC<LoginWithWalletProps> = ({
  disabled = false,
  onSuccess,
}) => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const getSolanaCluster = (): Cluster => {
    // For now, using devnet - you can make this configurable later
    return 'devnet' as Cluster;
  };

  const handleWalletConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      const cluster = getSolanaCluster();
      console.log(`Connecting to Solana ${cluster}`);

      const result = await transact(async wallet => {
        const authorizationResult = await wallet.authorize({
          cluster,
          identity: {
            name: 'Go Drive',
            uri: 'drive://', // scheme from your app.config.ts
            icon: './assets/images/icon.png',
          },
        });

        return {
          publicKey: authorizationResult.accounts[0].address,
          authToken: authorizationResult.auth_token,
          label: authorizationResult.accounts[0].label,
        };
      });

      if (result && result.publicKey) {
        try {
          // Address sent from the wallet is base64 encoded,
          // convert it to base58
          const base64Address = result.publicKey;
          // Decode from base64 to get the raw bytes
          const addressBytes = Buffer.from(base64Address, 'base64');

          // Create pubkey from raw bytes
          const publicKey = new PublicKey(addressBytes);
          const address = publicKey.toBase58();
          console.log('Connected wallet public key:', address);

          // Create wallet data object
          const walletData = {
            address: address,
            publicKey: address,
            authToken: result.authToken,
            username: result.label || address.substring(0, 6),
            profilePicUrl: undefined,
            attachmentData: {},
          };

          // Call onSuccess callback if provided
          if (onSuccess) {
            onSuccess(walletData);
          }

          // For now, just log the success - you can add navigation later
          console.log('Wallet connected successfully:', walletData);

        } catch (error) {
          console.error('Error processing wallet address:', error);
          Alert.alert(
            'Address Error',
            'Failed to process wallet address. Please try again.',
            [{ text: 'OK' }],
          );
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      Alert.alert(
        'Connection Error',
        'Failed to connect to your Solana wallet. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsConnecting(false);
    }
  }, [onSuccess]);

  return (
    <TouchableOpacity
      style={[
        styles.walletButton,
        { opacity: disabled || isConnecting ? 0.7 : 1 },
      ]}
      activeOpacity={0.8}
      disabled={disabled || isConnecting}
      onPress={handleWalletConnect}>
      {isConnecting ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.buttonContent}>
          <SolanaIcon width={24} height={24} style={styles.icon} />
          <Text style={styles.buttonText}>Solana Wallet</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  walletButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 10,
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginWithWallet;
