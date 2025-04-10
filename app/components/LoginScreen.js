import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNavigated, setIsNavigated] = useState(false); // Prevent repeated navigation

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isNavigated) {
        if (user.emailVerified) {
          setIsNavigated(true);
          navigation.replace('Dashboard'); // Navigate to Dashboard
        } else if (!user.emailVerified && !isNavigated) {
          setIsNavigated(true); // Prevent repeated alert
          Alert.alert('Email Not Verified', 'Please verify your email before logging in.');
        }
      }
    });
    return () => unsubscribe();
  }, [navigation, isNavigated]);

  const handleLogin = async () => {
    setLoading(true);
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Your email is not verified. Please verify your email to continue.',
          [
            {
              text: 'Resend Email',
              onPress: resendVerificationEmail,
            },
            {
              text: 'OK',
            },
          ]
        );
        await signOut(auth);
        setLoading(false);
        return;
      }

      navigation.replace('Dashboard'); // Navigate to Dashboard if verified
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        Alert.alert('Verification Email Sent', 'Please check your email for the verification link.');
      } catch (error) {
        Alert.alert('Error', `Failed to send verification email: ${error.message}`);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset your password.');
      return;
    }
  
    const auth = getAuth();
  
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email has been sent. Please check your inbox.');
    } catch (error) {
      console.log('Error sending password reset email:', error);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
  
      Alert.alert('Error', errorMessage);
    }
  };
  

  const handleError = (error) => {
    switch (error.code) {
      case 'auth/user-not-found':
        Alert.alert('Error', 'No account found with this email. Please sign up.');
        break;
      case 'auth/wrong-password':
        Alert.alert('Error', 'Incorrect password. Please try again.');
        break;
      case 'auth/invalid-email':
        Alert.alert('Error', 'Invalid email format.');
        break;
      default:
        Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Text style={styles.header}>Sign In</Text>
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
            style={[styles.input, styles.passwordInput]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#3498db" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleForgotPassword} style={styles.switchButton}>
        <Text style={styles.switchText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchButton}>
        <Text style={styles.switchText}>
          Don't have an account? <Text style={styles.registerText}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

// Styles remain unchanged




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#34495e',
    borderRadius: 10,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
  },
  headerContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'contain',
    opacity: 0.1,
  },
  header: {
    fontSize: 45,
    color: 'white',
    fontWeight: '900',
    letterSpacing: 1,
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 15,
    elevation: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    marginLeft: -40,
    padding: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
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
  emailStatus: {
    fontSize: 14,
    color: 'red',
    marginTop: 5,
    textAlign: 'center',
  },
  resendLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  resendText: {
    color: '#3498db',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default LoginScreen;
