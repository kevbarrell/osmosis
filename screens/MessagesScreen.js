import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export default function MessagesScreen({ route }) {
  const { userId, otherUserId, baseUrl, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/messages/${userId}/${otherUserId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [userId, otherUserId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: userId, recipient: otherUserId, text }),
      });
      const newMessage = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      setText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.header}>Chat with {otherUserName}</Text>
      <ScrollView contentContainerStyle={styles.messagesContainer}>
        {messages.map((msg) => (
          <View
            key={msg._id}
            style={[
              styles.messageBubble,
              msg.sender === userId ? styles.outgoing : styles.incoming,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type your message..."
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: '#fff' }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', padding: 15 },
  messagesContainer: { padding: 10 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '75%',
  },
  incoming: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  outgoing: {
    backgroundColor: '#ff4d4d',
    alignSelf: 'flex-end',
  },
  messageText: { color: '#000' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
});
