import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  RefreshControl
} from 'react-native';
import TopNavBar from '../components/TopNavBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function MessagesScreen({ userId, baseUrl, onLogout }) {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/messages/conversations/${userId}`);
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setConversations(sorted);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const goToChat = (user) => {
    navigation.navigate('Chat', {
      user,
      currentUserId: userId,
      baseUrl,
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 12) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <TopNavBar onLogout={onLogout} navigation={navigation} />

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        renderItem={({ item }) => {
          const user = item.otherUser;
          return (
            <Pressable onPress={() => goToChat(user)} style={styles.chatRow}>
              <Image source={{ uri: user.image }} style={styles.avatar} />
              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.preview,
                    item.unread ? styles.unread : null
                  ]}
                >
                  {item.lastMessage}
                </Text>
              </View>
            </Pressable>
          );
        }}
        contentContainerStyle={
          conversations.length === 0 ? styles.emptyContainer : { padding: 10 }
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No messages yet!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#440544' },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  separator: {
    height: 1,
    backgroundColor: '#E892E8',
    marginLeft: 60,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: {
    fontWeight: 'bold',
    color: '#eee',
    fontSize: 16,
    maxWidth: '70%',
  },
  timestamp: {
    color: '#E892E8',
    fontSize: 12,
  },
  preview: {
    color: '#eee',
    fontSize: 14,
  },
  unread: {
    fontWeight: 'bold',
    color: '#eee',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  empty: {
    color: '#E892E8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
