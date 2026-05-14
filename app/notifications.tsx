import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function NotificationsScreen() {
  const [walkReminders, setWalkReminders] = useState(true);
  const [feedingReminders, setFeedingReminders] = useState(true);
  const [medicalAlerts, setMedicalAlerts] = useState(true);

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
          <Switch value={walkReminders} onValueChange={setWalkReminders} />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Feeding Reminders</Text>
            <Text style={styles.settingDescription}>Get notified for meal times</Text>
          </View>
          <Switch value={feedingReminders} onValueChange={setFeedingReminders} />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Medical Alerts</Text>
            <Text style={styles.settingDescription}>Important health notifications</Text>
          </View>
          <Switch value={medicalAlerts} onValueChange={setMedicalAlerts} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f9f9f9', flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  section: { paddingHorizontal: 16, paddingVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  settingDescription: { fontSize: 12, color: '#999', marginTop: 4 },
});
