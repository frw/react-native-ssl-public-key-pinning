#import "SslPublicKeyPinning.h"

#import "TrustKit/TrustKit.h"

#import <React/RCTHTTPRequestHandler.h>

static NSString *ErrorDomain = @"SslPublicKeyPinningErrorDomain";

static NSString *kIncludeSubdomains = @"includeSubdomains";
static NSString *kPublicKeyHashes = @"publicKeyHashes";

static TrustKit *trustKitInstance = nil;

@implementation SslPublicKeyPinning
RCT_EXPORT_MODULE()

- (void) initializeTrustKit:(NSDictionary *)options {
    NSMutableDictionary *pinnedDomains = [NSMutableDictionary dictionary];
    
    NSArray *keys = [options allKeys];
    for (NSString *domain in keys) {
        NSDictionary *domainOptions = [options valueForKey:domain];
        
        [pinnedDomains setObject:@{
            kTSKIncludeSubdomains: @([[domainOptions objectForKey:kIncludeSubdomains] boolValue]),
            kTSKPublicKeyHashes: [domainOptions valueForKey:kPublicKeyHashes],
            kTSKDisableDefaultReportUri: @YES,
        } forKey:domain];
    }
    
    trustKitInstance = [[TrustKit alloc] initWithConfiguration:@{ kTSKPinnedDomains: pinnedDomains }];
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
        reject(exception.name, exception.reason,
               [NSError errorWithDomain: ErrorDomain
                                   code: -2
                               userInfo: exception.userInfo]);
    }
}

RCT_REMAP_METHOD(disable,
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    trustKitInstance = nil;
    resolve(nil);
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

@implementation RCTHTTPRequestHandler (SslPublicKeyPinning)

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge
 completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential *credential))completionHandler
{
    // Pass the authentication challenge to the validator; if the validation fails, the connection will be blocked
    if (trustKitInstance == nil
        || ![[trustKitInstance pinningValidator] handleChallenge:challenge completionHandler:completionHandler])
    {
        // TrustKit did not handle this challenge: perhaps it was not for server trust
        // or the domain was not pinned. Fall back to the default behavior
        completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
    }
}

@end
