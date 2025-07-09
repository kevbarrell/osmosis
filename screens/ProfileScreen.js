import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#6B21A8';
const DARK_PURPLE = '#440544';
const PINK = '#EC4899';

export default function ProfileScreen({ navigation, route }) {
  const { userId, baseUrl } = route.params;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/${userId}`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Your Photos</Text>
        <View style={styles.photoGrid}>
          {profile.photos?.map((uri, index) => (
            <View
              key={index}
              style={[
                styles.photoBox,
                index === 0 && { borderColor: PINK, borderWidth: 3 },
              ]}
            >
              <Image source={{ uri }} style={styles.photo} />
              <View style={styles.orderNumber}>
                <Text style={{ color: 'white', fontSize: 12 }}>{index + 1}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Profile Info</Text>
        <Info label="Age" value={profile.age} />
        <Info label="Gender" value={profile.gender} />
        <Info label="Headline" value={profile.headline} />
        <Info label="Location" value={profile.location} />
        <Info label="Denomination" value={profile.denomination} />
        <Info label="Marital Status" value={profile.maritalStatus} />
        <Info label="Drinking" value={profile.drinking} />
        <Info label="Smoking" value={profile.smoking} />
        <Info label="Hobbies" value={profile.hobbies} />
        <Info label="About Me" value={profile.aboutMe} />
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="create" size={24} color="white" />
      </Pressable>
    </View>
  );
}

function Info({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_PURPLE,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    backgroundColor: DARK_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    marginTop: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoBox: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#ccc',
    borderWidth: 2,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  orderNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'black',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    color: '#aaa',
    fontWeight: 'bold',
  },
  value: {
    color: 'white',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: PINK,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
