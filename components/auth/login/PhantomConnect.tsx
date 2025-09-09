import React, { useEffect } from 'react';
import { StyleSheet, Alert, TouchableOpacity, View, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { usePhantomConnection } from '@/src/hooks/wallet';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface PhantomConnectProps {
  disabled?: boolean;
  onLoginSuccess?: () => void;
}

const PhantomConnect: React.FC<PhantomConnectProps> = ({
  disabled = false,
  onLoginSuccess,
}) => {
  const router = useRouter();
  const { connect, connectionState, getSession } = usePhantomConnection();

  // Handle connection state changes
  useEffect(() => {
    if (connectionState.error) {
      Alert.alert(
        'Connection Error 1',
        connectionState.error,
        [{ text: 'OK' }]
      );
    }

    if (connectionState.isConnected) {
      // Check if session was saved successfully
      const session = getSession();
      if (session) {
        console.log('✅ Session saved successfully, redirecting...');
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          router.replace('/driver/home');
        }
      } else {
        Alert.alert(
          'Connection Error 2',
          'Failed to save session data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [connectionState, onLoginSuccess, router, getSession]);

  return (
    <TouchableOpacity
      style={[
        styles.circularButton,
        { opacity: disabled || connectionState.isConnecting || connectionState.isCheckingConnection ? 0.7 : 1 }
      ]}
      activeOpacity={0.8}
      disabled={disabled || connectionState.isConnecting || connectionState.isCheckingConnection}
      onPress={connect}
    >
      {connectionState.isConnecting || connectionState.isCheckingConnection ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Image
          source={require('@/assets/images/icons/phantom/phantom-wallet-icon.png')}
          style={styles.phantomIcon}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circularButton: {
    width: wp(20),
    height: wp(20), 
    borderRadius: wp(10),
    backgroundColor: '#202020',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 0.2,
    shadowRadius: wp(2),
    elevation: 5,
    marginVertical: hp(1.2),
  },
  phantomIcon: {
    width: wp(12.5), 
    height: wp(12.5), 
  },
});

export default PhantomConnect;