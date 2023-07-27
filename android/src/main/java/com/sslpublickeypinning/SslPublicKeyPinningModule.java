package com.sslpublickeypinning;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.network.NetworkingModule;

import java.io.IOException;
import java.lang.reflect.Field;

import javax.net.ssl.SSLPeerUnverifiedException;

import okhttp3.CertificatePinner;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

@ReactModule(name = SslPublicKeyPinningModule.NAME)
public class SslPublicKeyPinningModule extends ReactContextBaseJavaModule implements Interceptor {
  public static final String NAME = "SslPublicKeyPinning";

  private static final String INCLUDE_SUBDOMAINS_KEY = "includeSubdomains";
  private static final String PUBLIC_KEY_HASHES_KEY = "publicKeyHashes";

  private static final String SSL_PINNING_ERROR_EVENT_NAME = "pinning-error";
  private static final String SSL_PINNING_ERROR_SERVER_HOSTNAME_EVENT_KEY = "serverHostname";
  private static final String SSL_PINNING_ERROR_MESSAGE_EVENT_KEY = "message";

  private static CertificatePinner certificatePinner = null;
  private static boolean isCustomClientBuilderInitialized = false;

  private static int listenerCount = 0;

  public SslPublicKeyPinningModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @Nullable
  public static CertificatePinner getCertificatePinner() {
    return certificatePinner;
  }

  private static void initializeCertificatePinner(ReadableMap options) {
    CertificatePinner.Builder builder = new CertificatePinner.Builder();

    ReadableMapKeySetIterator iterator = options.keySetIterator();
    while (iterator.hasNextKey()) {
      String domain = iterator.nextKey();

      ReadableMap domainOptions = options.getMap(domain);
      if (domainOptions == null) {
        continue;
      }

      boolean includeSubdomains =
          domainOptions.hasKey(INCLUDE_SUBDOMAINS_KEY)
              && domainOptions.getBoolean(INCLUDE_SUBDOMAINS_KEY);

      ReadableArray publicKeyHashes = domainOptions.getArray(PUBLIC_KEY_HASHES_KEY);
      if (publicKeyHashes == null) {
        continue;
      }

      final int count = publicKeyHashes.size();
      String[] publicKeyHashesArray = new String[count];
      for (int i = 0; i < count; i++) {
        publicKeyHashesArray[i] = "sha256/" + publicKeyHashes.getString(i);
      }

      builder.add(includeSubdomains ? "**." + domain : domain, publicKeyHashesArray);
    }

    certificatePinner = builder.build();
  }

  @Nullable
  private static NetworkingModule.CustomClientBuilder getPreviousCustomClientBuilder() {
    try {
      final Field field = NetworkingModule.class.getDeclaredField("customClientBuilder");
      field.setAccessible(true);
      return (NetworkingModule.CustomClientBuilder) field.get(null);
    } catch (Throwable t) {
      Log.e(NAME, "Unable to retrieve previous custom client builder", t);
      return null;
    }
  }

  private void initializeCustomClientBuilder() {
    if (isCustomClientBuilderInitialized) {
      return;
    }

    isCustomClientBuilderInitialized = true;

    final NetworkingModule.CustomClientBuilder previousCustomClientBuilder =
        getPreviousCustomClientBuilder();

    NetworkingModule.setCustomClientBuilder(
        builder -> {
          if (previousCustomClientBuilder != null) {
            previousCustomClientBuilder.apply(builder);
          }
          if (certificatePinner != null) {
            builder.certificatePinner(certificatePinner);
            if (listenerCount > 0) {
              builder.addInterceptor(this);
            }
          }
        });
  }

  @ReactMethod
  public void initialize(ReadableMap options, Promise promise) {
    try {
      initializeCertificatePinner(options);
      initializeCustomClientBuilder();
      promise.resolve(null);
    } catch (Throwable t) {
      promise.reject(t);
    }
  }

  @ReactMethod
  public void disable(Promise promise) {
    certificatePinner = null;
    promise.resolve(null);
  }

  public void emitPinningErrorEvent(@NonNull Request request, @Nullable String message) {
    WritableMap map = new WritableNativeMap();
    map.putString(SSL_PINNING_ERROR_SERVER_HOSTNAME_EVENT_KEY, request.url().url().getHost());
    if (message != null) {
      map.putString(SSL_PINNING_ERROR_MESSAGE_EVENT_KEY, message);
    }

    this.getReactApplicationContext()
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(SSL_PINNING_ERROR_EVENT_NAME, map);
  }

  @NonNull
  @Override
  public Response intercept(@NonNull Chain chain) throws IOException {
    Request request = chain.request();
    try {
      return chain.proceed(request);
    } catch (SSLPeerUnverifiedException e) {
      String message = e.getMessage();
      if (message != null && message.startsWith("Certificate pinning failure")) {
        emitPinningErrorEvent(request, message);
      }
      throw e;
    }
  }

  @ReactMethod
  public void addListener(String eventName) {
    listenerCount += 1;
  }

  @ReactMethod
  public void removeListeners(Integer count) {
    listenerCount -= count;
  }
}
