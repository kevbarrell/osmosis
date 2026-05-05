// screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import styles from '../constants/styles';
import colors from '../constants/colors';
import api from '../config/api';
import HobbyChips from '../components/HobbyChips';

const API_BASE_URL = 'https://calvincrush-api.onrender.com';

const NUM_COLUMNS = 3;
const MAX_PHOTOS = 3;
const MAX_HOBBIES = 10;

const ALL_HOBBIES = [
  'Hiking', 'Cooking', 'Dancing', 'Traveling', 'Movies',
  'Board Games', 'Gym', 'Reading', 'Sports', 'Coffee',
  'Dogs', 'Cats', 'Volunteering', 'Live Music', 'Picnics',
  'Mini Golf', 'Photography', 'Beach', 'Karaoke', 'Art',
  'Biking', 'Yoga', 'Camping', 'Bowling',
  'Video Games', 'Foodie',
];

export default function EditProfileScreen(props) {
  const { navigation, route } = props;
  const { userId } = route.params || {};

  const justSignedUp = props.justSignedUp ?? false;
  const setJustSignedUp = props.setJustSignedUp ?? (() => {});
  const setProfileCompleted = props.setProfileCompleted ?? (() => {});

  const [photos, setPhotos] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [denomination, setDenomination] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [hasChildren, setHasChildren] = useState('');
  const [drinking, setDrinking] = useState('');
  const [smoking, setSmoking] = useState('');
  const [hobbies, setHobbies] = useState([]);
  const [aboutMe, setAboutMe] = useState('');

  const isValidUSZip = (zip) => /^\d{5}$/.test(String(zip || '').trim());

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const data = await api.get(`/api/users/${userId}`);

        setPhotos(
          (data.photos || [])
            .slice(0, MAX_PHOTOS)
            .map((uri, i) => ({ key: `photo-${i}`, uri }))
        );

        setAge(data.age != null ? String(data.age) : '');
        setGender(data.gender || '');
        setZipCode(data.zipCode || '');
        setDenomination(data.denomination || '');
        setMaritalStatus(data.maritalStatus || '');
        setHasChildren(data.hasChildren || '');
        setDrinking(data.drinking || '');
        setSmoking(data.smoking || '');
        setHobbies(Array.isArray(data.hobbies) ? data.hobbies.slice(0, MAX_HOBBIES) : []);
        setAboutMe(data.aboutMe || '');
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    fetchUserData();
  }, [userId]);

  const uploadImage = async (imageUri) => {
    const formData = new FormData();

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }

      return data.imageUrl;
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Upload Failed', err?.message || 'Could not upload image.');
      return null;
    }
  };

  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit Reached', `You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      const uploadedUrl = await uploadImage(uri);
      if (!uploadedUrl) return;

      setPhotos((prev) => {
        if (prev.length >= MAX_PHOTOS) return prev;
        return [...prev, { key: Date.now().toString(), uri: uploadedUrl }];
      });
    }
  };

  const displayPhotos = [...photos];

  if (photos.length < MAX_PHOTOS) {
    displayPhotos.push({ key: 'add', type: 'add' });
  }

  const renderItem = ({ item }) => {
    if (item.type === 'add') {
      return (
        <Pressable onPress={pickImage} style={styles.photoBox}>
          <View style={styles.addButton}>
            <Text style={styles.addText}>+</Text>
          </View>
        </Pressable>
      );
    }

    return (
      <View style={[styles.photoBox, { borderColor: colors.lightPink }]}>
        <Image source={{ uri: item.uri }} style={styles.photo} />
        <Pressable
          onPress={() => setPhotos((prev) => prev.filter((p) => p.key !== item.key))}
          style={styles.deleteX}
        >
          <Text style={styles.deleteXText}>×</Text>
        </Pressable>
      </View>
    );
  };

  const toggleHobby = (hobby) => {
    setHobbies((prev) =>
      prev.includes(hobby)
        ? prev.filter((h) => h !== hobby)
        : prev.length < MAX_HOBBIES
        ? [...prev, hobby]
        : prev
    );
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'Missing user info. Please restart the app.');
      return;
    }

    if (!age || !gender || photos.length === 0 || !zipCode) {
      Alert.alert(
        'Error',
        'Please fill out age, gender, ZIP code, and upload at least one photo.'
      );
      return;
    }

    if (!isValidUSZip(zipCode)) {
      Alert.alert('Error', 'Please enter a valid 5-digit ZIP code.');
      return;
    }

    const profileData = {
      photos: photos.slice(0, MAX_PHOTOS).map((p) => p.uri),
      age: Number(age),
      gender: String(gender).toLowerCase(),
      zipCode: String(zipCode).trim(),
      denomination,
      maritalStatus,
      hasChildren,
      drinking,
      smoking,
      hobbies: hobbies.slice(0, MAX_HOBBIES),
      aboutMe,
      profileCompleted: true,
    };

    try {
      await api.put(`/api/users/${userId}`, profileData);

      setProfileCompleted(true);

      if (justSignedUp) {
        setJustSignedUp(false);
        navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
        return;
      }

      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
      }
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Save Failed', err?.message || 'Could not save your profile.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.purple }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={[styles.container, { marginTop: 20 }]}>
            <Text style={styles.title}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photos (Up to {MAX_PHOTOS})*</Text>
              <FlatList
                data={displayPhotos}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                numColumns={NUM_COLUMNS}
                scrollEnabled={false}
                contentContainerStyle={styles.photoGrid}
              />
            </View>

            {[
              { label: 'Age*', value: age, set: setAge, keyboardType: 'numeric' },
              {
                label: 'Gender*',
                options: ['Male', 'Female'],
                value: gender,
                set: (val) => setGender(String(val).toLowerCase()),
              },
              {
                label: 'ZIP Code* (5-digit)',
                value: zipCode,
                set: (val) => setZipCode(String(val).replace(/[^\d]/g, '').slice(0, 5)),
                keyboardType: 'numeric',
              },
              {
                label: 'Denomination',
                options: ['Presbyterian', 'Baptist', 'Methodist', 'Other'],
                value: denomination,
                set: setDenomination,
              },
              {
                label: 'Marital Status',
                options: ['Single', 'Divorced', 'Widowed'],
                value: maritalStatus,
                set: setMaritalStatus,
              },
              {
                label: 'Children',
                options: ['Yes', 'No'],
                value: hasChildren,
                set: setHasChildren,
              },
              {
                label: 'Drinking Preference',
                options: ['Yes', 'No'],
                value: drinking,
                set: setDrinking,
              },
              {
                label: 'Smoking Preference',
                options: ['Yes', 'No'],
                value: smoking,
                set: setSmoking,
              },
            ].map((section, i) =>
              section.options ? (
                <View key={i} style={styles.inputGroup}>
                  <Text style={styles.label}>{section.label}</Text>
                  <View style={styles.row}>
                    {section.options.map((option) => (
                      <Pressable
                        key={option}
                        onPress={() => section.set(option)}
                        style={[
                          styles.optionButton,
                          section.value?.toLowerCase() === option.toLowerCase() &&
                            styles.selectedOption,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            section.value?.toLowerCase() === option.toLowerCase() &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.inputGroup} key={i}>
                  <Text style={styles.label}>{section.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={section.value}
                    onChangeText={section.set}
                    keyboardType={section.keyboardType || 'default'}
                  />
                </View>
              )
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hobbies & Interests (Up to {MAX_HOBBIES})</Text>

              <HobbyChips
                mode="select"
                items={[...ALL_HOBBIES].sort((a, b) => a.localeCompare(b))}
                selected={hobbies}
                onToggle={toggleHobby}
                maxSelected={MAX_HOBBIES}
                activeIconColor="#440544"
                inactiveIconColor="#eee"
                iconSize={16}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>About Me (150 Characters Max)</Text>
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                value={aboutMe}
                onChangeText={setAboutMe}
                maxLength={150}
                multiline
              />
            </View>

            <Pressable style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}