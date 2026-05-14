import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function VetAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [vetName, setVetName] = useState('');
  const [date, setDate] = useState('');

  const handleAdd = () => {
    if (!vetName || !date) { Alert.alert('Error', 'Please fill all fields'); return; }
    const newAppt = { id: Date.now().toString(), vetName, date };
    setAppointments([...appointments, newAppt]);
    setVetName('');
    setDate('');
    setShowModal(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="pets" size={32} color="#8B4513" />
        <Text style={styles.title}>Vet Appointments</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Schedule Appointment</Text>
      </TouchableOpacity>
      {appointments.map(a => (
        <View key={a.id} style={styles.appointmentCard}>
          <MaterialIcons name="local-hospital" size={24} color="#8B4513" />
          <View style={styles.appointmentInfo}>
            <Text style={styles.vetName}>{a.vetName}</Text>
            <Text style={styles.appointmentDate}>{a.date}</Text>
          </View>
        </View>
      ))}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Vet Appointment</Text>
            <TextInput style={styles.input} placeholder="Vet name" value={vetName} onChangeText={setVetName} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
            <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
              <Text style={styles.submitButtonText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f9f9f9', flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: { marginHorizontal: 16, marginVertical: 16, backgroundColor: '#8B4513', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  appointmentCard: { marginHorizontal: 16, marginVertical: 8, backgroundColor: '#FFF8DC', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  appointmentInfo: { flex: 1 },
  vetName: { fontSize: 14, fontWeight: '600', color: '#333' },
  appointmentDate: { fontSize: 12, color: '#999', marginTop: 4 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  submitButton: { backgroundColor: '#8B4513', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  submitButtonText: { color: '#fff', fontWeight: '600' },
  cancelButton: { color: '#999', textAlign: 'center', paddingVertical: 8 },
});
