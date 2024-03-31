<h1 align="center">react-native-ssl-public-key-pinning</h1>

[![MIT License](https://img.shields.io/github/license/frw/react-native-ssl-public-key-pinning)](LICENSE)
[![Package Version](https://img.shields.io/npm/v/react-native-ssl-public-key-pinning)](https://www.npmjs.com/package/react-native-ssl-public-key-pinning)
[![CI](https://github.com/frw/react-native-ssl-public-key-pinning/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/frw/react-native-ssl-public-key-pinning/actions/workflows/ci.yml)
[![GitHub Repo stars](https://img.shields.io/github/stars/frw/react-native-ssl-public-key-pinning?style=social)](https://github.com/frw/react-native-ssl-public-key-pinning)

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
```
OR for Yarn use:
```sh
yarn add react-native-ssl-public-key-pinning
```
Before building for iOS, make sure to run the following commands:
```sh
cd ios && pod install && cd ..
```

### Expo Managed Workflow
```sh
npx expo install react-native-ssl-public-key-pinning
```
and then follow the steps to create a [development build](https://docs.expo.dev/develop/development-builds/create-a-build/) or [production build](https://docs.expo.dev/deploy/build-project/)

#### Disable `expo-dev-client` Network Inspector on iOS (Optional)
If you are building an iOS Expo development build and want to test out your pinning configuration, you will need to disable `expo-dev-client`'s network inspector as it [interferes with the pinning setup](https://github.com/frw/react-native-ssl-public-key-pinning/issues/223). Note that the network inspector is automatically disabled on production builds and so this library would function properly on production builds without needing to go through the following steps.

1. Install `expo-build-properties`
```
npx expo install expo-build-properties
```
2. Add the following plugin configuration to your `app.json`
```
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "networkInspector": false
          } 
        }
      ]
    ]
  }
}

```
3. Run prebuild to update native files
```
npx expo prebuild
```

## 🚀Usage

1. Retrieve the base64-encoded SHA-256 public key hash of the certificates you want to pin. [More details on how to do this](#public-key-hash)
2. Call `initializeSslPinning` as early as possible in your App entry point with your SSL pinning configuration.
3. All network requests in your app should now have SSL pinning enabled!

### Pinning Example

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
const response = await fetch('https://www.google.com');
```

### Listener Example
```js
import { addSslPinningErrorListener } from 'react-native-ssl-public-key-pinning';

useEffect(() => {
  const subscription = addSslPinningErrorListener((error) => {
    // Triggered when an SSL pinning error occurs due to pin mismatch
    console.log(error.serverHostname);
  });
  return () => {
    subscription.remove();
  };
}, []);
```

## 💡API Reference
|API|Description|
|--|--|
|`isSslPinningAvailable(): boolean`|Returns whether the `SslPublicKeyPinning` NativeModule is available on the current app installation. Useful if you're using Expo Go and want to avoid initializing pinning if it's not available.|
|`initializeSslPinning(options: PinningOptions): Promise<void>`|Initializes and enables SSL public key pinning for the domains and options you specify.|
|`disableSslPinning(): Promise<void>`|Disables SSL public key pinning.|
|`addSslPinningErrorListener(callback: ErrorListenerCallback): EmitterSubscription`|Subscribes to SSL pinning errors due to pin mismatch. Useful if you would like to report errors or inform the user of security issues.|

## ⚙️Options

|Option|Type|Mandatory|Description|
|--|--|--|--|
|`includeSubdomains`|`boolean`|No|Whether all subdomains of the specified domain should also be pinned. Defaults to `false`.|
|`publicKeyHashes`|`string[]`|Yes|An array of SSL pins, where each pin is the base64-encoded SHA-256 hash of a certificate's Subject Public Key Info. Note that [at least two pins are needed per domain on iOS](#additional-notes).|
|`expirationDate`|`string`|No|A string containing the date, in yyyy-MM-dd format, on which the domain’s configured SSL pins expire, thus disabling pinning validation. If this is not set, then the pins do not expire. Expiration helps prevent connectivity issues in Apps which do not get updates to their pin set, such as when the user disables App updates.|

## 📝Additional Notes

### Known Issues
- This library should support [all currently supported versions of React Native](https://github.com/reactwg/react-native-releases#which-versions-are-currently-supported). However, older RN versions should also be compatible with this library, though it might be untested. You should go through the [process to check your setup](#check-setup) on both Android and iOS to ensure it works as expected. Do note that on Android React Native versions below v65, `includeSubdomains: true` is not supported and you have to match your domains exactly. This is because wildcard domain support (which this library uses for `includeSubdomains`) was only introduced in [OkHttp v4.3](https://square.github.io/okhttp/changelogs/changelog_4x/#version-430), and [RN v65 is the first version](https://github.com/facebook/react-native/releases/tag/v0.65.0) that upgraded OkHttp to v4.
- On iOS, SSL/TLS sessions are cached. If a connection to your site previously succeeded, setting a pinning configuration that should fail the following request would not actually fail it since the previous session is used. You will need to restart your app to clear out this cache.
- Third-party libraries that use `fetch` or `XMLHttpRequest` would also be affected by the pinning (e.g. `axios`). However, native libraries that implement their own methods of performing network requests would not be affected by the pinning configuration.

### Best Practices
- To prevent accidentally locking users out of your site, ensure you have at least one backup pin and have procedures in place to transition to using the backup pin if your primary pin can no longer be used. Read more about this [here](https://github.com/datatheorem/TrustKit/blob/master/docs/getting-started.md#always-provide-at-least-one-backup-pin). Further, TrustKit (native iOS library) [enforces two pins](https://github.com/datatheorem/TrustKit/commit/7a8b422216e29df400603fb969ab24af17c6856a) which will cause `initializeSslPinning` to throw an exception if only one pin is provided. 
- You can also implement an OTA update mechanism through libraries like [`react-native-code-push`](https://github.com/microsoft/react-native-code-push) or [`expo-updates`](https://docs.expo.dev/versions/latest/sdk/updates/). Doing this will help ensure your key hashes are up to date without needing users to download a new version from the Play Store/App Store since all pinning configurations are done through the JS API.


## 🤔FAQ

<details id="public-key-hash">
  <summary>How do I retrieve the base64-encoded SHA-256 public key hash of my certificates?</summary>

  ### OpenSSL CLI
  
  #### Server
  
  Run the following command, replacing `<hostname>` with your server's hostname.
  
  ```sh
  echo | openssl s_client -servername <hostname> -connect <hostname>:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256 -binary | openssl enc -base64
  ```
  
  #### Certificate file
  
  ```sh
  openssl x509 -in certificate.crt -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
  ```

  #### Private SSL key

  1. Convert private key to public pem key:

  ```
  openssl rsa -in private.key -pubout -out public_key.pem
  ```

  2. generate hash from public key

  ```
  openssl rsa -in public_key.pem -pubin -outform DER | openssl dgst -sha256 -binary | openssl enc -base64
  ```
  
  ### SSL Labs
  
  If your site is accessible publicly, you can use https://www.ssllabs.com/ssltest/index.html to retrieve the public key hash of your certificates.
  
  ![ssllabs](https://user-images.githubusercontent.com/1888212/224491992-f315c9b0-1cd5-4ad1-a02a-b32a9fc52493.jpg)

  
</details>

<details id="check-setup">
  <summary>How do I ensure that everything is set up correctly?</summary>
  
  An easy way to test you've set everything up correctly is by temporarily providing the wrong public key hashes to `initializeSslPinning`. For example:
  
```
await initializeSslPinning({
  'google.com': {
    includeSubdomains: true,
    publicKeyHashes: [
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
    ],
  },
});

// ...

// This request should fail with an error
const response = await fetch('https://www.google.com');
```

Any requests you make to the pinned domain should fail since the server is not providing certificates that match your hashes. You can then switch back to the correct public key hashes while leaving everything else the same, and once you ensure the requests succeed again you'll know you've set it all up correctly!
  
</details>

## 📚References

- [OWASP](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)
- [OkHttp](https://square.github.io/okhttp/4.x/okhttp/okhttp3/-certificate-pinner/)
- [TrustKit](https://github.com/datatheorem/TrustKit/blob/master/docs/getting-started.md)

## 🤝Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.
