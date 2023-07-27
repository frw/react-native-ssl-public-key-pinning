
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNSslPublicKeyPinningSpec.h"

@interface SslPublicKeyPinning : NSObject <NativeSslPublicKeyPinningSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface SslPublicKeyPinning : RCTEventEmitter <RCTBridgeModule>
#endif

@end
