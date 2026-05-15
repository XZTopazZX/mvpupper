import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'MVPupper',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Activity Log',
          tabBarLabel: 'Log',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="premium-dashboard"
        options={{
          title: 'Premium',
          tabBarLabel: 'Premium',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="star" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dog-profiles"
        options={{
          href: null,
          title: 'Dog Profiles',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="event" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} />,
        }}
      />
      {/* Hidden premium screens - accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="medical-records"
        options={{
          href: null,
          title: 'Medical Records',
        }}
      />
      <Tabs.Screen
        name="vet-appointments"
        options={{
          href: null,
          title: 'Vet Appointments',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
