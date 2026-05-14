import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
  }, []);
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Text style={styles.logo}>👑</Text>
        <Text style={styles.title}>MVPupper</Text>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logoContainer: { alignItems: 'center' },
  logo: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#8B4513' },
});
