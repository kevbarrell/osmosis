// components/Button.js

import { Pressable, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function Button({ title, onPress, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.pink,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  disabled: {
    backgroundColor: '#a964a9',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
