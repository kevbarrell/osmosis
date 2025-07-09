import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import Logo from '../assets/logo.svg'; // Adjust path if needed

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const baseUrl = 'http://192.168.0.18:5000';

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId:
      '474836227948-07hbt5tgr2i1t1h0ouel2hhe9hdm2h3o.apps.googleusercontent.com'
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: '1136709971817930'
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      handleGoogleLogin(authentication.accessToken);
    }
  }, [googleResponse]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      handleFacebookLogin(authentication.accessToken);
    }
  }, [fbResponse]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Error', 'Please enter email and password.');
    }

    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return Alert.alert('Login Failed', data.message || 'Check credentials');
      }

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('userId', data.user.id);

      onLoginSuccess(data.user.id);
    } catch (err) {
      console.error('Login failed:', err);
      Alert.alert('Login failed', 'Something went wrong.');
    }
  };

  const handleGoogleLogin = async (googleAccessToken) => {
    try {
      const res = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleAccessToken })
      });

      const data = await res.json();

      if (!res.ok) {
        return Alert.alert('Google Login Failed', data.message || 'Try again');
      }

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('userId', data.user.id);

      onLoginSuccess(data.user.id);
    } catch (err) {
      console.error('Google login failed:', err);
      Alert.alert('Google login failed', 'Something went wrong.');
    }
  };

  const handleFacebookLogin = async (fbAccessToken) => {
    try {
      const res = await fetch(`${baseUrl}/api/auth/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: fbAccessToken })
      });

      const data = await res.json();

      if (!res.ok) {
        return Alert.alert('Facebook Login Failed', data.message || 'Try again');
      }

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('userId', data.user.id);

      onLoginSuccess(data.user.id);
    } catch (err) {
      console.error('Facebook login failed:', err);
      Alert.alert('Facebook login failed', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo width={300} height={80} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#eee"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordField}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#eee"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={22}
            color="#eee"
          />
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>

      <View style={styles.divider} />

      <SocialButton
        iconUri="https://img.icons8.com/color/48/google-logo.png"
        label="Continue with Google"
        onPress={() => googlePromptAsync()}
      />
      <SocialButton
        iconUri="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
        label="Continue with Facebook"
        onPress={() => fbPromptAsync()}
      />
      <SocialButton
        iconUri="https://img.icons8.com/ios-filled/50/000000/mac-os.png"
        label="Continue with Apple"
        onPress={() => Alert.alert('Apple sign-in coming soon')}
      />

      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}

function SocialButton({ iconUri, label, onPress }) {
  return (
    <Pressable style={styles.socialButton} onPress={onPress}>
      <Image source={{ uri: iconUri }} style={styles.socialIcon} />
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#440544', padding: 20 },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  input: {
    borderWidth: 1,
    borderColor: '#E892E8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: '#eee',
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E892E8',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    color: '#eee',
  },
  eyeButton: {
    padding: 5,
  },
  forgot: {
    color: '#E892E8',
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#A828AA',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#eee', fontWeight: 'bold' },
  divider: {
    marginVertical: 30,
    borderBottomColor: '#E892E8',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    justifyContent: 'center',
    marginBottom: 15
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain'
  },
  socialText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500'
  },
  signupText: {
    color: '#eee'
  },
  signupLink: {
    color: '#E892E8',
    fontWeight: 'bold',
  }
});
