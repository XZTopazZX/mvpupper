import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationsScreen() {
  const [walkReminders, setWalkReminders] = useState(true);
  const [feedingReminders, setFeedingReminders] = useState(true);
  const [medicalAlerts, setMedicalAlerts] = useState(true);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setWalkReminders(settings.walkReminders ?? true);
        setFeedingReminders(settings.feedingReminders ?? true);
        setMedicalAlerts(settings.medicalAlerts ?? true);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (walk: boolean, feeding: boolean, medical: boolean) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify({
        walkReminders: walk,
        feedingReminders: feeding,
        medicalAlerts: medical,
      }));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleWalkToggle = (value: boolean) => {
    setWalkReminders(value);
    saveSettings(value, feedingReminders, medicalAlerts);
  };

  const handleFeedingToggle = (value: boolean) => {
    setFeedingReminders(value);
    saveSettings(walkReminders, value, medicalAlerts);
  };

  const handleMedicalToggle = (value: boolean) => {
    setMedicalAlerts(value);
    saveSettings(walkReminders, feedingReminders, value);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="notifications" size={32} color="#8B4513" />
        <Text style={styles.title}>Notifications</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Walk Reminders</Text>
            <Text style={styles.settingDescription}>Get notified for scheduled walks</Text>
          </View>
          <Switch value={walkReminders} onValueChange={handleWalkToggle} trackColor={{ false: '#ccc', true: '#8B4513' }} />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Feeding Reminders</Text>
            <Text style={styles.settingDescription}>Get notified for meal times</Text>
          </View>
          <Switch value={feedingReminders} onValueChange={handleFeedingToggle} trackColor={{ false: '#ccc', true: '#8B4513' }} />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Medical Alerts</Text>
            <Text style={styles.settingDescription}>Important health notifications</Text>
          </View>
          <Switch value={medicalAlerts} onValueChange={handleMedicalToggle} trackColor={{ false: '#ccc', true: '#8B4513' }} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f9f9f9', flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  section: { paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  settingDescription: { fontSize: 12, color: '#999', marginTop: 4 },
});
