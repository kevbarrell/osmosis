import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import MessagesScreen from './screens/MessagesScreen';
import ChatScreen from './screens/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const loggedInUserId = '6848a7207eabc4cf68f9f5fa';
const baseUrl = 'http://192.168.0.18:5000';

function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile settings coming soon...</Text>
    </View>
  );
}

function TabNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Matches') iconName = 'heart';
          else if (route.name === 'Messages') iconName = 'chatbubble';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff4d4d',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home">
        {() => <HomeScreen userId={loggedInUserId} baseUrl={baseUrl} />}
      </Tab.Screen>
      <Tab.Screen name="Matches">
        {() => <MatchesScreen userId={loggedInUserId} baseUrl={baseUrl} />}
      </Tab.Screen>
      <Tab.Screen name="Messages">
        {({ navigation }) => (
          <MessagesScreen
            userId={loggedInUserId}
            baseUrl={baseUrl}
            navigation={navigation}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Chat">
          {({ route }) => (
            <ChatScreen
              route={{
                ...route,
                params: {
                  ...route.params,
                  currentUserId: loggedInUserId,
                  baseUrl,
                },
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
