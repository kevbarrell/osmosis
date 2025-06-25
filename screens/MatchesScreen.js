import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Button } from 'react-native';

export default function MatchesScreen({ userId, baseUrl, onClose }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch(`${baseUrl}/api/users/${userId}/matches`)
      .then(res => res.json())
      .then(data => setMatches(data))
      .catch(err => console.error('Error fetching matches:', err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}, {item.age}</Text>
              <Text>{item.bio}</Text>
            </View>
          </View>
        )}
      />
      <Button title="Back to Swiping" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15
  },
  info: {
    flex: 1
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18
  }
});