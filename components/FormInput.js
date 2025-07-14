import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  type = 'text', // 'text' | 'password'
  flex = 1,
  style = {},
  containerStyle = {},
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <View style={[styles.inputGroup, containerStyle, { flex }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, style]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray}
          secureTextEntry={isPassword && !showPassword}
          keyboardType="default"
          autoCapitalize={isPassword ? 'none' : 'sentences'}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={colors.white}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 10,
    width: '100%',
  },
  label: {
    color: colors.white,
    marginBottom: 5,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.lightPink,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    height: 44, // fixed height for consistent spacing
  },
  input: {
    flex: 1,
    color: colors.white,
    paddingVertical: Platform.OS === 'android' ? 4 : 10,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
});
