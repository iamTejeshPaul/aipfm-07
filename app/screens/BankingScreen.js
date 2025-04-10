import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ImageBackground, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BankingScreen = ({ navigation }) => {
  const [selectedUPIApp, setSelectedUPIApp] = useState(null);

  // List of UPI Apps
  const upiApps = [
    { name: 'PhonePe', uri: 'phonepe://upi/pay' },
    { name: 'Paytm', uri: 'paytmmp://upi/pay' },
  ];

  // Function to check if the UPI app is installed before opening
  const openUPIApp = async (upiUrl) => {
    const canOpen = await Linking.canOpenURL(upiUrl);
    if (canOpen) {
      Linking.openURL(upiUrl)
        .then(() => console.log('UPI Payment initiated'))
        .catch(() => Alert.alert('Error', 'Could not launch UPI app.'));
    } else {
      Alert.alert('App Not Installed', `${selectedUPIApp.name} is not installed on your device.`);
    }
  };

  // Open UPI Payment Scanner
  const initiateUPIPayment = () => {
    if (!selectedUPIApp) {
      Alert.alert('Select UPI App', 'Please select a UPI app before proceeding.');
      return;
    }

    if (selectedUPIApp.name === 'Others') {
      Alert.alert('Select App', 'Please select your banking app manually.');
      return;
    }

    const upiUrl = `${selectedUPIApp.uri}?pa=receiver@upi&pn=Receiver Name&mc=1234&tid=123456&tn=Payment&am=1.00&cu=INR`;
    openUPIApp(upiUrl);
  };

  // Open UPI Balance Check
  const checkBalanceWithUPI = () => {
    if (!selectedUPIApp) {
      Alert.alert('Select UPI App', 'Please select a UPI app before proceeding.');
      return;
    }

    if (selectedUPIApp.name === 'Others') {
      Alert.alert('Select App', 'Please select your banking app manually.');
      return;
    }

    const upiUrl = `${selectedUPIApp.uri}?pa=example@upi&pn=ReceiverName&mc=0000&tid=123456&tn=CheckBalance&am=0.00&cu=INR`;
    openUPIApp(upiUrl);
  };

  return (
    <ImageBackground
      source={require('../assets/icon.png')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.title}>Banking Details</Text>
        </View>

        {/* UPI App Selection */}
        <Text style={styles.subTitle}>Select UPI App:</Text>
        <View style={styles.upiAppContainer}>
          {upiApps.map((app) => (
            <TouchableOpacity
              key={app.name}
              style={[
                styles.upiAppButton,
                selectedUPIApp?.name === app.name && styles.selectedUPIApp
              ]}
              onPress={() => setSelectedUPIApp(app)}
            >
              <Text style={styles.upiAppText}>{app.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pay with UPI */}
        <TouchableOpacity style={styles.transactionButton} onPress={initiateUPIPayment}>
          <Text style={styles.transactionButtonText}>Pay with UPI</Text>
        </TouchableOpacity>

        {/* Check Balance */}
        <TouchableOpacity style={styles.transactionButton} onPress={checkBalanceWithUPI}>
          <Text style={styles.transactionButtonText}>Check Your Balance</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  titleBar: {
    flexDirection: 'row',
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    opacity: 0.05,
  },
  backArrow: {
    fontSize: 24,
    color: '#fff',
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  upiAppContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  upiAppButton: {
    backgroundColor: '#ccc',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  selectedUPIApp: {
    backgroundColor: '#2980b9',
  },
  upiAppText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  transactionButton: {
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BankingScreen;
