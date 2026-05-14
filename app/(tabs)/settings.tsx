import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAppContext } from '../_layout';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SettingsScreen() {
  const { user, household, isPremium, setIsPremium, setUser, setHousehold, updateHousehold } = useAppContext();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [foodAlertHours, setFoodAlertHours] = useState('8');
  const [waterAlertHours, setWaterAlertHours] = useState('4');
  const [poopAlertHours, setPoopAlertHours] = useState('12');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);

  const handleUpgradePremium = async () => {
    Alert.alert(
      'Upgrade to MVPupper Premium',
      'Choose your subscription plan:',
      [
        {
          text: '$1.99/month',
          onPress: async () => {
            setIsPremium(true);
            await AsyncStorage.setItem('isPremium', JSON.stringify(true));
            Alert.alert('Success', 'You are now a premium member!');
          },
        },
        {
          text: '$29.99/year',
          onPress: async () => {
            setIsPremium(true);
            await AsyncStorage.setItem('isPremium', JSON.stringify(true));
            Alert.alert('Success', 'You are now a premium member!');
          },
        },
        { text: 'Cancel', onPress: () => {} },
      ]
    );
  };

  const handleCopyInviteCode = () => {
    if (household?.inviteCode) {
      // In a real app, use react-native-clipboard
      Alert.alert('Invite Code', `${household.inviteCode}\n\nShare this code with friends to invite them to your household!`);
      setInviteCodeCopied(true);
      setTimeout(() => setInviteCodeCopied(false), 2000);
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (userId === user?.id) {
      Alert.alert('Error', 'You cannot remove yourself from the household');
      return;
    }

    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the household?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Remove',
          onPress: async () => {
            if (household) {
              const updated = {
                ...household,
                members: household.members.filter(m => m.userId !== userId),
              };
              await updateHousehold(updated);
              Alert.alert('Success', 'Member removed from household');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('household');
          await AsyncStorage.removeItem('activities');
          setUser(null);
          setHousehold(null);
          router.replace('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || 'Unknown'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Household</Text>
          <Text style={styles.value}>{household?.name || 'None'}</Text>
        </View>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.premiumText}>Premium Member</Text>
          </View>
        )}
      </View>

      {/* Household Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Household Members</Text>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setShowInviteModal(true)}
          >
            <MaterialIcons name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {household?.members && household.members.length > 0 ? (
          household.members.map(member => (
            <View key={member.userId} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <MaterialIcons name="person" size={24} color="#8B4513" />
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberJoined}>
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              {member.userId !== user?.id && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.userId)}
                  style={styles.removeButton}
                >
                  <MaterialIcons name="close" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No members yet</Text>
        )}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ccc', true: '#8B4513' }}
          />
        </View>
        {notificationsEnabled && (
          <>
            <View style={styles.settingItem}>
              <Text style={styles.label}>Alert if no food in (hours)</Text>
              <TextInput
                style={styles.smallInput}
                value={foodAlertHours}
                onChangeText={setFoodAlertHours}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.label}>Alert if no water in (hours)</Text>
              <TextInput
                style={styles.smallInput}
                value={waterAlertHours}
                onChangeText={setWaterAlertHours}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.label}>Alert if no poop in (hours)</Text>
              <TextInput
                style={styles.smallInput}
                value={poopAlertHours}
                onChangeText={setPoopAlertHours}
                keyboardType="number-pad"
              />
            </View>
          </>
        )}
      </View>

      {/* Premium */}
      {!isPremium && (
        <View style={styles.section}>
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumTitle}>🌟 Upgrade to Premium</Text>
            <Text style={styles.premiumDescription}>
              Unlock unlimited dogs, smart reminders, and medical tracking!
            </Text>
            <TouchableOpacity
              style={styles.premiumUpgradeButton}
              onPress={handleUpgradePremium}
            >
              <Text style={styles.premiumUpgradeText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Members</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Share this code with friends to invite them to your household:
              </Text>

              <View style={styles.inviteCodeBox}>
                <Text style={styles.inviteCode}>{household?.inviteCode || 'N/A'}</Text>
              </View>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyInviteCode}
              >
                <MaterialIcons name="content-copy" size={20} color="#fff" />
                <Text style={styles.copyButtonText}>
                  {inviteCodeCopied ? 'Copied!' : 'Copy Code'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.inviteNote}>
                Members can join by entering this code during setup or in the app settings.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowInviteModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inviteButton: {
    backgroundColor: '#8B4513',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  memberJoined: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginTop: 8,
    backgroundColor: '#f9f9f9',
  },
  premiumBanner: {
    backgroundColor: '#FFF8DC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  premiumUpgradeButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumUpgradeText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inviteCodeBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  inviteNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
