import {
  NativeModules,
  Platform,
  NativeEventEmitter,
  type EmitterSubscription,
} from 'react-native';
import {
  PINNING_ERROR_EVENT_NAME,
  type ErrorListenerCallback,
  type PinningOptions,
} from './NativeSslPublicKeyPinning';

export type {
  DomainOptions,
  PinningOptions,
  PinningError,
  ErrorListenerCallback,
} from './NativeSslPublicKeyPinning';

const LINKING_ERROR =
  `The package 'react-native-ssl-public-key-pinning' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const SslPublicKeyPinningModule = isTurboModuleEnabled
  ? require('./NativeSslPublicKeyPinning').default
  : NativeModules.SslPublicKeyPinning;

const SslPublicKeyPinning = SslPublicKeyPinningModule
  ? SslPublicKeyPinningModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

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

let emitter: NativeEventEmitter | null = null;

export function addSslPinningErrorListener(
  callback: ErrorListenerCallback
): EmitterSubscription {
  if (emitter == null) {
    emitter = new NativeEventEmitter(SslPublicKeyPinningModule);
  }
  return emitter.addListener(PINNING_ERROR_EVENT_NAME, callback);
}
