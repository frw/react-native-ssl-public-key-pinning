import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  initialize(options: { [key: string]: {} }): Promise<void>;
  disable(): Promise<void>;

  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'SslPublicKeyPinning'
) as Spec | null;
