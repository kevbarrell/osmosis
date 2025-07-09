import { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Swiper from 'react-native-deck-swiper';
import ProfileCard from '../components/ProfileCard';
import TopNavBar from '../components/TopNavBar';

export default function HomeScreen({ userId, baseUrl, navigation, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [match, setMatch] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [secondChanceMode, setSecondChanceMode] = useState(false);

  const fetchUsers = async () => {
    try {
      const [recommendRes, userRes] = await Promise.all([
        fetch(`${baseUrl}/api/users/${userId}/recommendations`),
        fetch(`${baseUrl}/api/users/${userId}`)
      ]);

      const { users, secondChance } = await recommendRes.json();
      const user = await userRes.json();

      if (!Array.isArray(users) || !user._id) throw new Error('Invalid data');

      setCurrentUser(user);
      setSecondChanceMode(secondChance);
      setProfiles(users);

      if (secondChance) {
        await Promise.all(
          users.map((profile) =>
            fetch(`${baseUrl}/api/users/${userId}/secondChance/${profile._id}`, {
              method: 'PATCH'
            })
          )
        );
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleSwipe = async (cardIndex, direction) => {
    const swipedUser = profiles[cardIndex];
    if (!swipedUser || !swipedUser._id) return;

    const action = direction === 'right' ? 'like' : 'reject';

    try {
      const res = await fetch(`${baseUrl}/api/users/${userId}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: swipedUser._id, action })
      });

      const data = await res.json();
      if (data.match) setMatch(swipedUser);
    } catch (err) {
      console.error(`${action} error:`, err);
    }
  };

  const handleSwipedAll = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/${userId}/recommendations`);
      const { users, secondChance } = await res.json();

      if (users.length > 0) {
        setSecondChanceMode(secondChance);
        setProfiles(users);

        if (secondChance) {
          await Promise.all(
            users.map((profile) =>
              fetch(`${baseUrl}/api/users/${userId}/secondChance/${profile._id}`, {
                method: 'PATCH'
              })
            )
          );
        }
      } else {
        setProfiles([]);
      }
    } catch (err) {
      console.error('Error fetching second chance users:', err);
      Alert.alert('Error', 'Unable to fetch more profiles.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNavBar onLogout={onLogout} navigation={navigation} />
      <View style={styles.container}>
        {profiles.length > 0 ? (
          <Swiper
            cards={profiles}
            renderCard={(card) =>
              card ? (
                <View>
                  {secondChanceMode && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>2nd Chance</Text>
                    </View>
                  )}
                  <ProfileCard
                    name={card.name}
                    age={card.age}
                    image={card.image}
                    bio={card.bio}
                  />
                </View>
              ) : null
            }
            onSwipedRight={(i) => handleSwipe(i, 'right')}
            onSwipedLeft={(i) => handleSwipe(i, 'left')}
            onSwipedAll={handleSwipedAll}
            stackSize={3}
            backgroundColor="transparent"
            cardVerticalMargin={40}
            animateCardOpacity
            disableTopSwipe
            disableBottomSwipe
          />
        ) : (
          <View style={styles.noUsersContainer}>
            <Text style={styles.noUsersText}>
              You've swiped everyone!{'\n'}Check back soon for new users.
            </Text>
          </View>
        )}
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#440544',
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  centeredModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBox: {
    backgroundColor: '#eee',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },
  matchText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  matchImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  dismiss: {
    marginTop: 20,
    backgroundColor: '#A828AA',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  dismissText: {
    color: '#eee',
    fontWeight: 'bold',
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#A828AA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    zIndex: 2
  },
  badgeText: {
    color: '#eee',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noUsersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  noUsersText: {
    color: '#E892E8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
