import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from './_layout';

interface VetAppointment {
  id: string;
  dogId: string;
  vetName: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export default function VetAppointmentsScreen() {
  const { household } = useAppContext();
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDogId, setSelectedDogId] = useState(household?.dogs[0]?.id || '');
  const [vetName, setVetName] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAppointments();
    if (household?.dogs[0]) {
      setSelectedDogId(household.dogs[0].id);
    }
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
      id: Date.now().toString(),
      dogId: selectedDogId,
      vetName,
      date,
      notes,
      createdAt: new Date().toISOString(),
    };
    const updated = [...appointments, newAppt];
    await AsyncStorage.setItem('vetAppointments', JSON.stringify(updated));
    setAppointments(updated);
    setVetName('');
    setDate('');
    setNotes('');
    setShowModal(false);
    Alert.alert('Success', 'Appointment scheduled!');
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

  const dogAppointments = appointments.filter(a => a.dogId === selectedDogId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="pets" size={32} color="#8B4513" />
        <Text style={styles.title}>Vet Appointments</Text>
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
        <Text style={styles.addButtonText}>Schedule Appointment</Text>
      </TouchableOpacity>

      {/* Appointments List */}
      <FlatList
        data={dogAppointments}
        keyExtractor={a => a.id}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentContent}>
              <MaterialIcons name="local-hospital" size={24} color="#8B4513" />
              <View style={styles.appointmentInfo}>
                <Text style={styles.vetName}>{item.vetName}</Text>
                <Text style={styles.appointmentDate}>{item.date}</Text>
                {item.notes && <Text style={styles.appointmentNotes}>{item.notes}</Text>}
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <MaterialIcons name="delete" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No appointments scheduled</Text>}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Schedule Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Vet Appointment</Text>
            <TextInput style={styles.input} placeholder="Vet name" value={vetName} onChangeText={setVetName} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
            <TextInput style={[styles.input, styles.notesInput]} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
            <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
              <Text style={styles.submitButtonText}>Schedule</Text>
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
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f9f9f9', flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  dogSelector: { paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  dogTab: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  dogTabActive: { backgroundColor: '#8B4513' },
  dogTabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  dogTabTextActive: { color: '#fff' },
  addButton: { marginHorizontal: 16, marginVertical: 12, backgroundColor: '#8B4513', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  appointmentCard: { marginVertical: 8, backgroundColor: '#FFF8DC', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, borderLeftColor: '#FFD700', justifyContent: 'space-between' },
  appointmentContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  appointmentInfo: { flex: 1 },
  vetName: { fontSize: 14, fontWeight: '600', color: '#333' },
  appointmentDate: { fontSize: 12, color: '#999', marginTop: 4 },
  appointmentNotes: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
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
