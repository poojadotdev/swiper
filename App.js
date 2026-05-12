import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Layers, MessageCircleHeart, LogOut, User, MessageSquare } from 'lucide-react-native';

import { AppProvider, useAppContext } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import FeedScreen from './src/screens/FeedScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import { TouchableOpacity, Text, View } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { logout } = useAppContext();

  const handleLogout = () => {
    logout();
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#000000', borderTopWidth: 0, elevation: 10, shadowOpacity: 0.1 },
        headerStyle: { backgroundColor: '#000000' },
        headerTitleStyle: { color: '#ffffff', fontWeight: '700' },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#334155', borderRadius: 16 }}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Log Out</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{
          tabBarIcon: ({ color }) => <Layers color={color} size={24} />,
          headerTitle: 'For You'
        }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen} 
        options={{
          tabBarIcon: ({ color }) => <MessageCircleHeart color={color} size={24} />,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleStyle: { color: '#000000', fontWeight: '700' },
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleStyle: { color: '#000000', fontWeight: '700' },
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
          headerStyle: { backgroundColor: '#1e293b' },
          headerTitleStyle: { color: '#ffffff', fontWeight: '700' },
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { role } = useAppContext();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!role ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
