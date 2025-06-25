import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import ProfileCard from '../components/ProfileCard';

export default function HomeScreen() {
  const [profiles, setProfiles] = useState([]);
  const [match, setMatch] = useState(null);

  const loggedInUserId = '6848a7207eabc4cf68f9f5fa'; // Ava
  const myGender = 'female';
  const baseUrl = 'http://192.168.0.18:5000';

  const fetchUsers = async () => {
    try {
      const [usersRes, userRes] = await Promise.all([
        fetch(`${baseUrl}/api/users`),
        fetch(`${baseUrl}/api/users/${loggedInUserId}`)
      ]);

      const users = await usersRes.json();
      const currentUser = await userRes.json();

      if (!Array.isArray(users) || !currentUser._id) {
        throw new Error('Invalid user data');
      }

      const oppositeGender = myGender === 'male' ? 'female' : 'male';
      const alreadySwiped = [
        ...currentUser.likes,
        ...currentUser.rejected,
        ...currentUser.matches
      ];

      const freshUsers = users.filter(
        user =>
          user._id !== loggedInUserId &&
          user.gender === oppositeGender &&
          !alreadySwiped.includes(user._id) &&
          !currentUser.rejectedOnce.includes(user._id)
      );

      const rejectedOnceUsers = users.filter(
        user =>
          user._id !== loggedInUserId &&
          user.gender === oppositeGender &&
          currentUser.rejectedOnce.includes(user._id) &&
          !currentUser.rejected.includes(user._id)
      );

      setProfiles([...freshUsers, ...rejectedOnceUsers]);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSwipe = async (cardIndex, direction) => {
    const swipedUser = profiles[cardIndex];
    if (!swipedUser || !swipedUser._id) return;

    const action = direction === 'right' ? 'like' : 'reject';

    try {
      const res = await fetch(`${baseUrl}/api/users/${loggedInUserId}/swipe`, {
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

  const handleSwipedAll = () => {
    Alert.alert('All done', 'No more profiles to show.');
  };

  return (
    <View style={styles.container}>
      <Swiper
        cards={profiles}
        renderCard={(card) => card ? (
          <ProfileCard
            name={card.name}
            age={card.age}
            image={card.image}
            bio={card.bio}
          />
        ) : <View><Text>Loading...</Text></View>}
        onSwipedRight={(i) => handleSwipe(i, 'right')}
        onSwipedLeft={(i) => handleSwipe(i, 'left')}
        onSwipedAll={handleSwipedAll}
        stackSize={3}
        backgroundColor="#f2f2f2"
        cardVerticalMargin={40}
        animateCardOpacity
        disableTopSwipe
        disableBottomSwipe
      />

      <Modal visible={!!match} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.matchBox}>
            <Text style={styles.matchText}>🎉 It’s a Match!</Text>
            {match && (
              <>
                <Image source={{ uri: match.image }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                <Text style={styles.matchText}>{match.name} likes you too!</Text>
              </>
            )}
            <Pressable style={styles.dismiss} onPress={() => setMatch(null)}>
              <Text style={{ color: '#fff' }}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: 60,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  matchText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  dismiss: {
    marginTop: 20,
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
