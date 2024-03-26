import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export const PINNING_ERROR_EVENT_NAME = 'pinning-error';

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

export type PinningOptions = { [domain: string]: DomainOptions };

export type PinningError = {
  serverHostname: string;
  message?: string;
};

export type ErrorListenerCallback = (error: PinningError) => void;

export interface Spec extends TurboModule {
  initialize(options: PinningOptions): Promise<void>;
  disable(): Promise<void>;

  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SslPublicKeyPinning');
