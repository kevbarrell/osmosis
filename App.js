import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import MessagesScreen from './screens/MessagesScreen';
import ChatScreen from './screens/ChatScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ProfileScreen from './screens/ProfileScreen';
import colors from './constants/colors';

import { API_URL } from './config/api';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ centralized API base URL
const baseUrl = API_URL;

const CalvinCrushTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.purple,
  },
};

function MessagesStack({ userId, baseUrl, onLogout }) {
  const Inner = createNativeStackNavigator();
  return (
    <Inner.Navigator screenOptions={{ headerShown: false }}>
      <Inner.Screen
        name="MessagesMain"
        children={({ navigation }) => (
          <MessagesScreen
            userId={userId}
            baseUrl={baseUrl}
            onLogout={onLogout}
            navigation={navigation}
          />
        )}
      />
      <Inner.Screen name="Chat" component={ChatScreen} />
    </Inner.Navigator>
  );
}

function MatchesStack({ userId, baseUrl, onLogout }) {
  const Inner = createNativeStackNavigator();
  return (
    <Inner.Navigator screenOptions={{ headerShown: false }}>
      <Inner.Screen
        name="MatchesMain"
        children={() => (
          <MatchesScreen userId={userId} baseUrl={baseUrl} onLogout={onLogout} />
        )}
      />
      <Inner.Screen name="Chat" component={ChatScreen} />
    </Inner.Navigator>
  );
}

function TabNavigator({ route }) {
  const { userId, onLogout } = route.params;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Crushes') iconName = 'heart';
          else if (route.name === 'Messages') iconName = 'chatbubble';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E892E8',
        tabBarInactiveTintColor: '#eee',
        tabBarStyle: {
          backgroundColor: '#440544',
          borderTopColor: '#E892E8',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 20,
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarButton: (props) => (
          <TouchableWithoutFeedback onPress={props.onPress}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {props.children}
            </View>
          </TouchableWithoutFeedback>
        ),
      })}
    >
      <Tab.Screen name="Home">
        {() => <HomeScreen userId={userId} baseUrl={baseUrl} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen name="Crushes">
        {() => <MatchesStack userId={userId} baseUrl={baseUrl} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen name="Messages" options={{ unmountOnBlur: true }}>
        {() => <MessagesStack userId={userId} baseUrl={baseUrl} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            {...props}
            route={{
              ...props.route,
              params: {
                userId,
                baseUrl,
                onLogout,
                ...(props.route.params || {}),
              },
            }}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync('token');
      const id = await SecureStore.getItemAsync('userId');

      if (token && id) {
        try {
          const res = await fetch(`${baseUrl}/api/users/${id}`);
          const data = await res.json();
          if (res.ok && data) {
            setUserId(id);
            setProfileCompleted(!!data.profileCompleted);
            setJustSignedUp(false);
          }
        } catch (err) {
          console.error('Error fetching user:', err);
        }
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff4d4d" />
        </View>
      </GestureHandlerRootView>
    );
  }

  const needsProfile = !!userId && (!profileCompleted || justSignedUp);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#440544" barStyle="light-content" />
      <NavigationContainer theme={CalvinCrushTheme}>
        {!userId ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={(id) => {
                    setUserId(id);
                    setJustSignedUp(false);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Signup">
              {(props) => (
                <SignupScreen
                  {...props}
                  onLoginSuccess={(id) => {
                    setUserId(id);
                    setJustSignedUp(true);
                    setProfileCompleted(false);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator
            // ✅ critical: this id lets ProfileScreen reliably navigate to EditProfile
            id="RootStack"
            key={`${userId}-${needsProfile}`}
            screenOptions={{ headerShown: false }}
            initialRouteName={needsProfile ? 'EditProfile' : 'MainApp'}
          >
            <Stack.Screen name="MainApp">
              {(props) => (
                <TabNavigator
                  {...props}
                  route={{
                    ...props.route,
                    params: {
                      userId,
                      onLogout: () => setUserId(null),
                      ...(props.route.params || {}),
                    },
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="EditProfile">
              {(props) => (
                <EditProfileScreen
                  {...props}
                  route={{ ...props.route, params: { userId, baseUrl } }}
                  justSignedUp={justSignedUp}
                  setJustSignedUp={setJustSignedUp}
                  setProfileCompleted={setProfileCompleted}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
