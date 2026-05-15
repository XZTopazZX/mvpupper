import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../_layout';
import { useRouter } from 'expo-router';

interface MedicalRecord {
  id: string;
  dogId: string;
  title: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export default function MedicalRecordsScreen() {
  const { household } = useAppContext();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDogId, setSelectedDogId] = useState(household?.dogs[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadRecords();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
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
      id: Date.now().toString(),
      dogId: selectedDogId,
      title,
      date,
      notes,
      createdAt: new Date().toISOString(),
    };
    const updated = [...records, newRecord];
    await AsyncStorage.setItem('medicalRecords', JSON.stringify(updated));
    setRecords(updated);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowModal(false);
    Alert.alert('Success', 'Medical record added!');
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

  const dogRecords = records.filter(r => r.dogId === selectedDogId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>
      </View>

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

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Record</Text>
      </TouchableOpacity>

      {/* Records List */}
      <FlatList
        data={dogRecords}
        keyExtractor={r => r.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
              {item.notes && <Text style={styles.cardNotes}>{item.notes}</Text>}
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <MaterialIcons name="delete" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No records yet</Text>}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Add Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medical Record</Text>
            <TextInput style={styles.input} placeholder="Record title (e.g., Vaccination)" value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
            <TextInput style={[styles.input, styles.notesInput]} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
            <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
              <Text style={styles.submitButtonText}>Add Record</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  dogSelector: { paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  dogTab: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513' },
  dogTabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  addButton: { marginHorizontal: 16, marginVertical: 12, backgroundColor: '#8B4513', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { marginVertical: 8, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#8B4513' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardDate: { fontSize: 12, color: '#999', marginTop: 4 },
  cardNotes: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', color: '#999', paddingVertical: 32, fontSize: 14 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  notesInput: { height: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#8B4513', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  submitButtonText: { color: '#fff', fontWeight: '600' },
  cancelButton: { color: '#999', textAlign: 'center', paddingVertical: 8 },
});
