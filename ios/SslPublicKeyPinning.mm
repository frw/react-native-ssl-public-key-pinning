#import "SslPublicKeyPinning.h"

@implementation SslPublicKeyPinning
RCT_EXPORT_MODULE()

RCT_REMAP_METHOD(initialize,
                 options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    resolve();
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeSslPublicKeyPinningSpecJSI>(params);
}
#endif

@end
