import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DogProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dog Profile</Text>
      <Text style={styles.placeholder}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
});
