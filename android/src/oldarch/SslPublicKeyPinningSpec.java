package com.sslpublickeypinning;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReadableMap;

abstract class SslPublicKeyPinningSpec extends ReactContextBaseJavaModule {
  SslPublicKeyPinningSpec(ReactApplicationContext context) {
    super(context);
  }

  public abstract void initialize(ReadableMap options, Promise promise);

  public abstract void disable(Promise promise);

  public abstract void addListener(String eventName);

  public abstract void removeListeners(double count);
}
