package com.sslpublickeypinning;

import com.facebook.react.bridge.ReactApplicationContext;

abstract class SslPublicKeyPinningSpec extends NativeSslPublicKeyPinningSpec {
  SslPublicKeyPinningSpec(ReactApplicationContext context) {
    super(context);
  }
}
