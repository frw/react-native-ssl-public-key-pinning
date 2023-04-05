import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-ssl-public-key-pinning' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const SslPublicKeyPinning = NativeModules.SslPublicKeyPinning
  ? NativeModules.SslPublicKeyPinning
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export type DomainOptions = {
  /**
   * Whether all subdomains of the specified domain should also be pinned.
   * @default false
   */
  includeSubdomains?: boolean;
  /**
   * An array of SSL pins, where each pin is the base64-encoded SHA-256 hash of a certificate's Subject Public Key Info.
   * Note that at least two pins are needed per domain on iOS.
   */
  publicKeyHashes: string[];
};

export type PinningOptions = Record<string, DomainOptions>;

/**
 * Checks whether the SslPublicKeyPinning NativeModule is available on the current app installation.
 * Useful if you're using Expo Go and want to avoid initializing pinning if it's not available.
 * @returns true if SslPublicKeyPinning is available
 */
export function isSslPinningAvailable(): boolean {
  return NativeModules.SslPublicKeyPinning != null;
}

/**
 * Initializes and enables SSL public key pinning for the domains and options you specify.
 * @param options Mapping from domain name to DomainOptions
 * @returns Promise that resolves once initialization is complete
 */
export function initializeSslPinning(options: PinningOptions): Promise<void> {
  return SslPublicKeyPinning.initialize(options);
}

/**
 * Disables SSL public key pinning.
 * @returns Promise that resolves once disabling is complete
 */
export function disableSslPinning(): Promise<void> {
  return SslPublicKeyPinning.disable();
}
