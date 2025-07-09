import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert
} from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      return Alert.alert('Error', 'Please enter your email address.');
    }

    // For now just show confirmation.
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      {submitted ? (
        <Text style={styles.message}>
          If an account with that email exists, a reset link has been sent.
        </Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Pressable style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </Pressable>
        </>
      )}

      <Pressable style={styles.backLink} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backText}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#440544',
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    color: '#eee',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },
  input: {
    borderWidth: 1,
    borderColor: '#E892E8',
    borderRadius: 10,
    padding: 15,
    color: '#eee',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#A828AA',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#eee',
    fontWeight: 'bold'
  },
  message: {
    color: '#eee',
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 10
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  backText: {
    color: '#E892E8',
    fontWeight: 'bold',}
});
