import { View, Text, Image, StyleSheet } from 'react-native';

function formatDistanceBucket(distanceMiles) {
  if (typeof distanceMiles !== 'number' || Number.isNaN(distanceMiles)) return null;

  if (distanceMiles < 10) return '> 10 mi';
  if (distanceMiles < 15) return '> 15 mi';
  if (distanceMiles < 20) return '> 20 mi';
  if (distanceMiles < 30) return '> 30 mi';
  if (distanceMiles < 50) return '> 50 mi';
  if (distanceMiles < 75) return '> 75 mi';
  if (distanceMiles < 100) return '> 100 mi';
  return '100+ mi';
}

export default function ProfileCard({ name, age, image, bio, distanceMiles }) {
  const distanceLabel = formatDistanceBucket(distanceMiles);

  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>
          {name}
          {age ? `, ${age}` : ''}
        </Text>

        {distanceLabel ? <Text style={styles.distance}>{distanceLabel}</Text> : null}

        {bio ? <Text style={styles.bio}>{bio}</Text> : null}
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
  distance: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#A828AA',
  },
  bio: {
    marginTop: 8,
    color: '#666',
  },
});
