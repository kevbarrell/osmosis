// EditProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DraggableFlatList from 'react-native-draggable-flatlist';

const DARK_PURPLE = '#440544';
const PINK = '#E892E8';
const PURPLE = '#A828AA';
const GRAY = '#ccc';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_PADDING = 20;
const NUM_COLUMNS = 3;
const SPACING = 10;
const ITEM_SIZE = (SCREEN_WIDTH - SIDE_PADDING * 2 - SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const ALL_HOBBIES = [
  'Hiking', 'Cooking', 'Dancing', 'Traveling', 'Movies',
  'Board Games', 'Gym', 'Reading', 'Sports', 'Coffee',
  'Dogs', 'Cats', 'Volunteering', 'Live Music', 'Picnics',
  'Mini Golf', 'Photography', 'Beach', 'Karaoke', 'Art',
  'Biking', 'Yoga', 'Camping', 'Bowling'
];

export default function EditProfileScreen({ navigation, route }) {
  const { userId, baseUrl } = route.params;

  const [photos, setPhotos] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [denomination, setDenomination] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [drinking, setDrinking] = useState('');
  const [smoking, setSmoking] = useState('');
  const [hobbies, setHobbies] = useState([]);
  const [aboutMe, setAboutMe] = useState('');

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

      setPhotos((prev) => [
        ...prev,
        { key: Date.now().toString(), uri },
      ]);
    }
  };

  const displayPhotos = [...photos];
  if (photos.length < 6) {
    displayPhotos.push({ key: 'add', type: 'add' });
  }

  const renderItem = ({ item, drag }) => {
    if (item.type === 'add') {
      return (
        <Pressable onPress={pickImage} style={styles.photoBox}>
          <View style={styles.addButton}>
            <Text style={styles.addText}>+ Add</Text>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        onLongPress={drag}
        style={[styles.photoBox, { borderColor: PINK }]}
      >
        <Image source={{ uri: item.uri }} style={styles.photo} />
        <Pressable
          onPress={() => {
            const updated = photos.filter((p) => p.key !== item.key);
            setPhotos(updated);
          }}
          style={styles.deleteX}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>×</Text>
        </Pressable>
      </Pressable>
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
    if (!age || !gender || !headline || photos.length === 0) {
      Alert.alert('Error', 'Please complete all required fields and upload at least one photo.');
      return;
    }

    const profileData = {
      photos: photos.map((p) => p.uri),
      age,
      gender,
      headline,
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

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp', params: { userId } }],
      });
    } catch (err) {
      Alert.alert('Save Failed', 'Could not save your profile.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: DARK_PURPLE }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Edit Profile</Text>

          <Text style={styles.sectionLabel}>Your Photos (Tap + to add, drag to reorder)</Text>
          <DraggableFlatList
            data={displayPhotos}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            onDragEnd={({ data }) =>
              setPhotos(data.filter((item) => item.type !== 'add'))
            }
            numColumns={NUM_COLUMNS}
            scrollEnabled={false}
            contentContainerStyle={styles.photoGrid}
          />

          <Text style={styles.label}>Age*</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.label}>Gender*</Text>
          <View style={styles.row}>
            {['Male', 'Female'].map((option) => (
              <Pressable
                key={option}
                onPress={() => setGender(option)}
                style={[
                  styles.optionButton,
                  gender === option && styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    gender === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Headline* (25 characters)</Text>
          <TextInput
            style={styles.input}
            maxLength={25}
            value={headline}
            onChangeText={setHeadline}
          />

          <Text style={styles.label}>Location (City, State)</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} />

          <Text style={styles.label}>Denomination</Text>
          <View style={styles.row}>
            {['Presbyterian', 'Baptist', 'Methodist', 'Other'].map((option) => (
              <Pressable
                key={option}
                onPress={() => setDenomination(option)}
                style={[
                  styles.optionButton,
                  denomination === option && styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    denomination === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Marital Status</Text>
          <View style={styles.row}>
            {['Single', 'Divorced', 'Widowed'].map((option) => (
              <Pressable
                key={option}
                onPress={() => setMaritalStatus(option)}
                style={[
                  styles.optionButton,
                  maritalStatus === option && styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    maritalStatus === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Drinking Preference</Text>
          <View style={styles.row}>
            {['Yes', 'No'].map((option) => (
              <Pressable
                key={option}
                onPress={() => setDrinking(option)}
                style={[
                  styles.optionButton,
                  drinking === option && styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    drinking === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Smoking Preference</Text>
          <View style={styles.row}>
            {['Yes', 'No'].map((option) => (
              <Pressable
                key={option}
                onPress={() => setSmoking(option)}
                style={[
                  styles.optionButton,
                  smoking === option && styles.selectedOption,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    smoking === option && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

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

          <Text style={styles.label}>About Me (100 chars max)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline
            maxLength={100}
            value={aboutMe}
            onChangeText={setAboutMe}
          />

          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIDE_PADDING,
    backgroundColor: DARK_PURPLE,
    flexGrow: 1,
  },
  title: {
    color: '#eee',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#ccc',
    marginBottom: 10,
  },
  photoGrid: {
    marginBottom: 20,
  },
  photoBox: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GRAY,
    margin: SPACING / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    backgroundColor: PURPLE,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteX: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'black',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#ccc',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: PINK,
    borderRadius: 10,
    padding: 15,
    color: '#eee',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: PINK,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: PINK,
  },
  optionText: {
    color: '#eee',
  },
  selectedOptionText: {
    color: DARK_PURPLE,
  },
  button: {
    backgroundColor: PURPLE,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  buttonText: {
    color: '#eee',
    fontWeight: 'bold',
  },
});
