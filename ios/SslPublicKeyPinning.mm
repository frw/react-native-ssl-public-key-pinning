#import "SslPublicKeyPinning.h"
#import "TrustKit/TrustKit.h"

static NSString *ErrorDomain = @"SslPublicKeyPinningErrorDomain";

static NSString *kIncludeSubdomains = @"includeSubdomains";
static NSString *kPublicKeyHashes = @"publicKeyHashes";

static BOOL isTrustKitInitialized = NO;

@implementation SslPublicKeyPinning
RCT_EXPORT_MODULE()

- (void) initializeTrustKit:(NSDictionary *)options {
    NSMutableDictionary *trustKitConfig = [NSMutableDictionary dictionary];
    
    NSMutableDictionary *pinnedDomains = [NSMutableDictionary dictionary];
    
    NSArray *keys = [options allKeys];
    for (NSString *domain in keys) {
        NSDictionary *domainOptions = [options valueForKey:domain];
        
        NSMutableDictionary *domainConfig = [NSMutableDictionary dictionary];
        
        BOOL includeSubdomains = [[domainOptions objectForKey:kIncludeSubdomains] boolValue];
        [domainConfig setObject:@(includeSubdomains) forKey:kTSKIncludeSubdomains];
        
        if ([[domainOptions valueForKey:kPublicKeyHashes] isKindOfClass:[NSArray class]]) {
            [domainConfig setObject:[domainOptions valueForKey:kPublicKeyHashes] forKey:kTSKPublicKeyHashes];
        }
        
        [domainConfig setObject:@YES forKey:kTSKDisableDefaultReportUri];
        
        [pinnedDomains setObject:domainConfig forKey:domain];
    }
    
    [trustKitConfig setObject:pinnedDomains forKey:kTSKPinnedDomains];
    
    if (!isTrustKitInitialized) {
        [trustKitConfig setObject:@YES forKey:kTSKSwizzleNetworkDelegates];
        [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
        isTrustKitInitialized = YES;
    } else {
        (void)[[TrustKit sharedInstance] initWithConfiguration:trustKitConfig];
    }
}

RCT_REMAP_METHOD(initialize,
                 options:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        [self initializeTrustKit:options];
        resolve(nil);
    }
    @catch (NSException *exception)
    {
        NSMutableDictionary * info = [NSMutableDictionary dictionary];
        [info setValue:exception.name forKey:@"ExceptionName"];
        [info setValue:exception.reason forKey:@"ExceptionReason"];
        [info setValue:exception.callStackReturnAddresses forKey:@"ExceptionCallStackReturnAddresses"];
        [info setValue:exception.callStackSymbols forKey:@"ExceptionCallStackSymbols"];
        [info setValue:exception.userInfo forKey:@"ExceptionUserInfo"];
        
        reject(@"initialization_failed", @"Failed to initialize SslPublicKeyPinning",
               [NSError errorWithDomain: ErrorDomain
                                   code: -2
                               userInfo: info]);
    }
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
