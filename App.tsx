import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Screens
import HomeScreen from './screens/HomeScreen';
import ActivityLogScreen from './screens/ActivityLogScreen';
import CalendarScreen from './screens/CalendarScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import HouseholdSetupScreen from './screens/HouseholdSetupScreen';
import DogProfileScreen from './screens/DogProfileScreen';

// Types
export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  photo?: string;
  microchipId?: string;
  microchipProvider?: string;
}

export interface Household {
  id: string;
  name: string;
  dogs: Dog[];
  members: string[];
  createdAt: string;
}

export interface Activity {
  id: string;
  dogId: string;
  type: 'food' | 'water' | 'poop' | 'pee' | 'walk' | 'treat';
  timestamp: string;
  userId: string;
  notes?: string;
}

// Context
interface AppContextType {
  user: { id: string; name: string } | null;
  household: Household | null;
  setUser: (user: { id: string; name: string } | null) => void;
  setHousehold: (household: Household | null) => void;
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'MVPupper',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="ActivityLog"
        component={ActivityLogScreen}
        options={{
          title: 'Activity Log',
          tabBarLabel: 'Log',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendar',
          tabBarLabel: 'Calendar',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        const savedHousehold = await AsyncStorage.getItem('household');
        const savedPremium = await AsyncStorage.getItem('isPremium');

        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedHousehold) setHousehold(JSON.parse(savedHousehold));
        if (savedPremium) setIsPremium(JSON.parse(savedPremium));
      } catch (error) {
        console.error('Error loading app state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppState();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ user, household, setUser, setHousehold, isPremium, setIsPremium }}>
      <NavigationContainer>
        <Stack.Navigator>
          {!user ? (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : !household ? (
            <>
              <Stack.Screen
                name="HouseholdSetup"
                component={HouseholdSetupScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DogProfile"
                component={DogProfileScreen}
                options={{ title: 'Dog Profile' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}
