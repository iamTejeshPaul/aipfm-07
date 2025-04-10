import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useState(new Animated.Value(0))[0]; // Initial opacity set to 0
  const scaleAnim = useState(new Animated.Value(0.8))[0]; // Initial scale set to 0.8 (scaled down)
  const slideAnim = useState(new Animated.Value(100))[0]; // Initial slide position (from 100px to 0px)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        delay: 500,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, slideAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          alignItems: 'center',
        }}
      >
        <Image source={require('../assets/splash-icon.png')} style={styles.logo} />
        <Text style={styles.title}>AI Finance Manager</Text>
        <Text style={styles.subtitle}>Empowering your financial journey</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#B0B0B0',
    marginTop: 10,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default SplashScreen;