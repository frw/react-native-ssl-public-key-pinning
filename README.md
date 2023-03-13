<h1 align="center">react-native-ssl-public-key-pinning</h1>

[![Package Version](https://img.shields.io/npm/v/react-native-ssl-public-key-pinning?style=for-the-badge)](https://www.npmjs.com/package/react-native-ssl-public-key-pinning)
[![MIT License](https://img.shields.io/github/license/frw/react-native-ssl-public-key-pinning?style=for-the-badge)](LICENSE)

Simple and secure SSL public key pinning for React Native. Uses [OkHttp CertificatePinner](https://square.github.io/okhttp/4.x/okhttp/okhttp3/-certificate-pinner/) on Android and [TrustKit](https://github.com/datatheorem/TrustKit) on iOS.

## 🔍Overview

- ✅ Supports SSL public key pinning using the base64-encoded SHA-256 hash of a certificate's Subject Public Key Info.
- ✅ **No native configuration needed.** Simply install and configure through the provided JS API.
- ✅ **No modification of existing network request code needed.** All network requests done through the standard [Networking APIs](https://reactnative.dev/docs/network) will have the certificate pinning configuration automatically enabled after initialization.
- ✅ Compatible with Flipper Network plugin for easier debugging of network requests.

## 🧰Installation

### React Native
```sh
npm install react-native-ssl-public-key-pinning
npx pod-install
```

### Expo
```sh
expo install react-native-ssl-public-key-pinning
```

## 🚀Usage

1. Retrieve the base64-encoded SHA-256 public key hash of the certificates you want to pin. [More details on how to do this](#public-key-hash)
2. Call `initializeSslPinning` as early as possible in your App entrypoint with your SSL pinning configuration.
3. All network requests in your app should now have the pinning configuration enabled.

### Example

```js
import { initializeSslPinning } from 'react-native-ssl-public-key-pinning';

await initializeSslPinning({
  'google.com': {
    includeSubdomains: true,
    publicKeyHashes: [
      'CLOmM1/OXvSPjw5UOYbAf9GKOxImEp9hhku9W90fHMk=',
      'hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=',
      'Vfd95BwDeSQo+NUYxVEEIlvkOlWY2SalKK1lPhzOx78=',
      'QXnt2YHvdHR3tJYmQIr0Paosp6t/nggsEGD4QJZ3Q0g=',
      'mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=',
    ],
  },
});

// ...

// This request will have public key pinning enabled
const response = await fetch('google.com');
```

## ⚙️Options

|Option|Type|Mandatory|Description|
|--|--|--|--|
|`includeSubdomains`|`boolean`|No|Whether all subdomains of the specified domain should also be pinned. Defaults to `false`.|
|`publicKeyHashes`|`string[]`|Yes|An array of SSL pins, where each pin is the base64-encoded SHA-256 hash of a certificate's Subject Public Key Info.|

## 📝Additional Notes

- On iOS, SSL/TLS sessions are cached. If a connection to your site previously succeeded, setting a pinning configuration that should fail the next request would not actually fail it since the previous session is used. You will need to restart your app to clear out this cache.
- Third-party libraries that make use of `fetch` would also be affected by the pinning. However, native libraries that implement their own ways of performing network requests would not be affected by the pinning configuration.
- In order to prevent accidentally locking users out of your site, make sure you have at least one backup pin and that you have procedures in place to transition to using the backup pin if your primary pin can no longer be used. Read more about this [here](https://github.com/datatheorem/TrustKit/blob/master/docs/getting-started.md#always-provide-at-least-one-backup-pin).
- You can also implement an OTA update mechanism (e.g. through [`react-native-code-push`](https://github.com/microsoft/react-native-code-push) or [`expo-updates`](https://docs.expo.dev/versions/latest/sdk/updates/)) to ensure your key hashes are up to date without needing users to download a new version from the Play Store/App Store since all pinning configurations are done through the JS API.


## 🤔FAQ

<details id="public-key-hash">
  <summary>How do I retrieve the base64-encoded SHA-256 public key hash of my certificates?</summary>

  ### OpenSSL CLI
  
  #### Server
  
  Run the following command, replacing `<hostname>` with your server's hostname.
  
  ```sh
  openssl s_client -servername <hostname> -connect <hostname>:443 | openssl x509 -pubkey -noout | openssl rsa -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
  ```
  
  #### Certificate file
  
  ```sh
  openssl x509 -in certificate.crt -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
  ```
  
  ### SSL Labs
  
  If your site is accessible publicly, you can use https://www.ssllabs.com/ssltest/index.html to retrieve the public key hash of your certificates.
  
  ![ssllabs](https://user-images.githubusercontent.com/1888212/224491992-f315c9b0-1cd5-4ad1-a02a-b32a9fc52493.jpg)
  
</details>

## 📚References

- [OWASP](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)
- [OkHttp](https://square.github.io/okhttp/4.x/okhttp/okhttp3/-certificate-pinner/)
- [TrustKit](https://github.com/datatheorem/TrustKit/blob/master/docs/getting-started.md)

## 🤝Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.
