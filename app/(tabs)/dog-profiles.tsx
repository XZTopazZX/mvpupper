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
  Animated,
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
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadDogPhotos();
    if (household?.dogs[0]) {
      setSelectedDog(household.dogs[0]);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
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
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && selectedDog) {
        const uri = result.assets[0].uri;
        const updated = { ...dogPhotos, [selectedDog.id]: uri };
        await AsyncStorage.setItem('dogPhotos', JSON.stringify(updated));
        setDogPhotos(updated);
        Alert.alert('✅ Photo Updated', 'Dog photo saved!');
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
      Alert.alert('✅ Updated', 'Dog profile saved!');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dog Profiles</Text>
          <Text style={styles.subtitle}>Manage your pups</Text>
        </View>

        {/* Dog Selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.sectionLabel}>Your Dogs</Text>
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
                    <MaterialIcons name="pets" size={28} color="#8B4513" />
                  </View>
                )}
                <Text style={[styles.dogName, selectedDog?.id === dog.id && styles.dogNameActive]}>{dog.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Dog Details */}
        {selectedDog && (
          <View style={styles.detailsSection}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View>
                <Text style={styles.profileTitle}>{selectedDog.name}</Text>
                <Text style={styles.profileSubtitle}>{selectedDog.breed} • {selectedDog.age} years</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={handleEditDog}>
                <MaterialIcons name="edit" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Photo Section */}
            <TouchableOpacity style={styles.photoSection} onPress={pickImage}>
              {dogPhotos[selectedDog.id] ? (
                <Image source={{ uri: dogPhotos[selectedDog.id] }} style={styles.largePhoto} />
              ) : (
                <View style={styles.largePhotoPlaceholder}>
                  <MaterialIcons name="pets" size={60} color="#ddd" />
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <MaterialIcons name="photo-camera" size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Info Cards */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <MaterialIcons name="pets" size={20} color="#fff" />
                </View>
                <Text style={styles.infoLabel}>Breed</Text>
                <Text style={styles.infoValue}>{selectedDog.breed}</Text>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <MaterialIcons name="cake" size={20} color="#fff" />
                </View>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{selectedDog.age} yrs</Text>
              </View>
            </View>

            {/* Photo Button */}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <MaterialIcons name="add-a-photo" size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {dogPhotos[selectedDog.id] ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit Modal */}
        <Modal visible={showEditModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Edit {selectedDog?.name}</Text>
              <TextInput
                style={styles.input}
                placeholder="Dog name"
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor="#ccc"
              />
              <TextInput
                style={styles.input}
                placeholder="Breed"
                value={editBreed}
                onChangeText={setEditBreed}
                placeholderTextColor="#ccc"
              />
              <TextInput
                style={styles.input}
                placeholder="Age"
                value={editAge}
                onChangeText={setEditAge}
                keyboardType="number-pad"
                placeholderTextColor="#ccc"
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
  dogList: { marginHorizontal: -16, paddingHorizontal: 16 },
  dogCard: { marginRight: 12, alignItems: 'center', paddingVertical: 8, borderRadius: 14, paddingHorizontal: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: '#f0f0f0' },
  dogCardActive: { backgroundColor: '#FFF8DC', borderColor: '#8B4513' },
  dogPhoto: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  dogPhotoPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  dogName: { fontSize: 12, fontWeight: '600', color: '#666', textAlign: 'center' },
  dogNameActive: { color: '#8B4513', fontWeight: '700' },
  detailsSection: { paddingHorizontal: 16, paddingVertical: 16 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  profileTitle: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 4 },
  profileSubtitle: { fontSize: 13, color: '#999' },
  editBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center' },
  photoSection: { position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  largePhoto: { width: '100%', height: 240, borderRadius: 16 },
  largePhotoPlaceholder: { width: '100%', height: 240, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  cameraOverlay: { position: 'absolute', bottom: 12, right: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#8B4513', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 4, fontWeight: '500' },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#8B4513' },
  uploadButton: { backgroundColor: '#8B4513', flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  uploadButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, fontSize: 14, backgroundColor: '#fafafa' },
  saveButton: { backgroundColor: '#8B4513', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelButton: { color: '#999', textAlign: 'center', paddingVertical: 12, fontWeight: '500' },
  spacer: { height: 40 },
});
