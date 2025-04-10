import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert, StyleSheet, View, Image } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Dashboard');
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    setLoading(true);
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      Alert.alert('Success', 'Account created successfully! Please verify your email and login.', [
        {
          text: 'OK',
          onPress: () => {},
        },
      ]);
    } catch (error) {
      console.error('Registration Error:', error.message);
      Alert.alert('Error', 'Failed to register: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return null;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Text style={styles.header}>Sign Up</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          <Icon name="envelope" size={22} color="#3498db" /> Email
        </Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#a0a0a0"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          <Icon name="lock" size={22} color="#3498db" /> Password
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#a0a0a0"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}>
            <Icon name={showPassword ? 'eye' : 'eye-slash'} size={22} color="#a0a0a0" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          <Icon name="lock" size={22} color="#3498db" /> Confirm Password
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm your password"
            placeholderTextColor="#a0a0a0"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}>
            <Icon name={showConfirmPassword ? 'eye' : 'eye-slash'} size={22} color="#a0a0a0" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.registerText}>Sign In</Text>
        </Text>
      </TouchableOpacity>

      <Text style={styles.noteText}>
        Immediately verify your account or the link will expire and you won't be able to access your account.
      </Text>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#34495e',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.1,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 45,
    color: 'white',
    fontWeight: '900',
    textAlign: 'center',
    zIndex: 1,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#2c3e50',
    color: 'white',
    fontSize: 16,
    borderColor: '#3498db',
    borderWidth: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
  },
  switchText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  registerText: {
    color: '#3498db',
    fontWeight: '700',
  },
  noteText: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen;
