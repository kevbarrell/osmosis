import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ route }) {
  const { user, currentUserId, baseUrl } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const flatListRef = useRef();
  const inputRef = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/messages/${currentUserId}/${user._id}`);
        const data = await res.json();
        setMessages(data.reverse()); // reverse for inverted FlatList
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
          text: input,
        })
      });
      const newMessage = await res.json();
      setMessages((prev) => [newMessage, ...prev]); // prepend to match inverted order
      setInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleLongPress = (message) => {
    console.log('Long pressed message:', message.text);
  };

  const handleMenuOption = (option) => {
    setMenuVisible(false);
    console.log(`${option} selected for user ${user.name}`);
    // Implement logic for Unmatch, Block, Report
  };

  const handleBack = () => {
    navigation.navigate('MessagesMain');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#440544', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Custom Top Bar */}
            <View style={styles.topBar}>
              <Pressable onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#eee" />
              </Pressable>
              <Image source={{ uri: user.image }} style={styles.profileImage} />
              <Text style={styles.userName}>{user.name}</Text>
              <Pressable onPress={() => setMenuVisible(true)} style={{ paddingLeft: 10 }}>
                <Ionicons name="ellipsis-vertical" size={20} color="#eee" />
              </Pressable>
            </View>

            {/* Chat messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const isMine = item.sender === currentUserId;
                return (
                  <Pressable
                    onLongPress={() => handleLongPress(item)}
                    delayLongPress={500}
                    style={[
                      styles.bubbleContainer,
                      isMine ? styles.mine : styles.theirs
                    ]}
                  >
                    <Text style={[styles.bubbleText, isMine && styles.myText]}>
                      {item.text}
                    </Text>
                  </Pressable>
                );
              }}
              contentContainerStyle={{ padding: 10 }}
              keyboardShouldPersistTaps="handled"
              inverted
            />

            {/* Input bar */}
            <View style={styles.inputBar}>
              <TextInput
                ref={inputRef}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                style={styles.input}
                multiline
              />
              <Pressable onPress={sendMessage} style={styles.iconButton}>
                <Ionicons name="send" size={24} color="#A828AA" />
              </Pressable>
            </View>

            {/* Menu Modal */}
            <Modal
              transparent
              visible={menuVisible}
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.menu}>
                    {['Unmatch', 'Block', 'Report'].map((option) => (
                      <Pressable key={option} onPress={() => handleMenuOption(option)} style={styles.menuItem}>
                        <Text style={styles.menuText}>{option}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#440544' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#440544',
  },
  backButton: {
    paddingRight: 10,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    color: '#eee',
    fontWeight: 'bold',
    flex: 1,
  },
  bubbleContainer: {
    maxWidth: '75%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginVertical: 4,
    alignSelf: 'flex-start',
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: '#A828AA',
    borderTopRightRadius: 0,
  },
  theirs: {
    backgroundColor: '#E892E8',
    borderTopLeftRadius: 0,
  },
  bubbleText: {
    fontSize: 16,
    color: '#440544',
  },
  myText: {
    color: '#eee',
  },
  inputBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingLeft: 20,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#E892E8',
    color: '#440544',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 120,
  },
  iconButton: {
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 55 : 55,
    paddingRight: 15,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});
