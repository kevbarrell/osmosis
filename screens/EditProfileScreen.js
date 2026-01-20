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

const NUM_COLUMNS = 3;

const ALL_HOBBIES = [
  'Hiking', 'Cooking', 'Dancing', 'Traveling', 'Movies',
  'Board Games', 'Gym', 'Reading', 'Sports', 'Coffee',
  'Dogs', 'Cats', 'Volunteering', 'Live Music', 'Picnics',
  'Mini Golf', 'Photography', 'Beach', 'Karaoke', 'Art',
  'Biking', 'Yoga', 'Camping', 'Bowling',
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
  const [drinking, setDrinking] = useState('');
  const [smoking, setSmoking] = useState('');
  const [hobbies, setHobbies] = useState([]);
  const [aboutMe, setAboutMe] = useState('');

  const isValidUSZip = (zip) => /^\d{5}$/.test(String(zip || '').trim());

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        // ✅ use api helper (no api.url / no baseUrl param required)
        const data = await api.get(`/api/users/${userId}`);

        setPhotos(
          (data.photos || []).map((uri, i) => ({ key: `photo-${i}`, uri }))
        );
        setAge(data.age != null ? String(data.age) : '');
        setGender(data.gender || '');
        setZipCode(data.zipCode || '');
        setDenomination(data.denomination || '');
        setMaritalStatus(data.maritalStatus || '');
        setDrinking(data.drinking || '');
        setSmoking(data.smoking || '');
        setHobbies(Array.isArray(data.hobbies) ? data.hobbies : []);
        setAboutMe(data.aboutMe || '');
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    fetchUserData();
  }, [userId]);

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit Reached', 'You can upload up to 6 photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setPhotos((prev) => [...prev, { key: Date.now().toString(), uri }]);
    }
  };

  const displayPhotos = [...photos];
  if (photos.length < 6) {
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
        : prev.length < 6
        ? [...prev, hobby]
        : prev
    );
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'Missing user info. Please restart the app.');
      return;
    }

    // ZIP required
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
      photos: photos.map((p) => p.uri),
      age: Number(age),
      gender: String(gender).toLowerCase(),
      zipCode: String(zipCode).trim(),
      denomination,
      maritalStatus,
      drinking,
      smoking,
      hobbies,
      aboutMe,
      profileCompleted: true,
    };

    try {
      // ✅ use api helper
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
              <Text style={styles.label}>Photos (Up to 6)*</Text>
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
              <Text style={styles.label}>Hobbies & Interests (Up to 6)</Text>
              <View style={styles.row}>
                {ALL_HOBBIES.map((hobby) => (
                  <Pressable
                    key={hobby}
                    onPress={() => toggleHobby(hobby)}
                    style={[
                      styles.optionButton,
                      hobbies.includes(hobby) && styles.selectedOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        hobbies.includes(hobby) && styles.selectedOptionText,
                      ]}
                    >
                      {hobby}
                    </Text>
                  </Pressable>
                ))}
              </View>
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
