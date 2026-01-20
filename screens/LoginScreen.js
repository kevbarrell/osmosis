// LoginScreen.js
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import Logo from '../assets/logo.svg';

import styles from '../constants/styles';
import colors from '../constants/colors';
import api, { API_URL } from '../config/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: '474836227948-07hbt5tgr2i1t1h0ouel2hhe9hdm2h3o.apps.googleusercontent.com',
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: '1136709971817930',
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      handleGoogleLogin(authentication?.accessToken);
    }
  }, [googleResponse]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      handleFacebookLogin(authentication?.accessToken);
    }
  }, [fbResponse]);

  const ensureApiUrl = () => {
    if (!API_URL) {
      Alert.alert(
        'Config Error',
        'API URL is missing. Check EXPO_PUBLIC_API_URL in your .env and restart Expo with -c.'
      );
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Error', 'Please enter email and password.');
    }

    if (!ensureApiUrl()) return;

    try {
      const data = await api.post('/api/auth/login', { email, password });

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('userId', data.user.id);

      onLoginSuccess(data.user.id);
    } catch (err) {
      console.error('Login failed:', err);
      Alert.alert('Login Failed', err?.message || 'Check credentials');
    }
  };

  const handleGoogleLogin = async (token) => {
    if (!token) return Alert.alert('Google Login Failed', 'Missing token. Try again.');
    if (!ensureApiUrl()) return;

    try {
      const data = await api.post('/api/auth/google', { token });

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('userId', data.user.id);

      onLoginSuccess(data.user.id);
    } catch (err) {
      console.error('Google login failed:', err);
      Alert.alert('Google Login Failed', err?.message || 'Try again');
    }
  };

  const handleFacebookLogin = async (token) => {
    if (!token) return Alert.alert('Facebook Login Failed', 'Missing token. Try again.');
    if (!ensureApiUrl()) return;

    try {
      const data = await api.post('/api/auth/facebook', { token });

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('userId', data.user.id);

      onLoginSuccess(data.user.id);
    } catch (err) {
      console.error('Facebook login failed:', err);
      Alert.alert('Facebook Login Failed', err?.message || 'Try again');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.purple }}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Logo width={300} height={80} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={colors.lightPink}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.lightPink}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              style={{ position: 'absolute', right: 10, top: 15 }}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color={colors.white}
              />
            </Pressable>
          </View>
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
          <Text style={styles.text}>
            Don’t have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
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
