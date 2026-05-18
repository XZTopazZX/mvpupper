import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../_layout';

interface VetAppointment {
  id: string;
  dogId: string;
  vetName: string;
  date: string;
  notes?: string;
}

export default function VetAppointmentsScreen() {
  const { household } = useAppContext();
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [vetName, setVetName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadAppointments();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [household]);

  const loadAppointments = async () => {
    try {
      const saved = await AsyncStorage.getItem('vetAppointments');
      if (saved) {
        setAppointments(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const handleAdd = async () => {
    if (!vetName || !date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const newAppt: VetAppointment = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      dogId: selectedDogId!,
      vetName,
      date,
      notes,
    };
    const updated = [...appointments, newAppt];
    await AsyncStorage.setItem('vetAppointments', JSON.stringify(updated));
    setAppointments(updated);
    setVetName('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowModal(false);
    Alert.alert('✅ Scheduled', 'Vet appointment added!');
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Appointment', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const updated = appointments.filter(a => a.id !== id);
          await AsyncStorage.setItem('vetAppointments', JSON.stringify(updated));
          setAppointments(updated);
        },
        style: 'destructive',
      },
    ]);
  };

  const dogAppointments = appointments
    .filter(a => a.dogId === selectedDogId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingAppointments = dogAppointments.filter(a => new Date(a.date) >= new Date());
  const pastAppointments = dogAppointments.filter(a => new Date(a.date) < new Date());

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vet Appointments</Text>
          <Text style={styles.subtitle}>Schedule and track visits</Text>
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
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Upcoming</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-note" size={48} color="#ddd" />
              <Text style={styles.emptyTitle}>No upcoming appointments</Text>
              <Text style={styles.emptyText}>Schedule your next vet visit</Text>
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
                  {apt.notes && <Text style={styles.aptNotes} numberOfLines={1}>{apt.notes}</Text>}
                </View>
                <TouchableOpacity onPress={() => handleDelete(apt.id)}>
                  <MaterialIcons name="close" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <View style={styles.appointmentsSection}>
            <Text style={styles.sectionLabelGray}>Past Appointments</Text>
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

        {/* Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Schedule Vet Appointment</Text>
              <TextInput
                style={styles.input}
                placeholder="Vet name"
                value={vetName}
                onChangeText={setVetName}
                placeholderTextColor="#ccc"
              />
              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                placeholderTextColor="#ccc"
              />
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
                <Text style={styles.submitBtnText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  sectionLabelGray: { fontSize: 14, fontWeight: '700', color: '#999', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  dogList: { flexDirection: 'row', gap: 8 },
  dogTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  dogTabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  appointmentsSection: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  emptyState: { alignItems: 'center', paddingVertical: 50, backgroundColor: '#fff', borderRadius: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#999', marginTop: 6 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, fontSize: 14, backgroundColor: '#fafafa' },
  notesInput: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#8B4513', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { color: '#999', textAlign: 'center', paddingVertical: 12, fontWeight: '500' },
  spacer: { height: 40 },
});
