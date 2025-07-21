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
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styles from '../constants/styles';
import colors from '../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;

const ALL_HOBBIES = [
  'Hiking', 'Cooking', 'Dancing', 'Traveling', 'Movies',
  'Board Games', 'Gym', 'Reading', 'Sports', 'Coffee',
  'Dogs', 'Cats', 'Volunteering', 'Live Music', 'Picnics',
  'Mini Golf', 'Photography', 'Beach', 'Karaoke', 'Art',
  'Biking', 'Yoga', 'Camping', 'Bowling',
];

export default function EditProfileScreen({ navigation, route, justSignedUp, setJustSignedUp }) {
  const { userId, baseUrl } = route.params;

  const [photos, setPhotos] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [denomination, setDenomination] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [drinking, setDrinking] = useState('');
  const [smoking, setSmoking] = useState('');
  const [hobbies, setHobbies] = useState([]);
  const [aboutMe, setAboutMe] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/users/${userId}`);
        const data = await res.json();
        if (res.ok) {
          setPhotos(data.photos?.map((uri, i) => ({ key: `photo-${i}`, uri })) || []);
          setAge(data.age?.toString() || '');
          setGender(data.gender || '');
          setLocation(data.location || '');
          setDenomination(data.denomination || '');
          setMaritalStatus(data.maritalStatus || '');
          setDrinking(data.drinking || '');
          setSmoking(data.smoking || '');
          setHobbies(data.hobbies || []);
          setAboutMe(data.aboutMe || '');
        }
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

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
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
          onPress={() => {
            const updated = photos.filter((p) => p.key !== item.key);
            setPhotos(updated);
          }}
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
    if (!age || !gender || photos.length === 0) {
      Alert.alert('Error', 'Please fill out your age, gender, and upload at least one photo.');
      return;
    }

    const profileData = {
      photos: photos.map((p) => p.uri),
      age,
      gender: gender.toLowerCase(),
      location,
      denomination,
      maritalStatus,
      drinking,
      smoking,
      hobbies,
      aboutMe,
    };

    try {
      const res = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      if (justSignedUp) {
        setJustSignedUp(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp', params: { userId } }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp', params: { userId, screen: 'Profile' } }],
        });
      }
    } catch (err) {
      Alert.alert('Save Failed', 'Could not save your profile.');
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
                set: (val) => setGender(val.toLowerCase()),
              },
              { label: 'Location (City, State)', value: location, set: setLocation },
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
