import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  RefreshControl
} from 'react-native';
import TopNavBar from '../components/TopNavBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function MatchesScreen({ userId, baseUrl, onLogout }) {
  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      const matchRes = await fetch(`${baseUrl}/api/users/${userId}/matches`);
      const matchData = await matchRes.json();

      const convoRes = await fetch(`${baseUrl}/api/messages/conversations/${userId}`);
      const convoData = await convoRes.json();

      const messagedUserIds = new Set(convoData.map((c) => c.otherUser._id));
      const newMatches = matchData
        .filter((match) => !messagedUserIds.has(match._id))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setMatches(newMatches);
      setConversations(convoData);
    } catch (err) {
      console.error('Error fetching matches or conversations:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
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
      params: {
        user,
        currentUserId: userId,
        baseUrl,
      }
    });
  };

  return (
    <View style={styles.container}>
      <TopNavBar onLogout={onLogout} navigation={navigation} />
      {matches.length > 0 && <Text style={styles.title}>New Crushes</Text>}
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => goToChat(item)} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}, {item.age}</Text>
              <Text>{item.bio}</Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={matches.length === 0 ? styles.emptyContainer : { paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No crushes yet!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#440544' },
  title: {
    color: '#eee',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center'
  },
  card: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15
  },
  image: { width: 60, height: 60, borderRadius: 30, marginRight: 15, marginLeft: 5 },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 18, color: '#440544', marginTop: 5 },
  emptyText: {
    color: '#E892E8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 10,
  }
});
