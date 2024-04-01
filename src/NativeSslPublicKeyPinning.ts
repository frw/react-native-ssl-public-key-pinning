import { TurboModuleRegistry, type TurboModule } from 'react-native';

import type { PinningOptions } from './types';

export interface Spec extends TurboModule {
  initialize(options: PinningOptions): Promise<void>;
  disable(): Promise<void>;

  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SslPublicKeyPinning');
