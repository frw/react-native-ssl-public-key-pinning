import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  disableSslPinning,
  initializeSslPinning,
  isSslPinningAvailable,
} from 'react-native-ssl-public-key-pinning';

const GOOGLE_DOMAIN = 'google.com';

// Google Trust Services https://pki.goog/repository/
const GTS_HASHES = [
  'CLOmM1/OXvSPjw5UOYbAf9GKOxImEp9hhku9W90fHMk=', // GlobalSign R4
  'hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=', // GTS Root R1
  'Vfd95BwDeSQo+NUYxVEEIlvkOlWY2SalKK1lPhzOx78=', // GTS Root R2
  'QXnt2YHvdHR3tJYmQIr0Paosp6t/nggsEGD4QJZ3Q0g=', // GTS Root R3
  'mEflZT5enoR1FuXLgYYGqnVEoZvmf9c2bVBpiOjYQ0c=', // GTS Root R4
].join('\n');

// Let's Encrypt https://letsencrypt.org/certificates/
const LE_HASHES = [
  'C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=', // ISRG Root X1
  'diGVwiVYbubAI3RW4hB9xU8e/CH2GnkuvVFZE8zmgzI=', // ISRG Root X2
].join('\n');

const DOMAIN_PLACEHOLDER = 'example.com';
const PUBLIC_KEY_HASHES_PLACEHOLDER = [
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
].join('\n');

export default function App() {
  const [domain, setDomain] = React.useState('');
  const [publicKeyHashes, setPublicKeyHashes] = React.useState('');
  const [initializeResult, setInitializeResult] = React.useState('');

  const [testDomain, setTestDomain] = React.useState('');
  const [fetchResult, setFetchResult] = React.useState('');

  const onFillValid = React.useCallback(() => {
    setDomain(GOOGLE_DOMAIN);
    setPublicKeyHashes(GTS_HASHES);
    setTestDomain(GOOGLE_DOMAIN);
    setInitializeResult('');
    setFetchResult('');
  }, []);

  const onFillInvalid = React.useCallback(() => {
    setDomain(GOOGLE_DOMAIN);
    setPublicKeyHashes(LE_HASHES);
    setTestDomain(GOOGLE_DOMAIN);
    setInitializeResult('');
    setFetchResult('');
  }, []);

  const onInitializePinning = React.useCallback(async () => {
    try {
      await initializeSslPinning({
        [domain]: {
          includeSubdomains: true,
          publicKeyHashes: publicKeyHashes.trim().split('\n'),
        },
      });
      setInitializeResult(`✅ Success Initializing`);
      setFetchResult('');
    } catch (e) {
      setInitializeResult(`❌ ${e}`);
    }
  }, [domain, publicKeyHashes]);

  const onDisablePinning = React.useCallback(async () => {
    try {
      await disableSslPinning();
      setInitializeResult(`✅ Success Disabling`);
      setFetchResult('');
    } catch (e) {
      setInitializeResult(`❌ ${e}`);
    }
  }, []);

  const onFetch = React.useCallback(async () => {
    try {
      const response = await fetch(`https://${testDomain}`);
      setFetchResult(`${response.ok ? '✅' : '❌'} Status: ${response.status}`);
    } catch (e) {
      setFetchResult(`❌ ${e}`);
    }
  }, [testDomain]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
      >
        <Text testID="SslPinningAvailability" style={styles.availability}>
          SSL Pinning Available:{' '}
          <Text style={styles.availabilityStatus}>
            {isSslPinningAvailable() ? 'YES' : 'NO'}
          </Text>
        </Text>

        <View style={styles.divider} />

        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button
              testID="ValidExample"
              title="Valid Example"
              color="green"
              onPress={onFillValid}
            />
          </View>
          <View style={[styles.button, styles.componentMarginLeft]}>
            <Button
              testID="InvalidExample"
              title="Invalid Example"
              color="red"
              onPress={onFillInvalid}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Domain:</Text>
          <TextInput
            style={styles.fieldInput}
            keyboardType="url"
            inputMode="url"
            placeholder={DOMAIN_PLACEHOLDER}
            placeholderTextColor="lightgray"
            value={domain}
            onChangeText={setDomain}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Public Key Hashes:</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldInputMultiline]}
            numberOfLines={3}
            multiline
            placeholder={PUBLIC_KEY_HASHES_PLACEHOLDER}
            placeholderTextColor="lightgray"
            value={publicKeyHashes}
            onChangeText={setPublicKeyHashes}
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button
              testID="InitializePinning"
              title="Initialize Pinning"
              color="deepskyblue"
              onPress={onInitializePinning}
            />
          </View>
          <View style={[styles.button, styles.componentMarginLeft]}>
            <Button
              testID="DisablePinning"
              title="Disable Pinning"
              color="deepskyblue"
              onPress={onDisablePinning}
            />
          </View>
        </View>

        <Text testID="InitializeResultOutput" style={styles.result}>
          {initializeResult}
        </Text>

        <View style={styles.divider} />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Test:</Text>
          <View style={styles.testInputContainer}>
            <View style={styles.fetchDomainInput}>
              <TextInput
                testID="TestDomainInput"
                style={styles.fieldInput}
                keyboardType="url"
                inputMode="url"
                placeholder={DOMAIN_PLACEHOLDER}
                placeholderTextColor="lightgray"
                value={testDomain}
                onChangeText={setTestDomain}
              />
            </View>
            <View style={styles.componentMarginLeft}>
              <Button
                testID="TestFetch"
                title="Fetch"
                color="deepskyblue"
                onPress={onFetch}
              />
            </View>
          </View>
        </View>

        <Text testID="FetchResultOutput" style={styles.result}>
          {fetchResult}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: 'darkslategray',
  },
  availability: {
    color: 'white',
  },
  availabilityStatus: {
    fontWeight: 'bold',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  field: {
    alignSelf: 'stretch',
    marginVertical: 8,
  },
  fieldLabel: {
    color: 'lightgray',
    fontWeight: 'bold',
  },
  fieldInput: {
    marginTop: 4,
    paddingVertical: 4,
    backgroundColor: 'white',
    color: 'black',
  },
  fieldInputMultiline: {
    textAlignVertical: 'top',
    height: 64,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  testInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fetchDomainInput: {
    flexGrow: 1,
  },
  result: {
    textAlign: 'center',
    marginVertical: 8,
    color: 'white',
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 12,
  },
  componentMarginLeft: {
    marginLeft: 8,
  },
});
