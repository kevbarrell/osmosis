import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopNavBar from '../components/TopNavBar';
import ProfileCard from '../components/ProfileCard';
import api from '../config/api';

const DARK_PURPLE = '#440544';
const PINK = '#EC4899';

export default function ProfileScreen({ navigation, route }) {
  const { userId, onLogout } = route.params || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get(`/api/users/${userId}`);
      setProfile(data);
    } catch (err) {
      console.error(err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      fetchProfile();
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const handleEditProfile = useCallback(() => {
    const root = navigation.getParent?.('RootStack');
    root?.navigate('EditProfile');
  }, [navigation]);

  const cardProps = useMemo(() => {
    if (!profile) return null;

    const first = profile.firstName || '';
    const last = profile.lastName || '';
    const fallbackName = `${first} ${last}`.trim();

    const photos = Array.isArray(profile.photos) ? profile.photos.filter(Boolean) : [];
    const image = profile.image || profile.mainPhoto || photos[0] || null;

    return {
      name: profile.name || fallbackName || 'You',
      age: profile.age,
      image,
      distanceMiles: typeof profile.distanceMiles === 'number' ? profile.distanceMiles : 0,
      denomination: profile.denomination,
      maritalStatus: profile.maritalStatus,
      hasChildren: profile.hasChildren,
      drinking: profile.drinking,
      smoking: profile.smoking,
      hobbies: profile.hobbies,
      aboutMe: profile.aboutMe,
      photos,
      variant: 'full',
    };
  }, [profile]);

  if (loading) {
    return (
      <View style={styles.safe}>
        <TopNavBar onLogout={onLogout} navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  if (!profile || !cardProps) {
    return (
      <View style={styles.safe}>
        <TopNavBar onLogout={onLogout} navigation={navigation} />
        <View style={styles.center}>
          <Text style={{ color: 'white' }}>Profile not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <TopNavBar onLogout={onLogout} navigation={navigation} />

      <View style={styles.container}>
        <ScrollView
          style={styles.whitePane}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileCard {...cardProps} />
        </ScrollView>

        {/* Edit button unchanged */}
        <Pressable style={styles.fab} onPress={handleEditProfile}>
          <Ionicons name="create" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DARK_PURPLE,
  },
  container: {
    flex: 1,
  },
  whitePane: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ✅ Tighten a bit more while still preventing the FAB from covering content.
  // This should feel close to your side spacing.
  scrollContent: {
    paddingBottom: 12,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
