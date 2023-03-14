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
  includeSubdomains?: boolean;
  publicKeyHashes: string[];
};

export type PinningOptions = Record<string, DomainOptions>;

export function isSslPinningAvailable(): boolean {
  return NativeModules.SslPublicKeyPinning != null;
}

export function initializeSslPinning(options: PinningOptions): Promise<void> {
  return SslPublicKeyPinning.initialize(options);
}

export function disableSslPinning(): Promise<void> {
  return SslPublicKeyPinning.disable();
}
