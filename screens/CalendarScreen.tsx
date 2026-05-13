import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useAppContext } from '../App';

export default function CalendarScreen() {
  const { isPremium } = useAppContext();
  const [appointments, setAppointments] = useState<any[]>([]);

  if (!isPremium) {
    return (
      <View style={styles.premiumContainer}>
        <Text style={styles.premiumIcon}>🔒</Text>
        <Text style={styles.premiumTitle}>Premium Feature</Text>
        <Text style={styles.premiumText}>
          Unlock the calendar and appointment reminders with MVPupper Premium
        </Text>
        <View style={styles.features}>
          <Text style={styles.featureItem}>📅 Vet appointments</Text>
          <Text style={styles.featureItem}>💊 Medication reminders</Text>
          <Text style={styles.featureItem}>💉 Vaccine tracking</Text>
          <Text style={styles.featureItem}>✂️ Grooming schedules</Text>
        </View>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments & Reminders</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>No appointments scheduled</Text>
          <Text style={styles.emptySubtext}>Add vet visits, medications, and more</Text>
        </View>
      ) : (
        <View style={styles.appointmentsList}>
          {appointments.map((apt, idx) => (
            <View key={idx} style={styles.appointmentItem}>
              <Text style={styles.appointmentType}>{apt.type}</Text>
              <Text style={styles.appointmentDate}>{apt.date}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  premiumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  premiumIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  premiumText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  features: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    paddingLeft: 20,
  },
  upgradeButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  appointmentsList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  appointmentItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  appointmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
});
