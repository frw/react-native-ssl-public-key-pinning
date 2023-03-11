import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
} from 'react-native';
import { initializeSslPinning } from 'react-native-ssl-public-key-pinning';

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

export default function App() {
  const [domain, setDomain] = React.useState('');
  const [publicKeyHashes, setPublicKeyHashes] = React.useState('');
  const [result, setResult] = React.useState('');

  const onFillValid = React.useCallback(() => {
    setDomain(GOOGLE_DOMAIN);
    setPublicKeyHashes(GTS_HASHES);
  }, []);

  const onFillInvalid = React.useCallback(() => {
    setDomain(GOOGLE_DOMAIN);
    setPublicKeyHashes(LE_HASHES);
  }, []);

  const onSubmit = React.useCallback(async () => {
    await initializeSslPinning({
      [domain]: {
        includeSubdomains: true,
        publicKeyHashes: publicKeyHashes.trim().split('\n'),
      },
    });

    try {
      const response = await fetch(`https://${domain}`);
      setResult(`${response.ok ? '✅' : '❌'} Status: ${response.status}`);
    } catch (e) {
      setResult(`❌ ${e}`);
    }
  }, [domain, publicKeyHashes]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      alwaysBounceVertical={false}
    >
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Domain:</Text>
        <TextInput
          style={styles.fieldInput}
          keyboardType="url"
          inputMode="url"
          value={domain}
          onChangeText={setDomain}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Public Key Hashes:</Text>
        <TextInput
          style={[styles.fieldInput, styles.fieldInputMultiline]}
          numberOfLines={5}
          multiline
          value={publicKeyHashes}
          onChangeText={setPublicKeyHashes}
        />
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Valid Example" color="green" onPress={onFillValid} />
        </View>
        <View style={styles.button}>
          <Button title="Invalid Example" color="red" onPress={onFillInvalid} />
        </View>
        <View style={styles.button}>
          <Button title="Test Pinning" color="deepskyblue" onPress={onSubmit} />
        </View>
      </View>

      <Text style={styles.result}>{result}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'darkslategray',
  },
  container: {
    flex: 1,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  button: {
    flex: 1,
    margin: 8,
  },
  result: {
    textAlign: 'center',
    marginVertical: 8,
    color: 'white',
  },
});
