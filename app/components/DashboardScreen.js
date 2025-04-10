import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const DashboardScreen = () => {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigation.replace('Login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        Alert.alert('Success', 'You have successfully logged out.');
        navigation.replace('Login');
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Error', 'An error occurred while logging out.');
      });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const registrationDate = new Date(user.metadata.creationTime);
  const registrationMonth = registrationDate.toLocaleString('default', { month: 'short' });
  const registrationYear = registrationDate.getFullYear();

  return (
    <View style={styles.container}>
      {/* Title Bar with App Name and Logout Button */}
      <View style={styles.titleBar}>
        <Text style={styles.appName}>AIPFM</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <View style={styles.iconCircle}>
            <FontAwesome name="sign-out" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Banner Section */}
        <View style={styles.banner}>
          <View style={styles.greetingWrapper}>
            <Text style={styles.greetingText}>Hey, {user.displayName || user.email.split('@')[0]}</Text>
            <Text style={styles.welcomeText}>Welcome back to your dashboard!</Text>
          </View>
          <View style={styles.registrationInfo}>
            <Text style={styles.monthText}>{registrationMonth}</Text>
            <View style={styles.yearBox}>
              <Text style={styles.yearText}>{registrationYear}</Text>
            </View>
          </View>
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          {[ 
            { name: 'Expenses', icon: 'money', route: 'HomeScreen' },
            { name: 'Reports', icon: 'bar-chart', route: 'ReportsScreen' },
            { name: 'Income', icon: 'money', route: 'IncomeScreen' },
            { name: 'Goals', icon: 'bullseye', route: 'GoalsScreen' },
            { name: 'Submit a Ticket', icon: 'ticket', route: 'HelpDeskScreen' },
            { name: 'Settings', icon: 'cogs', route: 'SettingsScreen' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate(item.route)}  // Navigate to the correct screen
            >
              <FontAwesome name={item.icon} size={30} color="#ecf0f1" />
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

     
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#34495e',
    alignItems: 'center',
    elevation: 5,
  },
  appName: {
    fontSize: width * 0.08,
    color: '#ecf0f1',
    fontWeight: '700',
  },
  logoutButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: '#2980b7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3498db',
    padding: width * 0.06,
    borderRadius: 12,
    margin: width * 0.05,
    elevation: 5,
  },
  greetingWrapper: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: width * 0.06,
    color: '#ecf0f1',
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: width * 0.04,
    color: '#ecf0f1',
    marginTop: 5,
  },
  registrationInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: width * 0.08,
    color: '#ecf0f1',
    fontWeight: 'bold',
  },
  yearBox: {
    backgroundColor: '#bdc3c7',
    paddingVertical: 7,
    paddingHorizontal: 20,
    marginTop: 5,
    borderRadius: 5,
  },
  yearText: {
    fontSize: width * 0.05,
    color: '#34495e',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 80, // Ensure there's space for the button at the bottom
  },
  card: {
    backgroundColor: '#34495e',
    width: width * 0.4,
    height: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 5,
    marginHorizontal: 5,
  },
  cardText: {
    marginTop: 10,
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#ecf0f1',
    fontSize: 18,
  },

  // Scrollable content container style
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20, // Ensure content does not overlap with the button
  },

  // Bottom Bar Styles
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    elevation: 10,
  },
  bankDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#2980b9',
    borderRadius: 50, // Rounded button
    justifyContent: 'center',
    elevation: 4, // Adding shadow to give a floating effect
  },
  bankIcon: {
    fontSize: 30,
    color: 'white',
    marginRight: 15,
  },
  bankText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
