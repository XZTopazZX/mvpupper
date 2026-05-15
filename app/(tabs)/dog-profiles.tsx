import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function DogProfilesScreen() {
  const { household, updateHousehold } = useAppContext();
  const [selectedDog, setSelectedDog] = useState(household?.dogs[0] || null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editAge, setEditAge] = useState('');
  const [dogPhotos, setDogPhotos] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadDogPhotos();
    if (household?.dogs[0]) {
      setSelectedDog(household.dogs[0]);
    }
  }, [household]);

  const loadDogPhotos = async () => {
    try {
      const saved = await AsyncStorage.getItem('dogPhotos');
      if (saved) {
        setDogPhotos(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading dog photos:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && selectedDog) {
        const uri = result.assets[0].uri;
        const updated = { ...dogPhotos, [selectedDog.id]: uri };
        await AsyncStorage.setItem('dogPhotos', JSON.stringify(updated));
        setDogPhotos(updated);
        Alert.alert('Success', 'Dog photo updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Error picking image:', error);
    }
  };

  const handleEditDog = () => {
    if (selectedDog) {
      setEditName(selectedDog.name);
      setEditBreed(selectedDog.breed);
      setEditAge(selectedDog.age.toString());
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName || !editBreed || !editAge) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (household && selectedDog) {
      const updated = {
        ...household,
        dogs: household.dogs.map(d =>
          d.id === selectedDog.id
            ? { ...d, name: editName, breed: editBreed, age: parseInt(editAge) }
            : d
        ),
      };
      await updateHousehold(updated);
      setSelectedDog({ ...selectedDog, name: editName, breed: editBreed, age: parseInt(editAge) });
      setShowEditModal(false);
      Alert.alert('Success', 'Dog profile updated!');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Dog Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Dogs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogList}>
          {household?.dogs.map(dog => (
            <TouchableOpacity
              key={dog.id}
              style={[styles.dogCard, selectedDog?.id === dog.id && styles.dogCardActive]}
              onPress={() => setSelectedDog(dog)}
            >
              {dogPhotos[dog.id] ? (
                <Image source={{ uri: dogPhotos[dog.id] }} style={styles.dogPhoto} />
              ) : (
                <View style={styles.dogPhotoPlaceholder}>
                  <MaterialIcons name="pets" size={32} color="#8B4513" />
                </View>
              )}
              <Text style={styles.dogName}>{dog.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Dog Details */}
      {selectedDog && (
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>{selectedDog.name}</Text>
            <TouchableOpacity onPress={handleEditDog}>
              <MaterialIcons name="edit" size={24} color="#8B4513" />
            </TouchableOpacity>
          </View>

          {/* Photo Section */}
          <View style={styles.photoSection}>
            {dogPhotos[selectedDog.id] ? (
              <Image source={{ uri: dogPhotos[selectedDog.id] }} style={styles.largePhoto} />
            ) : (
              <View style={styles.largePhotoPlaceholder}>
                <MaterialIcons name="pets" size={64} color="#ccc" />
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {dogPhotos[selectedDog.id] ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Breed</Text>
              <Text style={styles.infoValue}>{selectedDog.breed}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{selectedDog.age} years</Text>
            </View>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {selectedDog?.name}</Text>
            <TextInput
              style={styles.input}
              placeholder="Dog name"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.input}
              placeholder="Breed"
              value={editBreed}
              onChangeText={setEditBreed}
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={editAge}
              onChangeText={setEditAge}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
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
  section: { paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  dogList: { marginHorizontal: -16, paddingHorizontal: 16 },
  dogCard: { marginRight: 12, alignItems: 'center', paddingVertical: 8, borderRadius: 12, paddingHorizontal: 8, backgroundColor: '#f9f9f9' },
  dogCardActive: { backgroundColor: '#FFF8DC', borderWidth: 2, borderColor: '#8B4513' },
  dogPhoto: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  dogPhotoPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  dogName: { fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'center' },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  profileTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  photoSection: { marginBottom: 20 },
  largePhoto: { width: '100%', height: 300, borderRadius: 12, marginBottom: 12 },
  largePhotoPlaceholder: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  uploadButton: { backgroundColor: '#8B4513', flexDirection: 'row', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadButtonText: { color: '#fff', fontWeight: '600' },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoCard: { flex: 1, backgroundColor: '#FFF8DC', borderRadius: 8, padding: 12, alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 18, fontWeight: 'bold', color: '#8B4513' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  saveButton: { backgroundColor: '#8B4513', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  cancelButton: { color: '#999', textAlign: 'center', paddingVertical: 8 },
});
