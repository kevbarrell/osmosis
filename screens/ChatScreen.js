import { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';

export default function ChatScreen({ route }) {
  const { user, currentUserId, baseUrl } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/messages/${currentUserId}/${user._id}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUserId,
          recipient: user._id,
          text: input
        })
      });
      const newMessage = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      setInput('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <Text style={styles.header}>{user.name}</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Text style={[styles.bubble, item.sender === currentUserId ? styles.mine : styles.theirs]}>
            {item.text}
          </Text>
        )}
        contentContainerStyle={{ padding: 10 }}
      />
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Pressable onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: '#fff' }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: 'bold', padding: 10 },
  bubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '75%',
    fontSize: 16
  },
  mine: { alignSelf: 'flex-end', backgroundColor: '#ff4d4d', color: '#fff' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#eee' },
  inputBar: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ddd' },
  input: { flex: 1, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 20 },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 20
  }
});
