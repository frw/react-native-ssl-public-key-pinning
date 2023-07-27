import { by, device, expect, element } from 'detox';

describe('SSL Pinning', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });

    await expect(element(by.id('SslPinningAvailability'))).toHaveText(
      'SSL Pinning Available: YES'
    );
  });

  it('should succeed fetch with valid pins', async () => {
    await element(by.id('ValidExample')).tap();

    await element(by.id('InitializePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Initializing'
    );

    await element(by.id('TestFetch')).tap();
    await expect(element(by.id('FetchResultOutput'))).toHaveText(
      '✅ Status: 200'
    );
  });

  it('should fail fetch with invalid pins', async () => {
    await element(by.id('InvalidExample')).tap();

    await element(by.id('InitializePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Initializing'
    );

    await element(by.id('TestFetch')).tap();
    await expect(element(by.id('FetchResultOutput'))).toHaveText(
      '❌ TypeError: Network request failed'
    );
    await expect(element(by.id('PinningError'))).toHaveText(
      'Pinning Error: www.google.com'
    );
  });

  it('should succeed fetch with unrelated pins', async () => {
    await element(by.id('InvalidExample')).tap();

    await element(by.id('InitializePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Initializing'
    );

    await element(by.id('TestDomainInput')).replaceText('example.com');

    await element(by.id('TestFetch')).tap();
    await expect(element(by.id('FetchResultOutput'))).toHaveText(
      '✅ Status: 200'
    );
  });

  it('should succeed fetch after initializing with invalid pins and then initializing with valid pins', async () => {
    await element(by.id('InvalidExample')).tap();

    await element(by.id('InitializePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Initializing'
    );

    await element(by.id('ValidExample')).tap();

    await element(by.id('InitializePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Initializing'
    );

    await element(by.id('TestFetch')).tap();
    await expect(element(by.id('FetchResultOutput'))).toHaveText(
      '✅ Status: 200'
    );
  });

  it('should fail fetch after initializing with valid pins and then initializing with invalid pins', async () => {
    await element(by.id('ValidExample')).tap();

    await element(by.id('InitializePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Initializing'
    );

    await element(by.id('InvalidExample')).tap();

    await element(by.id('InitializePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Initializing'
    );

    await element(by.id('TestFetch')).tap();
    await expect(element(by.id('FetchResultOutput'))).toHaveText(
      '❌ TypeError: Network request failed'
    );
    await expect(element(by.id('PinningError'))).toHaveText(
      'Pinning Error: www.google.com'
    );
  });

  it('should succeed fetch after initializing invalid pins and then disabling it', async () => {
    await element(by.id('InvalidExample')).tap();

    await element(by.id('InitializePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Initializing'
    );

    await element(by.id('DisablePinning')).tap();
    await expect(element(by.id('InitializeResultOutput'))).toHaveText(
      '✅ Success Disabling'
    );

    await element(by.id('TestFetch')).tap();
    await expect(element(by.id('FetchResultOutput'))).toHaveText(
      '✅ Status: 200'
    );
  });
});
