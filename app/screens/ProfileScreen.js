import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [registrationDate, setRegistrationDate] = useState(null);

  const database = getDatabase();

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserData(currentUser.uid);
    } else {
      Alert.alert('Error', 'You must be logged in to view your profile.');
      navigation.navigate('Login');
    }
  }, []);

  const fetchUserData = (uid) => {
    const userRef = ref(database, 'users/' + uid);

    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRegistrationDate(data.registrationDate); // Assuming registrationDate is stored
      } else {
        Alert.alert('No Data', 'No profile information found.');
      }
    });
  };

  const handleLogout = () => {
    getAuth().signOut()
      .then(() => {
        navigation.navigate('Login');
      })
      .catch((error) => {
        Alert.alert('Error', 'Unable to log out. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      {/* Profile Info */}
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.profileLabel}>Email: {user?.email}</Text>
      <Text style={styles.profileLabel}>Registered On: {registrationDate ? registrationDate : 'N/A'}</Text>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
