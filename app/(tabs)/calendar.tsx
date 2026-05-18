import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface VetAppointment {
  id: string;
  dogId: string;
  vetName: string;
  date: string;
  notes?: string;
}

interface MedicalRecord {
  id: string;
  dogId: string;
  title: string;
  date: string;
  notes?: string;
}

export default function CalendarScreen() {
  const { household } = useAppContext();
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadData();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [household]);

  const loadData = async () => {
    try {
      const [aptsData, recsData] = await Promise.all([
        AsyncStorage.getItem('vetAppointments'),
        AsyncStorage.getItem('medicalRecords'),
      ]);
      if (aptsData) setAppointments(JSON.parse(aptsData));
      if (recsData) setRecords(JSON.parse(recsData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const dogAppointments = appointments
    .filter(a => a.dogId === selectedDogId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const dogRecords = records
    .filter(r => r.dogId === selectedDogId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcomingAppointments = dogAppointments.filter(a => new Date(a.date) >= new Date());
  const pastAppointments = dogAppointments.filter(a => new Date(a.date) < new Date());

  const selectedDog = household?.dogs.find(d => d.id === selectedDogId);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Appointments & medical records</Text>
        </View>

        {/* Dog Selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.sectionLabel}>Select Dog</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogList}>
            {household?.dogs.map(dog => (
              <TouchableOpacity
                key={dog.id}
                style={[styles.dogTab, selectedDogId === dog.id && styles.dogTabActive]}
                onPress={() => setSelectedDogId(dog.id)}
              >
                <Text style={[styles.dogTabText, selectedDogId === dog.id && styles.dogTabTextActive]}>
                  {dog.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event" size={20} color="#8B4513" />
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          </View>
          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-note" size={40} color="#ddd" />
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            </View>
          ) : (
            upcomingAppointments.map(apt => (
              <View key={apt.id} style={styles.appointmentCard}>
                <View style={styles.aptDateBadge}>
                  <Text style={styles.aptDate}>{new Date(apt.date).getDate()}</Text>
                  <Text style={styles.aptMonth}>{new Date(apt.date).toLocaleString('default', { month: 'short' })}</Text>
                </View>
                <View style={styles.aptInfo}>
                  <Text style={styles.aptVet}>{apt.vetName}</Text>
                  <Text style={styles.aptTime}>{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  {apt.notes && <Text style={styles.aptNotes}>{apt.notes}</Text>}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="history" size={20} color="#999" />
              <Text style={styles.sectionTitleGray}>Past Appointments</Text>
            </View>
            {pastAppointments.slice(0, 3).map(apt => (
              <View key={apt.id} style={[styles.appointmentCard, styles.pastCard]}>
                <View style={[styles.aptDateBadge, styles.pastBadge]}>
                  <Text style={styles.aptDate}>{new Date(apt.date).getDate()}</Text>
                  <Text style={styles.aptMonth}>{new Date(apt.date).toLocaleString('default', { month: 'short' })}</Text>
                </View>
                <View style={styles.aptInfo}>
                  <Text style={[styles.aptVet, styles.pastText]}>{apt.vetName}</Text>
                  <Text style={[styles.aptTime, styles.pastText]}>{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Medical Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-hospital" size={20} color="#8B4513" />
            <Text style={styles.sectionTitle}>Medical Records</Text>
          </View>
          {dogRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="description" size={40} color="#ddd" />
              <Text style={styles.emptyText}>No medical records</Text>
            </View>
          ) : (
            dogRecords.map(record => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordIcon}>
                  <MaterialIcons name="description" size={20} color="#fff" />
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordDate}>{new Date(record.date).toLocaleDateString()}</Text>
                  {record.notes && <Text style={styles.recordNotes}>{record.notes}</Text>}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#999' },
  selectorSection: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 },
  dogList: { flexDirection: 'row', gap: 8 },
  dogTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  dogTabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  section: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  sectionTitleGray: { fontSize: 14, fontWeight: '700', color: '#999' },
  appointmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  pastCard: { opacity: 0.6 },
  aptDateBadge: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  pastBadge: { backgroundColor: '#ddd' },
  aptDate: { fontSize: 16, fontWeight: '700', color: '#fff' },
  aptMonth: { fontSize: 10, color: '#fff', fontWeight: '500' },
  aptInfo: { flex: 1 },
  aptVet: { fontSize: 14, fontWeight: '600', color: '#333' },
  aptTime: { fontSize: 12, color: '#999', marginTop: 2 },
  aptNotes: { fontSize: 11, color: '#bbb', marginTop: 4, fontStyle: 'italic' },
  pastText: { color: '#999' },
  recordCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FFD700', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  recordIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  recordDate: { fontSize: 12, color: '#999', marginTop: 2 },
  recordNotes: { fontSize: 11, color: '#bbb', marginTop: 4, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 12 },
  emptyText: { fontSize: 13, color: '#ccc', marginTop: 8 },
  spacer: { height: 40 },
});
