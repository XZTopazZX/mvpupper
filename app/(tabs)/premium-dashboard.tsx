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
  Image,
  FlatList,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface MedicalRecord {
  id: string;
  dogId: string;
  title: string;
  date: string;
  notes?: string;
}

interface VetAppointment {
  id: string;
  dogId: string;
  vetName: string;
  date: string;
  notes?: string;
}

export default function PremiumDashboardScreen() {
  const { household, isPremium } = useAppContext();
  const [selectedDogId, setSelectedDogId] = useState(household?.dogs[0]?.id || '');
  const [dogPhotos, setDogPhotos] = useState<{ [key: string]: string }>({});
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vetAppointments, setVetAppointments] = useState<VetAppointment[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Modals
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showVetModal, setShowVetModal] = useState(false);
  const [medicalTitle, setMedicalTitle] = useState('');
  const [medicalDate, setMedicalDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetDate, setVetDate] = useState(new Date().toISOString().split('T')[0]);
  const [vetNotes, setVetNotes] = useState('');

  useEffect(() => {
    loadAllData();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
  }, [household]);

  const loadAllData = async () => {
    try {
      const [photos, records, apts, acts] = await Promise.all([
        AsyncStorage.getItem('dogPhotos'),
        AsyncStorage.getItem('medicalRecords'),
        AsyncStorage.getItem('vetAppointments'),
        AsyncStorage.getItem('activities'),
      ]);
      if (photos) setDogPhotos(JSON.parse(photos));
      if (records) setMedicalRecords(JSON.parse(records));
      if (apts) setVetAppointments(JSON.parse(apts));
      if (acts) setActivities(JSON.parse(acts));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const selectedDog = household?.dogs.find(d => d.id === selectedDogId);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = { ...dogPhotos, [selectedDogId]: result.assets[0].uri };
      setDogPhotos(newPhotos);
      await AsyncStorage.setItem('dogPhotos', JSON.stringify(newPhotos));
    }
  };

  const addMedicalRecord = async () => {
    if (!medicalTitle || !medicalDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const record: MedicalRecord = {
      id: Date.now().toString(),
      dogId: selectedDogId,
      title: medicalTitle,
      date: medicalDate,
      notes: medicalNotes,
    };
    const updated = [...medicalRecords, record];
    setMedicalRecords(updated);
    await AsyncStorage.setItem('medicalRecords', JSON.stringify(updated));
    setMedicalTitle('');
    setMedicalDate(new Date().toISOString().split('T')[0]);
    setMedicalNotes('');
    setShowMedicalModal(false);
  };

  const addVetAppointment = async () => {
    if (!vetName || !vetDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const apt: VetAppointment = {
      id: Date.now().toString(),
      dogId: selectedDogId,
      vetName,
      date: vetDate,
      notes: vetNotes,
    };
    const updated = [...vetAppointments, apt];
    setVetAppointments(updated);
    await AsyncStorage.setItem('vetAppointments', JSON.stringify(updated));
    setVetName('');
    setVetDate(new Date().toISOString().split('T')[0]);
    setVetNotes('');
    setShowVetModal(false);
  };

  const deleteMedicalRecord = async (id: string) => {
    const updated = medicalRecords.filter(r => r.id !== id);
    setMedicalRecords(updated);
    await AsyncStorage.setItem('medicalRecords', JSON.stringify(updated));
  };

  const deleteVetAppointment = async (id: string) => {
    const updated = vetAppointments.filter(a => a.id !== id);
    setVetAppointments(updated);
    await AsyncStorage.setItem('vetAppointments', JSON.stringify(updated));
  };

  const dogRecords = medicalRecords.filter(r => r.dogId === selectedDogId);
  const dogApts = vetAppointments.filter(a => a.dogId === selectedDogId);
  const dogActivities = activities.filter(a => a.dogId === selectedDogId);
  const walkCount = dogActivities.filter(a => a.type === 'walk').length;
  const feedCount = dogActivities.filter(a => a.type === 'food').length;

  if (!isPremium) {
    return (
      <View style={styles.lockedContainer}>
        <MaterialIcons name="lock" size={64} color="#FFD700" />
        <Text style={styles.lockedTitle}>Premium Feature</Text>
        <Text style={styles.lockedText}>Upgrade to access the complete dog dashboard</Text>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dog Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogSelector}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
              {dogPhotos[selectedDogId] ? (
                <Image source={{ uri: dogPhotos[selectedDogId] }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <MaterialIcons name="photo-camera" size={48} color="#8B4513" />
                </View>
              )}
              <View style={styles.editBadge}>
                <MaterialIcons name="edit" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.dogName}>{selectedDog?.name}</Text>
              <Text style={styles.dogBreed}>{selectedDog?.breed}</Text>
              <Text style={styles.dogAge}>{selectedDog?.age} years old</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <MaterialIcons name="directions-walk" size={28} color="#8B4513" />
              <Text style={styles.statNumber}>{walkCount}</Text>
              <Text style={styles.statLabel}>Walks</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="restaurant" size={28} color="#8B4513" />
              <Text style={styles.statNumber}>{feedCount}</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="local-hospital" size={28} color="#8B4513" />
              <Text style={styles.statNumber}>{dogApts.length}</Text>
              <Text style={styles.statLabel}>Vet Apts</Text>
            </View>
          </View>
        </View>

        {/* Medical Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Records</Text>
            <TouchableOpacity onPress={() => setShowMedicalModal(true)}>
              <MaterialIcons name="add-circle" size={28} color="#8B4513" />
            </TouchableOpacity>
          </View>
          {dogRecords.length === 0 ? (
            <Text style={styles.emptyText}>No medical records yet</Text>
          ) : (
            dogRecords.map(record => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordContent}>
                  <MaterialIcons name="description" size={24} color="#8B4513" />
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDate}>{record.date}</Text>
                    {record.notes && <Text style={styles.recordNotes}>{record.notes}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteMedicalRecord(record.id)}>
                  <MaterialIcons name="delete" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Vet Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vet Appointments</Text>
            <TouchableOpacity onPress={() => setShowVetModal(true)}>
              <MaterialIcons name="add-circle" size={28} color="#8B4513" />
            </TouchableOpacity>
          </View>
          {dogApts.length === 0 ? (
            <Text style={styles.emptyText}>No appointments scheduled</Text>
          ) : (
            dogApts.map(apt => (
              <View key={apt.id} style={styles.aptCard}>
                <View style={styles.aptContent}>
                  <MaterialIcons name="local-hospital" size={24} color="#8B4513" />
                  <View style={styles.aptInfo}>
                    <Text style={styles.aptVet}>{apt.vetName}</Text>
                    <Text style={styles.aptDate}>{apt.date}</Text>
                    {apt.notes && <Text style={styles.aptNotes}>{apt.notes}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteVetAppointment(apt.id)}>
                  <MaterialIcons name="delete" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Medical Modal */}
      <Modal visible={showMedicalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medical Record</Text>
              <TouchableOpacity onPress={() => setShowMedicalModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Record title" value={medicalTitle} onChangeText={setMedicalTitle} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={medicalDate} onChangeText={setMedicalDate} />
            <TextInput style={[styles.input, styles.notesInput]} placeholder="Notes (optional)" value={medicalNotes} onChangeText={setMedicalNotes} multiline numberOfLines={3} />
            <TouchableOpacity style={styles.submitBtn} onPress={addMedicalRecord}>
              <Text style={styles.submitBtnText}>Save Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Vet Modal */}
      <Modal visible={showVetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Vet Appointment</Text>
              <TouchableOpacity onPress={() => setShowVetModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Vet name" value={vetName} onChangeText={setVetName} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={vetDate} onChangeText={setVetDate} />
            <TextInput style={[styles.input, styles.notesInput]} placeholder="Notes (optional)" value={vetNotes} onChangeText={setVetNotes} multiline numberOfLines={3} />
            <TouchableOpacity style={styles.submitBtn} onPress={addVetAppointment}>
              <Text style={styles.submitBtnText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  lockedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  lockedTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  lockedText: { fontSize: 14, color: '#666', marginBottom: 24 },
  upgradeBtn: { backgroundColor: '#8B4513', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  upgradeBtnText: { color: '#fff', fontWeight: '600' },
  dogSelector: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  dogTab: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513' },
  dogTabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  content: { flex: 1 },
  section: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  profileCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  photoContainer: { position: 'relative' },
  photo: { width: 100, height: 100, borderRadius: 12 },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#FFF8DC', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#8B4513', borderRadius: 20, padding: 6 },
  profileInfo: { flex: 1, justifyContent: 'center' },
  dogName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dogBreed: { fontSize: 14, color: '#666', marginTop: 4 },
  dogAge: { fontSize: 12, color: '#999', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#8B4513', marginTop: 8 },
  statLabel: { fontSize: 11, color: '#999', marginTop: 4 },
  emptyText: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
  recordCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  recordContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  recordDate: { fontSize: 12, color: '#999', marginTop: 2 },
  recordNotes: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  aptCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  aptContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aptInfo: { flex: 1 },
  aptVet: { fontSize: 14, fontWeight: '600', color: '#333' },
  aptDate: { fontSize: 12, color: '#999', marginTop: 2 },
  aptNotes: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 14 },
  notesInput: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#8B4513', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  spacer: { height: 40 },
});
