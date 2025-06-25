import { View, Text, Image, StyleSheet } from 'react-native';

export default function ProfileCard({ name, age, image, bio }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}, {age}</Text>
        <Text style={styles.bio}>{bio}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bio: {
    marginTop: 8,
    color: '#666',
  },
});
