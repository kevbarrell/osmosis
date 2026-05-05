// screens/UserProfileScreen.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TopNavBar from '../components/TopNavBar';
import ProfileCard from '../components/ProfileCard';
import api from '../config/api';

const PURPLE = '#440544';
const FAB_PINK = '#EC4899';
const PINK = '#A828AA'; // match HomeScreen modal button color

export default function UserProfileScreen(props) {
  const navigation = props.navigation;
  const route = props.route;

  const userId = props.userId ?? route?.params?.userId;
  const onLogout = props.onLogout ?? route?.params?.onLogout;

  const profile = useMemo(() => route?.params?.profile || null, [route?.params?.profile]);
  const targetId = profile?._id;

  const [checking, setChecking] = useState(true);
  const [isCrush, setIsCrush] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  const checkIfCrush = useCallback(async () => {
    if (!userId || !targetId) {
      setIsCrush(false);
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const crushes = await api.get(`/api/users/${userId}/crushes`);
      const list = Array.isArray(crushes) ? crushes : [];
      const found = list.some((u) => String(u?._id) === String(targetId));
      setIsCrush(found);
    } catch (e) {
      console.error('Error checking crush status:', e);
      setIsCrush(false);
    } finally {
      setChecking(false);
    }
  }, [userId, targetId]);

  useEffect(() => {
    checkIfCrush();
  }, [checkIfCrush]);

  const goBack = useCallback(() => {
    // ✅ Always return to the previous screen (Home, Matches, etc.)
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // ultra-rare fallback
      navigation.navigate('Home');
    }
  }, [navigation]);

  const likeUser = useCallback(async () => {
    if (!userId || !targetId) return;

    try {
      await api.post(`/api/users/${userId}/swipe`, {
        targetId,
        action: 'like',
      });

      setIsCrush(true);
    } catch (e) {
      console.error('Error liking user:', e);
    }
  }, [userId, targetId]);

  const removeCrushToSecondChance = useCallback(async () => {
    if (!userId || !targetId) return;

    setRemoving(true);
    try {
      // ✅ removes from likes/matches AND adds to rejected (2nd chance pool)
      await api.post(`/api/users/${userId}/swipe`, {
        targetId,
        action: 'reject',
      });

      setIsCrush(false);
      setConfirmVisible(false);
      setSuccessVisible(true);
    } catch (e) {
      console.error('Error removing crush:', e);
      // keep modal open so user can try again
    } finally {
      setRemoving(false);
    }
  }, [userId, targetId]);

  const onHeartPress = useCallback(() => {
    if (!targetId) return;
    if (checking) return;

    if (isCrush) {
      setConfirmVisible(true);
    } else {
      likeUser();
    }
  }, [checking, isCrush, likeUser, targetId]);

  if (!profile) {
    return (
      <View style={styles.safe}>
        <TopNavBar onLogout={onLogout} navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <TopNavBar onLogout={onLogout} navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <ProfileCard {...profile} variant="full" />
      </ScrollView>

      {/* Floating buttons (back + like/broken-heart) */}
      <View style={styles.fabStack}>
        <Pressable style={styles.fab} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Pressable
          style={[styles.fab, { marginTop: 12 }]}
          onPress={onHeartPress}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color="#fff" />
          ) : isCrush ? (
            <Ionicons name="heart-dislike" size={24} color="#fff" />
          ) : (
            <Ionicons name="heart" size={24} color="#fff" />
          )}
        </Pressable>
      </View>

      {/* Confirm Remove Modal (match-modal styling) */}
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.centeredModal}>
          <View style={styles.matchBox}>
            <Text style={styles.matchText}>Would you like to remove this crush?</Text>

            <View style={styles.confirmRow}>
              <Pressable
                style={[styles.confirmBtn, styles.confirmBtnYes]}
                onPress={removeCrushToSecondChance}
                disabled={removing}
              >
                {removing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Yes</Text>
                )}
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, styles.confirmBtnNo]}
                onPress={() => setConfirmVisible(false)}
                disabled={removing}
              >
                <Text style={styles.confirmBtnTextDark}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal (match-modal styling) */}
      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.centeredModal}>
          <View style={styles.matchBox}>
            <Text style={styles.matchText}>Crush has been removed.</Text>

            <Pressable style={styles.dismiss} onPress={() => setSuccessVisible(false)}>
              <Text style={styles.dismissText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PURPLE },

  scroll: {
    paddingBottom: 140, // room for fabs
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fabStack: {
    position: 'absolute',
    right: 20,
    bottom: 30,
  },

  fab: {
    backgroundColor: FAB_PINK,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

  // ✅ match-modal styling (mirrors HomeScreen)
  centeredModal: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  matchBox: {
    backgroundColor: '#eee',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  matchText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },

  dismiss: {
    marginTop: 20,
    backgroundColor: PINK,
    padding: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  dismissText: { color: '#eee', fontWeight: 'bold' },

  confirmRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnYes: {
    backgroundColor: PINK,
  },
  confirmBtnNo: {
    backgroundColor: '#ddd',
  },
  confirmBtnText: {
    color: '#eee',
    fontWeight: 'bold',
  },
  confirmBtnTextDark: {
    color: PURPLE,
    fontWeight: 'bold',
  },
});
