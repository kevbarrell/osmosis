// screens/HomeScreen.js
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import ProfileCard from '../components/ProfileCard';
import TopNavBar from '../components/TopNavBar';
import api from '../config/api';

const FAB_PINK = '#EC4899';
const X_RED = '#ff4d4d';

function crushCacheKey(userId) {
  return `myCrushesCache:${userId}`;
}

async function readCrushCache(userId) {
  try {
    const raw = await SecureStore.getItemAsync(crushCacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCrushCache(userId, list) {
  try {
    await SecureStore.setItemAsync(crushCacheKey(userId), JSON.stringify(list));
  } catch {
    // ignore
  }
}

async function addToCrushCache(userId, profile) {
  if (!userId || !profile?._id) return;

  const safe = {
    _id: profile._id,
    name: profile.name,
    age: profile.age,
    image: profile.image,
    photos: profile.photos,
    bio: profile.bio,
    aboutMe: profile.aboutMe,
    headline: profile.headline,
    denomination: profile.denomination,
    maritalStatus: profile.maritalStatus,
    hasChildren: profile.hasChildren,
    drinking: profile.drinking,
    smoking: profile.smoking,
    hobbies: profile.hobbies,
    distanceMiles: profile.distanceMiles,
    timestamp: profile.timestamp || new Date().toISOString(),
  };

  const existing = await readCrushCache(userId);
  const withoutDup = existing.filter((x) => x?._id !== safe._id);
  const next = [safe, ...withoutDup].slice(0, 500);
  await writeCrushCache(userId, next);
}

export default function HomeScreen({ userId, navigation, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [match, setMatch] = useState(null);
  const [secondChanceMode, setSecondChanceMode] = useState(false);

  const [deckLayout, setDeckLayout] = useState({ width: 0, height: 0 });

  const swiperRef = useRef(null);

  // swipe tracking (for fixed icons)
  const swipeX = useRef(new Animated.Value(0)).current;

  const fetchUsers = async () => {
    try {
      const { users, secondChance } = await api.get(
        `/api/users/${userId}/recommendations`
      );

      if (!Array.isArray(users)) throw new Error('Invalid data');

      setSecondChanceMode(!!secondChance);
      setProfiles(users);

      if (secondChance) {
        await Promise.all(
          users.map((profile) =>
            api.patch(`/api/users/${userId}/secondChance/${profile._id}`)
          )
        );
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleSwipe = async (cardIndex, direction) => {
    const swipedUser = profiles[cardIndex];
    if (!swipedUser?._id) return;

    const action = direction === 'right' ? 'like' : 'reject';

    try {
      const data = await api.post(`/api/users/${userId}/swipe`, {
        targetId: swipedUser._id,
        action,
      });

      // ✅ cache likes locally so "My Crushes" shows immediately
      if (action === 'like') {
        await addToCrushCache(userId, swipedUser);
      }

      if (data?.match) setMatch(swipedUser);
    } catch (err) {
      console.error(`${action} error:`, err);
    }
  };

  const handleSwipedAll = async () => {
    try {
      const { users, secondChance } = await api.get(
        `/api/users/${userId}/recommendations`
      );

      if (Array.isArray(users) && users.length > 0) {
        setSecondChanceMode(!!secondChance);
        setProfiles(users);
      } else {
        setProfiles([]);
      }
    } catch (err) {
      console.error('Error fetching more profiles:', err);
      Alert.alert('Error', 'Unable to fetch more profiles.');
    }
  };

  const onDeckLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== deckLayout.width || height !== deckLayout.height) {
      setDeckLayout({ width, height });
    }
  };

  const openUserProfile = useCallback(
    (card) => {
      if (!card) return;

      const tabNav = navigation.getParent?.(); // Tab navigator
      const params = { profile: card };

      if (tabNav?.navigate) {
        tabNav.navigate('Home', { screen: 'UserProfile', params });
        return;
      }

      navigation.navigate('UserProfile', params);
    },
    [navigation]
  );

  const onTapCard = (i) => {
    const card = profiles[i];
    if (!card) return;
    openUserProfile(card);
  };

  // animations
  const heartOpacity = swipeX.interpolate({
    inputRange: [0, 35, 120],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  const heartScale = swipeX.interpolate({
    inputRange: [0, 120],
    outputRange: [0.8, 1.6],
    extrapolate: 'clamp',
  });

  const xOpacity = swipeX.interpolate({
    inputRange: [-120, -35, 0],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const xScale = swipeX.interpolate({
    inputRange: [-120, 0],
    outputRange: [1.6, 0.8],
    extrapolate: 'clamp',
  });

  const resetSwipeX = () => swipeX.setValue(0);

  return (
    <View style={styles.safe}>
      <TopNavBar onLogout={onLogout} navigation={navigation} />

      <View style={styles.deckArea} onLayout={onDeckLayout}>
        {profiles.length > 0 ? (
          deckLayout.width > 0 && deckLayout.height > 0 ? (
            <>
              <Swiper
                ref={swiperRef}
                cards={profiles}
                renderCard={(card) =>
                  card ? (
                    <View style={styles.cardOuter}>
                      {secondChanceMode && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>2nd Chance</Text>
                        </View>
                      )}
                      <ProfileCard {...card} />
                    </View>
                  ) : null
                }
                onSwipedRight={(i) => {
                  resetSwipeX();
                  handleSwipe(i, 'right');
                }}
                onSwipedLeft={(i) => {
                  resetSwipeX();
                  handleSwipe(i, 'left');
                }}
                onSwipedAll={() => {
                  resetSwipeX();
                  handleSwipedAll();
                }}
                onSwiping={(x) => swipeX.setValue(x || 0)}
                onSwipedAborted={resetSwipeX}
                onTapCard={onTapCard}
                verticalSwipe={false}
                horizontalSwipe={true}
                disableTopSwipe
                disableBottomSwipe
                stackSize={3}
                backgroundColor="transparent"
                animateCardOpacity
                cardVerticalMargin={0}
                cardHorizontalMargin={0}
                containerStyle={{
                  width: deckLayout.width,
                  height: deckLayout.height,
                }}
                cardStyle={{
                  width: deckLayout.width,
                  height: deckLayout.height,
                }}
              />

              {/* Fixed-position swipe indicators */}
              <View pointerEvents="none" style={styles.fixedOverlay}>
                <Animated.View
                  style={[
                    styles.leftFixed,
                    { opacity: xOpacity, transform: [{ scale: xScale }] },
                  ]}
                >
                  <Ionicons name="close" size={130} color={X_RED} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.rightFixed,
                    { opacity: heartOpacity, transform: [{ scale: heartScale }] },
                  ]}
                >
                  <Ionicons name="heart" size={120} color={FAB_PINK} />
                </Animated.View>
              </View>
            </>
          ) : (
            <View style={styles.loadingDeck}>
              <Text style={styles.noUsersText}>Loading…</Text>
            </View>
          )
        ) : (
          <View style={styles.noUsersContainer}>
            <Text style={styles.noUsersText}>
              {"You've swiped everyone!\nCheck back soon."}
            </Text>
          </View>
        )}
      </View>

      {/* Match Modal */}
      <Modal visible={!!match} transparent animationType="fade">
        <View style={styles.centeredModal}>
          <View style={styles.matchBox}>
            <Text style={styles.matchText}>🎉 You're CRUSHING it! 🎉</Text>
            {match && (
              <>
                <Image source={{ uri: match.image }} style={styles.matchImage} />
                <Text style={styles.matchText}>{match.name} likes you too!</Text>
              </>
            )}
            <Pressable style={styles.dismiss} onPress={() => setMatch(null)}>
              <Text style={styles.dismissText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#440544' },
  deckArea: { flex: 1 },
  cardOuter: { flex: 1 },

  fixedOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  leftFixed: { position: 'absolute', left: 30 },
  rightFixed: { position: 'absolute', right: 30 },

  loadingDeck: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noUsersContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noUsersText: { color: '#E892E8', fontSize: 16, textAlign: 'center' },

  centeredModal: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  matchBox: {
    backgroundColor: '#eee',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  matchText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  matchImage: { width: 100, height: 100, borderRadius: 50 },
  dismiss: {
    marginTop: 20,
    backgroundColor: '#A828AA',
    padding: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  dismissText: { color: '#eee', fontWeight: 'bold' },

  badge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#A828AA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    zIndex: 10,
  },
  badgeText: { color: '#eee', fontWeight: 'bold', fontSize: 12 },
});
