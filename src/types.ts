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
  /**
   * A string containing the date, in yyyy-MM-dd format, on which the domain’s configured SSL pins expire, thus disabling pinning validation. If this is not set, then the pins do not expire.
   * Expiration helps prevent connectivity issues in Apps which do not get updates to their pin set, such as when the user disables App updates.
   */
  expirationDate?: string;
};

export type PinningOptions = { [domain: string]: DomainOptions };

export type PinningError = {
  serverHostname: string;
  message?: string;
};

export type ErrorListenerCallback = (error: PinningError) => void;
