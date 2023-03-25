/* eslint-env detox/detox, jest */

describe('SSL Pinning', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should succeed request with valid pinning configuration', async () => {
    await element(by.id('ValidExample')).tap();
    await element(by.id('TestPinning')).tap();
    await expect(element(by.id('ResultOutput'))).toHaveText('✅ Status: 200');
  });

  it('should fail request with invalid pinning configuration', async () => {
    await element(by.id('InvalidExample')).tap();
    await element(by.id('TestPinning')).tap();
    await expect(element(by.id('ResultOutput'))).toHaveText(
      '❌ TypeError: Network request failed'
    );
  });
});
