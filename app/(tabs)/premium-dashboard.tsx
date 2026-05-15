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
  Animated,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

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
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showVetModal, setShowVetModal] = useState(false);
  const [medicalTitle, setMedicalTitle] = useState('');
  const [medicalDate, setMedicalDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetDate, setVetDate] = useState(new Date().toISOString().split('T')[0]);
  const [vetNotes, setVetNotes] = useState('');

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadAllData();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
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
      Alert.alert('Oops', 'Please fill in title and date');
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
    Alert.alert('✓ Saved', 'Medical record added');
  };

  const addVetAppointment = async () => {
    if (!vetName || !vetDate) {
      Alert.alert('Oops', 'Please fill in vet name and date');
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
    Alert.alert('✓ Scheduled', 'Vet appointment added');
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
        <Text style={styles.lockedText}>Unlock to manage all your dog's health & activity</Text>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
        {/* Hero Profile Card */}
        <View style={styles.heroSection}>
          <View style={styles.profileCard}>
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
              {dogPhotos[selectedDogId] ? (
                <Image source={{ uri: dogPhotos[selectedDogId] }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <MaterialIcons name="photo-camera" size={48} color="#8B4513" />
                  <Text style={styles.photoText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <MaterialIcons name="edit" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.dogName}>{selectedDog?.name}</Text>
              <View style={styles.profileMeta}>
                <MaterialIcons name="pets" size={14} color="#8B4513" />
                <Text style={styles.dogBreed}>{selectedDog?.breed}</Text>
              </View>
              <View style={styles.profileMeta}>
                <MaterialIcons name="cake" size={14} color="#8B4513" />
                <Text style={styles.dogAge}>{selectedDog?.age} years old</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionLabel}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconBg}>
                <MaterialIcons name="directions-walk" size={24} color="#fff" />
              </View>
              <Text style={styles.statNumber}>{walkCount}</Text>
              <Text style={styles.statName}>Walks</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconBg}>
                <MaterialIcons name="restaurant" size={24} color="#fff" />
              </View>
              <Text style={styles.statNumber}>{feedCount}</Text>
              <Text style={styles.statName}>Meals</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconBg}>
                <MaterialIcons name="local-hospital" size={24} color="#fff" />
              </View>
              <Text style={styles.statNumber}>{dogApts.length}</Text>
              <Text style={styles.statName}>Vet Apts</Text>
            </View>
          </View>
        </View>

        {/* Medical Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>Medical Records</Text>
              <Text style={styles.sectionCount}>{dogRecords.length} record{dogRecords.length !== 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowMedicalModal(true)}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {dogRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="description" size={32} color="#ddd" />
              <Text style={styles.emptyText}>No records yet</Text>
            </View>
          ) : (
            dogRecords.map(record => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordLeft}>
                  <View style={styles.recordIcon}>
                    <MaterialIcons name="description" size={20} color="#8B4513" />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDate}>{record.date}</Text>
                    {record.notes && <Text style={styles.recordNotes} numberOfLines={1}>{record.notes}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteMedicalRecord(record.id)}>
                  <MaterialIcons name="close" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Vet Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>Vet Appointments</Text>
              <Text style={styles.sectionCount}>{dogApts.length} appointment{dogApts.length !== 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowVetModal(true)}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {dogApts.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="local-hospital" size={32} color="#ddd" />
              <Text style={styles.emptyText}>No appointments</Text>
            </View>
          ) : (
            dogApts.map(apt => (
              <View key={apt.id} style={styles.aptCard}>
                <View style={styles.aptLeft}>
                  <View style={styles.aptIcon}>
                    <MaterialIcons name="local-hospital" size={20} color="#fff" />
                  </View>
                  <View style={styles.aptInfo}>
                    <Text style={styles.aptVet}>{apt.vetName}</Text>
                    <Text style={styles.aptDate}>{apt.date}</Text>
                    {apt.notes && <Text style={styles.aptNotes} numberOfLines={1}>{apt.notes}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteVetAppointment(apt.id)}>
                  <MaterialIcons name="close" size={20} color="#ccc" />
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
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Medical Record</Text>
            <TextInput style={styles.input} placeholder="Record title (e.g., Vaccination)" value={medicalTitle} onChangeText={setMedicalTitle} placeholderTextColor="#ccc" />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={medicalDate} onChangeText={setMedicalDate} placeholderTextColor="#ccc" />
            <TextInput style={[styles.input, styles.notesInput]} placeholder="Notes (optional)" value={medicalNotes} onChangeText={setMedicalNotes} multiline numberOfLines={3} placeholderTextColor="#ccc" />
            <TouchableOpacity style={styles.submitBtn} onPress={addMedicalRecord}>
              <Text style={styles.submitBtnText}>Save Record</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowMedicalModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Vet Modal */}
      <Modal visible={showVetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Schedule Vet Appointment</Text>
            <TextInput style={styles.input} placeholder="Vet name" value={vetName} onChangeText={setVetName} placeholderTextColor="#ccc" />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={vetDate} onChangeText={setVetDate} placeholderTextColor="#ccc" />
            <TextInput style={[styles.input, styles.notesInput]} placeholder="Notes (optional)" value={vetNotes} onChangeText={setVetNotes} multiline numberOfLines={3} placeholderTextColor="#ccc" />
            <TouchableOpacity style={styles.submitBtn} onPress={addVetAppointment}>
              <Text style={styles.submitBtnText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowVetModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  lockedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20 },
  lockedTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  lockedText: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' },
  upgradeBtn: { backgroundColor: '#8B4513', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
  upgradeBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  dogSelector: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dogTab: { paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513' },
  dogTabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  content: { flex: 1 },
  heroSection: { paddingHorizontal: 16, paddingVertical: 20 },
  profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 5 },
  photoContainer: { position: 'relative' },
  photo: { width: 110, height: 110, borderRadius: 14 },
  photoPlaceholder: { width: 110, height: 110, borderRadius: 14, backgroundColor: '#FFF8DC', justifyContent: 'center', alignItems: 'center' },
  photoText: { fontSize: 11, color: '#8B4513', marginTop: 4, fontWeight: '500' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#8B4513', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  profileInfo: { flex: 1, justifyContent: 'center', gap: 6 },
  dogName: { fontSize: 20, fontWeight: '700', color: '#333' },
  profileMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dogBreed: { fontSize: 13, color: '#666', fontWeight: '500' },
  dogAge: { fontSize: 13, color: '#666', fontWeight: '500' },
  statsSection: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  statIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#8B4513' },
  statName: { fontSize: 11, color: '#999', marginTop: 4, fontWeight: '500' },
  section: { paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionCount: { fontSize: 12, color: '#999', marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 13, color: '#ccc', marginTop: 8 },
  recordCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#FFD700', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  recordLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF8DC', justifyContent: 'center', alignItems: 'center' },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
  recordDate: { fontSize: 11, color: '#999', marginTop: 2 },
  recordNotes: { fontSize: 11, color: '#bbb', marginTop: 4, fontStyle: 'italic' },
  aptCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#8B4513', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  aptLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aptIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center' },
  aptInfo: { flex: 1 },
  aptVet: { fontSize: 13, fontWeight: '600', color: '#333' },
  aptDate: { fontSize: 11, color: '#999', marginTop: 2 },
  aptNotes: { fontSize: 11, color: '#bbb', marginTop: 4, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, fontSize: 14, backgroundColor: '#fafafa' },
  notesInput: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#8B4513', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#999', fontWeight: '500', fontSize: 14 },
  spacer: { height: 40 },
});
