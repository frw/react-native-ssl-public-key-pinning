package com.sslpublickeypinningexample;

import static androidx.test.platform.app.InstrumentationRegistry.getInstrumentation;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject;
import androidx.test.uiautomator.UiObjectNotFoundException;
import androidx.test.uiautomator.UiSelector;

import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;

import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
  @Rule
  public ActivityTestRule<MainActivity> mActivityRule =
    new ActivityTestRule<>(MainActivity.class, false, false);

  @BeforeClass
  public static void dismissANRSystemDialogIfPresent() throws UiObjectNotFoundException {
    UiDevice device = UiDevice.getInstance(getInstrumentation());
    UiObject waitButton = device.findObject(new UiSelector().textContains("wait"));
    if (waitButton.exists()) {
      waitButton.click();
    }
  }

  @Test
  public void runDetoxTests() {
    DetoxConfig detoxConfig = new DetoxConfig();
    detoxConfig.idlePolicyConfig.masterTimeoutSec = 90;
    detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 60;
    detoxConfig.rnContextLoadTimeoutSec = (BuildConfig.DEBUG ? 180 : 60);

    Detox.runTests(mActivityRule, detoxConfig);
  }
}
