import { Alert, Clipboard, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import QRCode from 'react-native-qrcode-svg'; 

export default function TabTwoScreen() {

  const DriverPublicKey = '7DfyijuUTX5LNtdMiKePdHPgw1sGd16wJ7oY813rwxb1' 

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(DriverPublicKey);
    Alert.alert('Copied!', 'Driver public key copied to clipboard.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan & Pay</Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={DriverPublicKey}
          size={200}
          backgroundColor="white"
          color="black"
        />
      </View>

      <View style={styles.keyContainer}>
        <Text selectable style={styles.keyText}>
          {DriverPublicKey}
        </Text>
        <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>Copy</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// export default function TabTwoScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Tab Two</Text>
//       <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
//       <EditScreenInfo path="app/(tabs)/two.tsx" />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  qrContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,      // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginBottom: 20,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 12,
    color: '#333',
    marginRight: 10,
  },
  copyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
  },
});
