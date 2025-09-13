export class DebugUtils {
  static logUrlParameters(url: string): void {
    console.log('🔗 Full URL:', url);
    
    try {
      const urlParts = url.split('?');
      if (urlParts.length > 1) {
        const queryString = urlParts[1];
        const params = new URLSearchParams(queryString);
        
        console.log('📋 All URL parameters:');
        for (const [key, value] of params.entries()) {
          console.log(`  ${key}: ${value}`);
        }
      } else {
        console.log('❌ No query parameters found in URL');
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
    }
  }

  static testParameterExtraction(params: URLSearchParams): {
    publicKey: string | null;
    sessionToken: string | null;
    encryptionData: {
      walletPublicKey: string | null;
      nonce: string | null;
      data: string | null;
    };
  } {
    const publicKey = params.get('public_key') || 
                     params.get('address') || 
                     params.get('wallet_address') ||
                     params.get('account') ||
                     params.get('wallet_account');

    const sessionToken = params.get('session') || 
                        params.get('session_token') || 
                        params.get('auth_token') ||
                        params.get('token') ||
                        params.get('access_token');

    const encryptionData = {
      walletPublicKey: params.get('phantom_encryption_public_key') ||
                      params.get('solflare_encryption_public_key') ||
                      params.get('backpack_encryption_public_key') ||
                      params.get('encryption_public_key') ||
                      params.get('wallet_encryption_public_key'),
      nonce: params.get('nonce'),
      data: params.get('data')
    };

    return {
      publicKey,
      sessionToken,
      encryptionData
    };
  }

  static analyzeWalletResponse(url: string): void {
    console.log('🔍 Analyzing wallet response...');
    this.logUrlParameters(url);
    
    try {
      const urlParts = url.split('?');
      if (urlParts.length > 1) {
        const params = new URLSearchParams(urlParts[1]);
        const analysis = this.testParameterExtraction(params);
        
        console.log('📊 Parameter analysis:');
        console.log('  Public Key:', analysis.publicKey);
        console.log('  Session Token:', analysis.sessionToken);
        console.log('  Encryption Data:', analysis.encryptionData);
        
        if (analysis.encryptionData.walletPublicKey && analysis.encryptionData.nonce && analysis.encryptionData.data) {
          console.log('🔐 Response Type: Encrypted');
        } else if (analysis.publicKey) {
          console.log('📝 Response Type: Direct Parameters');
        } else {
          console.log('❓ Response Type: Unknown/Incomplete');
        }
      }
    } catch (error) {
      console.error('Error analyzing wallet response:', error);
    }
  }
}
