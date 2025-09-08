// Add polyfills for Solana Mobile Wallet Adapter
import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;

// Import the expo router entry
import "expo-router/entry";
