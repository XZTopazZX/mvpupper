import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MedicalRecordsScreen() {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = () => {
    if (!title) { Alert.alert('Error', 'Please enter a title'); return; }
    const newRecord = { id: Date.now().toString(), title, date };
    setRecords([...records, newRecord]);
    setTitle('');
    setShowModal(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Record</Text>
      </TouchableOpacity>
      {records.map(r => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.cardTitle}>{r.title}</Text>
          <Text style={styles.cardDate}>{r.date}</Text>
        </View>
      ))}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medical Record</Text>
            <TextInput style={styles.input} placeholder="Record title" value={title} onChangeText={setTitle} />
            <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
              <Text style={styles.submitButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: { marginHorizontal: 16, marginVertical: 16, backgroundColor: '#8B4513', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  card: { marginHorizontal: 16, marginVertical: 8, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, borderLeftWidth: 4, borderLeftColor: '#8B4513' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardDate: { fontSize: 12, color: '#999', marginTop: 4 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
  submitButton: { backgroundColor: '#8B4513', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: '600' },
});
