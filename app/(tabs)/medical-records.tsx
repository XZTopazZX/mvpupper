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

interface MedicalRecord {
  id: string;
  dogId: string;
  title: string;
  date: string;
  notes?: string;
}

export default function MedicalRecordsScreen() {
  const { household } = useAppContext();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadRecords();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [household]);

  const loadRecords = async () => {
    try {
      const saved = await AsyncStorage.getItem('medicalRecords');
      if (saved) {
        setRecords(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading medical records:', error);
    }
  };

  const handleAdd = async () => {
    if (!title || !date) {
      Alert.alert('Error', 'Please enter title and date');
      return;
    }
    const newRecord: MedicalRecord = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      dogId: selectedDogId!,
      title,
      date,
      notes,
    };
    const updated = [...records, newRecord];
    await AsyncStorage.setItem('medicalRecords', JSON.stringify(updated));
    setRecords(updated);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowModal(false);
    Alert.alert('✅ Saved', 'Medical record added!');
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Record', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const updated = records.filter(r => r.id !== id);
          await AsyncStorage.setItem('medicalRecords', JSON.stringify(updated));
          setRecords(updated);
        },
        style: 'destructive',
      },
    ]);
  };

  const dogRecords = records
    .filter(r => r.dogId === selectedDogId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Medical Records</Text>
          <Text style={styles.subtitle}>Keep track of health</Text>
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

        {/* Records List */}
        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <Text style={styles.sectionLabel}>Records</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {dogRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="description" size={48} color="#ddd" />
              <Text style={styles.emptyTitle}>No records yet</Text>
              <Text style={styles.emptyText}>Add your first medical record</Text>
            </View>
          ) : (
            dogRecords.map(record => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordLeft}>
                  <View style={styles.recordIcon}>
                    <MaterialIcons name="description" size={20} color="#fff" />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDate}>{new Date(record.date).toLocaleDateString()}</Text>
                    {record.notes && <Text style={styles.recordNotes} numberOfLines={1}>{record.notes}</Text>}
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(record.id)}>
                  <MaterialIcons name="close" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Add Medical Record</Text>
              <TextInput
                style={styles.input}
                placeholder="Record title (e.g., Vaccination)"
                value={title}
                onChangeText={setTitle}
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
                <Text style={styles.submitBtnText}>Save Record</Text>
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
  dogList: { flexDirection: 'row', gap: 8 },
  dogTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  dogTabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  recordsSection: { paddingHorizontal: 16, paddingVertical: 16 },
  recordsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  emptyState: { alignItems: 'center', paddingVertical: 50, backgroundColor: '#fff', borderRadius: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#999', marginTop: 6 },
  recordCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FFD700', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  recordLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  recordIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center' },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  recordDate: { fontSize: 12, color: '#999', marginTop: 2 },
  recordNotes: { fontSize: 11, color: '#bbb', marginTop: 4, fontStyle: 'italic' },
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
