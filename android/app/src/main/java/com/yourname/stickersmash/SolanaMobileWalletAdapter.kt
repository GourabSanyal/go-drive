package com.yourname.stickersmash

import com.facebook.react.bridge.*
import com.solana.mobilewalletadapter.clientlib.protocol.MobileWalletAdapter
import com.solana.mobilewalletadapter.clientlib.protocol.MobileWalletAdapterClient
import com.solana.mobilewalletadapter.clientlib.scenario.LocalAssociationIntentCreator
import com.solana.mobilewalletadapter.clientlib.scenario.LocalAssociationScenario
import com.solana.mobilewalletadapter.common.ProtocolContract
import com.solana.web3.AuthorizationResult
import com.solana.web3.RpcCluster
import kotlinx.coroutines.*
import kotlin.coroutines.CoroutineContext

class SolanaMobileWalletAdapter(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), CoroutineScope {

    override val coroutineContext: CoroutineContext = Dispatchers.Main + SupervisorJob()

    override fun getName(): String {
        return "SolanaMobileWalletAdapter"
    }

    @ReactMethod
    fun authorize(
        identityName: String,
        identityUri: String,
        iconUri: String,
        cluster: String,
        promise: Promise
    ) {
        launch {
            try {
                val currentActivity = currentActivity ?: throw IllegalStateException("Current activity is null")
                
                val rpcCluster = when (cluster) {
                    "devnet" -> RpcCluster.Devnet
                    "testnet" -> RpcCluster.Testnet
                    "mainnet-beta" -> RpcCluster.MainnetBeta
                    else -> RpcCluster.Devnet
                }
                
                val localAssociationScenario = LocalAssociationScenario(MobileWalletAdapterClient())
                
                val authResult = localAssociationScenario.startActivityForResult(
                    currentActivity,
                    LocalAssociationIntentCreator.createAuthorizeIntent(
                        identityName = identityName,
                        identityUri = identityUri,
                        iconUri = iconUri,
                        rpcCluster = rpcCluster
                    ),
                    ProtocolContract.WALLET_ADAPTER_AUTHORIZE_REQUEST_CODE
                )
                
                if (authResult is AuthorizationResult.Success) {
                    val result = Arguments.createMap().apply {
                        putString("auth_token", authResult.authToken)
                        putString("public_key", authResult.publicKey.toBase58())
                        putString("account_label", authResult.accountLabel ?: "")
                    }
                    promise.resolve(result)
                } else {
                    promise.reject("AUTH_ERROR", "Authorization failed")
                }
            } catch (e: Exception) {
                promise.reject("AUTH_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun reauthorize(
        authToken: String,
        identityName: String,
        identityUri: String,
        iconUri: String,
        promise: Promise
    ) {
        launch {
            try {
                val currentActivity = currentActivity ?: throw IllegalStateException("Current activity is null")
                
                val localAssociationScenario = LocalAssociationScenario(MobileWalletAdapterClient())
                
                val authResult = localAssociationScenario.startActivityForResult(
                    currentActivity,
                    LocalAssociationIntentCreator.createReauthorizeIntent(
                        authToken = authToken,
                        identityName = identityName,
                        identityUri = identityUri,
                        iconUri = iconUri
                    ),
                    ProtocolContract.WALLET_ADAPTER_REAUTHORIZE_REQUEST_CODE
                )
                
                if (authResult is AuthorizationResult.Success) {
                    val result = Arguments.createMap().apply {
                        putString("auth_token", authResult.authToken)
                        putString("public_key", authResult.publicKey.toBase58())
                        putString("account_label", authResult.accountLabel ?: "")
                    }
                    promise.resolve(result)
                } else {
                    promise.reject("AUTH_ERROR", "Reauthorization failed")
                }
            } catch (e: Exception) {
                promise.reject("AUTH_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun deauthorize(authToken: String, promise: Promise) {
        launch {
            try {
                val currentActivity = currentActivity ?: throw IllegalStateException("Current activity is null")
                
                val localAssociationScenario = LocalAssociationScenario(MobileWalletAdapterClient())
                
                val result = localAssociationScenario.startActivityForResult(
                    currentActivity,
                    LocalAssociationIntentCreator.createDeauthorizeIntent(authToken),
                    ProtocolContract.WALLET_ADAPTER_DEAUTHORIZE_REQUEST_CODE
                )
                
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("DEAUTH_ERROR", e.message, e)
            }
        }
    }
}
