#import "SslPublicKeyPinning.h"

#import "TrustKit/TrustKit.h"

#import <React/RCTHTTPRequestHandler.h>

static NSString *ErrorDomain = @"SslPublicKeyPinningErrorDomain";

static NSString *kIncludeSubdomains = @"includeSubdomains";
static NSString *kPublicKeyHashes = @"publicKeyHashes";
static NSString *kExpirationDate = @"expirationDate";


static NSString *PinningErrorEventName = @"pinning-error";
static NSString *kServerHostname = @"serverHostname";
static NSString *kMessage = @"message";

static TrustKit *trustKitInstance = nil;

@implementation SslPublicKeyPinning {
    bool hasListeners;
}
RCT_EXPORT_MODULE()

- (NSArray<NSString *> *) supportedEvents {
    return @[PinningErrorEventName];
}

- (void) startObserving {
    hasListeners = YES;
}

- (void) stopObserving {
    hasListeners = NO;
}

- (void)emitPinningErrorEvent:(NSString *)serverHostname message:(NSString *)message {
    [self sendEventWithName:PinningErrorEventName body:@{ kServerHostname: serverHostname, kMessage: message }];
}


- (void) initializeTrustKit:(NSDictionary *)options {
    NSMutableDictionary *pinnedDomains = [NSMutableDictionary dictionary];
    
    NSArray *keys = [options allKeys];
    for (NSString *domain in keys) {
        NSDictionary *domainOptions = [options valueForKey:domain];
        NSMutableDictionary *trustkitDomainConfig = [NSMutableDictionary dictionary];
        
        [trustkitDomainConfig setObject:@([[domainOptions objectForKey:kIncludeSubdomains] boolValue]) forKey:kTSKIncludeSubdomains];
        [trustkitDomainConfig setObject:[domainOptions valueForKey:kPublicKeyHashes] forKey:kTSKPublicKeyHashes];
        
        NSString *expirationDate = [domainOptions objectForKey:kExpirationDate];
        if (expirationDate != nil) {
            [trustkitDomainConfig setObject:expirationDate forKey:kTSKExpirationDate];
        }
        
        [trustkitDomainConfig setObject:@YES forKey:kTSKDisableDefaultReportUri];
        
        [pinnedDomains setObject:trustkitDomainConfig forKey:domain];
    }
    
    trustKitInstance = [[TrustKit alloc] initWithConfiguration:@{ kTSKPinnedDomains: pinnedDomains }];
    trustKitInstance.pinningValidatorCallback = ^(TSKPinningValidatorResult *result, NSString *notedHostname, TKSDomainPinningPolicy *policy) {
      if (!self->hasListeners || result.evaluationResult != TSKTrustEvaluationFailedNoMatchingPin) {
            return;
        }
      switch (result.evaluationResult) {
          /** el cetrificate validation succesfully   */
        case TSKTrustEvaluationSuccess:
          NSLog(@"TrustKit certificate validation successful evaluated and contained at least one of the configured pins for hostname: %@", notedHostname);
        //   [self emitPinningErrorEvent:notedHostname message@"TrustKit certificate validation successful"];
          break;
          
          /** lw mfe4 wala pin bt3ml match m3 el certificate **/
        case TSKTrustEvaluationFailedNoMatchingPin:
          NSLog(@"The server trust was succesfully evaluated but did not contain any of the configured pins for hostname: %@", notedHostname);
           [self emitPinningErrorEvent:notedHostname message:@"The server trust was succesfully evaluated but did not contain any of the configured pins for hostname"];
          // Add more logging or exception handling here. i.e. Sentry, BugSnag etc
          break;
          
          /**
           To simulate the TSKTrustEvaluationFailedInvalidCertificateChain error in TrustKit, you can use a testing server with an invalid certificate chain. One way to achieve this is by creating a self-signed certificate and not adding its root certificate to the device's trust store.
           */
        case TSKTrustEvaluationFailedInvalidCertificateChain:
          NSLog(@"The server trust's evaluation failed: the server's certificate chain is not trusted for hostname: %@", notedHostname);
          [self emitPinningErrorEvent:notedHostname message:@"The server trust's evaluation failed: the server's certificate chain is not trusted for hostname"];
          // Add more logging or exception handling here. i.e. Sentry, BugSnag etc
          break;
          
          
        case TSKTrustEvaluationErrorInvalidParameters:
          NSLog(@"The server trust could not be evaluated due to invalid parameters: %@", notedHostname);
          [self emitPinningErrorEvent:notedHostname message:@"The server trust could not be evaluated due to invalid parameters"];
          // Add more logging or exception handling here. i.e. Sentry, BugSnag etc
          break;
          
        case TSKTrustEvaluationErrorCouldNotGenerateSpkiHash:
          NSLog(@"The server trust could not be evaluated due to an error when trying to generate the certificate's subject public key info hash.On iOS 9 or below, this could be caused by a Keychain failure when trying to extract the certificate's public key bytes for hostname: %@", notedHostname);
          [self emitPinningErrorEvent:notedHostname message:@"The server trust could not be evaluated due to an error when trying to generate the certificate's subject public key info hash"];
          // Add more logging or exception handling here. i.e. Sentry, BugSnag etc
          break;
          
        default:
          NSLog(@"TrustKit certificate validation result unknown for hostname: %@", notedHostname);
           [self emitPinningErrorEvent:notedHostname message:@"TrustKit certificate validation result unknown for hostname:"];
          // Add more logging or exception handling here. i.e. Sentry, BugSnag etc
          break;
      }
    };
  }


RCT_EXPORT_METHOD(initialize:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
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

RCT_EXPORT_METHOD(disable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
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
