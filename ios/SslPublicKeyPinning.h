
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNSslPublicKeyPinningSpec.h"

@interface SslPublicKeyPinning : NSObject <NativeSslPublicKeyPinningSpec>
#else
#import <React/RCTBridgeModule.h>

@interface SslPublicKeyPinning : NSObject <RCTBridgeModule>
#endif

@end
