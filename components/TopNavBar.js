import React, { useState } from 'react';
import {
  View,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Logo from '../assets/logo.svg'; // SVG as React component

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function TopNavBar({ onLogout, navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-SCREEN_HEIGHT))[0];

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = (callback) => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_HEIGHT,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      if (callback) {
        setTimeout(callback, 50);
      }
    });
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('userId');
    closeModal(onLogout);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.navBar}>
        <Logo width={180} height={60} />
        <Pressable onPress={openModal}>
          <Ionicons name="menu" size={28} color="#eee" />
        </Pressable>
      </View>

      <Modal visible={modalVisible} transparent animationType="none">
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable style={styles.closeButton} onPress={() => closeModal()}>
            <Ionicons name="close" size={28} color="#eee" />
          </Pressable>

          <View style={styles.optionContainer}>
            <Pressable style={styles.option}><Text style={styles.optionText}>Edit Profile</Text></Pressable>
            <Pressable style={styles.option}><Text style={styles.optionText}>Privacy Notice</Text></Pressable>
            <Pressable style={styles.option}><Text style={styles.optionText}>Report a Problem</Text></Pressable>
            <Pressable style={styles.option}><Text style={styles.optionText}>Contact Us</Text></Pressable>
            <Pressable style={styles.option}><Text style={styles.optionText}>Pause/Delete Account</Text></Pressable>
            <Pressable style={styles.option} onPress={handleLogout}>
              <Text style={[styles.optionText, { color: '#E892E8' }]}>Logout</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#440544',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#440544',
  },
  modalContent: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#440544',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  optionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    paddingVertical: 24,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
  },
});
