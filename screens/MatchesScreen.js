// screens/MatchesScreen.js
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import TopNavBar from '../components/TopNavBar';
import api from '../config/api';

const PURPLE = '#440544';
const PINK = '#E892E8';
const HOT_PINK = '#EC4899';
const LIGHT = '#eee';

const { width: SCREEN_W } = Dimensions.get('window');

export default function MatchesScreen({ userId, onLogout }) {
  const navigation = useNavigation();

  const [mutualCrushes, setMutualCrushes] = useState([]);
  const [myCrushes, setMyCrushes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    try {
      const [matchData, convoData, crushData] = await Promise.all([
        api.get(`/api/users/${userId}/matches`),
        api.get(`/api/messages/conversations/${userId}`),
        api.get(`/api/users/${userId}/crushes`),
      ]);

      const messagedUserIds = new Set(
        (Array.isArray(convoData) ? convoData : [])
          .map((c) => c?.otherUser?._id)
          .filter(Boolean)
      );

      const matchesArray = Array.isArray(matchData) ? matchData : [];
      const mutual = matchesArray
        .filter((m) => m && m._id && !messagedUserIds.has(m._id))
        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

      setMutualCrushes(mutual);

      const crushesArray = Array.isArray(crushData) ? crushData : [];
      const mine = crushesArray
        .filter((u) => u && u._id)
        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

      setMyCrushes(mine);
    } catch (err) {
      console.error('Error fetching matches/crushes:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const goToChat = (user) => {
    navigation.navigate('Messages', {
      screen: 'Chat',
      params: { user, currentUserId: userId },
    });
  };

  const goToUserProfile = (user) => {
    // ✅ Push UserProfile onto RootStack so Back returns to Matches (not Home)
    const root = navigation.getParent?.('RootStack');

    if (root?.navigate) {
      root.navigate('UserProfile', {
        profile: user,
        userId, // so profile screen can call /crushes etc if needed
      });
      return;
    }

    navigation.navigate('UserProfile', { profile: user, userId });
  };

  const removeCrush = async (targetUser) => {
    if (!targetUser?._id) return;

    const prev = myCrushes;

    setMyCrushes((list) => list.filter((u) => u._id !== targetUser._id));

    try {
      await api.delete(`/api/users/${userId}/crushes/${targetUser._id}`);
    } catch (err) {
      console.error('Remove crush error:', err);
      setMyCrushes(prev);
      Alert.alert('Error', 'Could not remove crush. Please try again.');
    }
  };

  const setTab = (index) => {
    setActiveTab(index);
    pagerRef.current?.scrollTo({ x: index * SCREEN_W, y: 0, animated: true });
  };

  const onMomentumEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_W);
    if (idx !== activeTab) setActiveTab(idx);
  };

  const indicatorTranslate = scrollX.interpolate({
    inputRange: [0, SCREEN_W],
    outputRange: [0, (SCREEN_W - 32) / 2],
    extrapolate: 'clamp',
  });

  const renderMutualItem = ({ item }) => (
    <Pressable onPress={() => goToChat(item)} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>
          {item.name}
          {item.age ? `, ${item.age}` : ''}
        </Text>
        <Text style={styles.subText} numberOfLines={2}>
          {item.bio || item.aboutMe || ' '}
        </Text>
      </View>

      <Ionicons name="chatbubble" size={18} color={PURPLE} style={styles.trailingIcon} />
    </Pressable>
  );

  const renderRemoveAction = (progress, dragX, item, close) => {
    const scale = dragX.interpolate({
      inputRange: [-140, -80, 0],
      outputRange: [1.1, 1.0, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Pressable
        onPress={() => {
          close?.();
          removeCrush(item);
        }}
        style={styles.removeAction}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="heart-dislike" size={26} color="#fff" />
          <Text style={styles.removeText}>Remove</Text>
        </Animated.View>
      </Pressable>
    );
  };

  const renderMyCrushItem = ({ item }) => (
    <Swipeable
      overshootRight={false}
      overshootLeft={false}
      renderRightActions={(progress, dragX) =>
        renderRemoveAction(progress, dragX, item)
      }
    >
      <Pressable onPress={() => goToUserProfile(item)} style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.name}
            {item.age ? `, ${item.age}` : ''}
          </Text>
          <Text style={styles.subText} numberOfLines={2}>
            {item.headline || item.bio || item.aboutMe || ' '}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={PURPLE} style={styles.trailingIcon} />
      </Pressable>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <TopNavBar onLogout={onLogout} navigation={navigation} />

      <View style={styles.tabsWrap}>
        <View style={styles.tabsBar}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.tabIndicator,
              { transform: [{ translateX: indicatorTranslate }] },
            ]}
          />
          <Pressable style={styles.tabBtn} onPress={() => setTab(0)}>
            <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>
              Mutual Crushes
            </Text>
          </Pressable>
          <Pressable style={styles.tabBtn} onPress={() => setTab(1)}>
            <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>
              My Crushes
            </Text>
          </Pressable>
        </View>
      </View>

      <Animated.ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={onMomentumEnd}
      >
        <View style={{ width: SCREEN_W }}>
          <FlatList
            data={mutualCrushes}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={renderMutualItem}
            contentContainerStyle={mutualCrushes.length === 0 ? styles.emptyContainer : styles.listPad}
            ListEmptyComponent={<Text style={styles.emptyText}>No mutual crushes yet!</Text>}
          />
        </View>

        <View style={{ width: SCREEN_W }}>
          <FlatList
            data={myCrushes}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={renderMyCrushItem}
            contentContainerStyle={myCrushes.length === 0 ? styles.emptyContainer : styles.listPad}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No crushes yet!{'\n'}Swipe right on someone to add them here.
              </Text>
            }
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PURPLE },

  tabsWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  tabsBar: {
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,146,232,0.35)',
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: PINK,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabText: {
    color: LIGHT,
    fontWeight: '800',
    fontSize: 13,
  },
  tabTextActive: {
    color: PURPLE,
  },

  listPad: { paddingBottom: 40, paddingTop: 10 },

  card: {
    flexDirection: 'row',
    marginBottom: 14,
    backgroundColor: LIGHT,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  info: { flex: 1 },
  name: {
    fontWeight: '900',
    fontSize: 17,
    color: PURPLE,
    marginBottom: 2,
  },
  subText: { color: '#333', opacity: 0.85 },
  trailingIcon: { marginLeft: 10, opacity: 0.9 },

  emptyText: {
    color: PINK,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },

  removeAction: {
    width: 96,
    marginBottom: 14,
    marginRight: 15,
    borderRadius: 12,
    backgroundColor: HOT_PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    marginTop: 6,
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    textAlign: 'center',
  },
});
