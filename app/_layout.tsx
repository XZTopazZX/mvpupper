import React, { createContext, useContext, useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';

interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
}

interface HouseholdMember {
  userId: string;
  name: string;
  joinedAt: string;
}

interface Household {
  id: string;
  name: string;
  dogs: Dog[];
  members: HouseholdMember[];
  inviteCode: string;
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
  updateHousehold: (household: Household) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

function useProtectedRoute(user: User | null, household: Household | null, loading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inSetup = segments[0] === 'setup';

    if (!user) {
      // Not logged in, redirect to login
      router.replace('/login');
    } else if (!household) {
      // Logged in but no household, redirect to setup
      router.replace('/setup');
    } else if (!inAuthGroup) {
      // Logged in with household, redirect to main app
      router.replace('/(tabs)');
    }
  }, [user, household, loading, segments]);
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
        if (userData) {
          setUser(JSON.parse(userData));
        }

        const householdData = await AsyncStorage.getItem('household');
        if (householdData) {
          setHousehold(JSON.parse(householdData));
        }

        const premiumData = await AsyncStorage.getItem('isPremium');
        if (premiumData) {
          setIsPremium(JSON.parse(premiumData));
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  useProtectedRoute(user, household, loading);

  const updateHousehold = async (updatedHousehold: Household) => {
    try {
      await AsyncStorage.setItem('household', JSON.stringify(updatedHousehold));
      setHousehold(updatedHousehold);
    } catch (error) {
      console.error('Error updating household:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>MVPupper</Text>
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ user, household, setUser, setHousehold, loading, isPremium, setIsPremium, updateHousehold }}>
      <Slot />
      <StatusBar style="auto" />
    </AppContext.Provider>
  );
}
