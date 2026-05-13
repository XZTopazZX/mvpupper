import React, { createContext, useContext, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';

interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
}

interface Household {
  id: string;
  name: string;
  dogs: Dog[];
  members: string[];
  createdAt: string;
}

interface User {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  dogId: string;
  type: 'food' | 'water' | 'poop' | 'pee' | 'walk' | 'treat';
  timestamp: string;
  userId: string;
  notes?: string;
}

interface AppContextType {
  user: User | null;
  household: Household | null;
  setUser: (user: User | null) => void;
  setHousehold: (household: Household | null) => void;
  loading: boolean;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const householdData = await AsyncStorage.getItem('household');
        const premiumData = await AsyncStorage.getItem('isPremium');

        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        if (householdData) {
          try {
            setHousehold(JSON.parse(householdData));
          } catch (e) {
            console.error('Error parsing household data:', e);
          }
        }

        if (premiumData) {
          try {
            setIsPremium(JSON.parse(premiumData));
          } catch (e) {
            console.error('Error parsing premium data:', e);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        // Always set loading to false after a short delay to ensure UI renders
        setTimeout(() => setLoading(false), 100);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ user, household, setUser, setHousehold, loading, isPremium, setIsPremium }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="login" options={{ animationEnabled: false }} />
            <Stack.Screen name="setup" />
          </>
        ) : !household ? (
          <Stack.Screen name="setup" options={{ animationEnabled: false }} />
        ) : (
          <Stack.Screen name="(tabs)" options={{ animationEnabled: false }} />
        )}
      </Stack>
      <StatusBar style="auto" />
    </AppContext.Provider>
  );
}
