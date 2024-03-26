#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNSslPublicKeyPinningSpec/RNSslPublicKeyPinningSpec.h>

@interface SslPublicKeyPinning : RCTEventEmitter <NativeSslPublicKeyPinningSpec>
#else
#import <React/RCTBridgeModule.h>

@interface SslPublicKeyPinning : RCTEventEmitter <RCTBridgeModule>
#endif

@end
