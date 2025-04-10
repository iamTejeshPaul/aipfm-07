import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();

  // Function to handle option press (for navigation and external links)
  const handleOptionPress = (option) => {
    console.log(`${option} pressed`);
  };

  const handleShareApp = () => {
    console.log('Share App pressed');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://yourapp.com/privacy-policy');
  };

  const openTermsConditions = () => {
    Linking.openURL('https://yourapp.com/terms-conditions');
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      {/* Title Bar with Back Arrow */}
      <View style={styles.titleBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={30} color="#ecf0f1" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.option} onPress={handleShareApp}>
          <Icon name="share" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.optionText}>Share App</Text>
        </TouchableOpacity>
      </View>

      {/* App Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.option}>
          <Icon name="info" size={24} color="#fff" style={styles.icon} />
          <View>
            <Text style={styles.optionText}>App Name</Text>
            <Text style={styles.optionDetail}>Finance Manager</Text>
          </View>
        </View>
        <View style={styles.option}>
          <Icon name="update" size={24} color="#fff" style={styles.icon} />
          <View>
            <Text style={styles.optionText}>App Version</Text>
            <Text style={styles.optionDetail}>1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <TouchableOpacity style={styles.option} onPress={openPrivacyPolicy}>
          <Icon name="policy" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.optionText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={openTermsConditions}>
          <Icon name="gavel" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.optionText}>Terms and Conditions</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.copyright}>
          © 2024 Finance Manager. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b2631', // Darker background for a more professional look
    paddingHorizontal: 20,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    marginBottom: 20,
    justifyContent: 'space-between', // Ensures back button and title are aligned
  },
  backButton: {
    zIndex: 10, // Ensures the back button appears above the title
  },
  title: {
    fontSize: 24,
    color: '#ecf0f1',
    fontWeight: '600',
    textAlign: 'center', // Centers the title
    flex: 1, // Ensures title takes the available space between the button and screen edge
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#34495e', // Dark grey background for sections
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    marginHorizontal: 10, // Adds spacing on the sides of the section
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ecf0f1', // Light text color
    fontWeight: '600',
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#2c3e50', // Slightly darker shade for options
    borderRadius: 10,
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#ecf0f1',
    marginLeft: 15,
    fontWeight: '500',
  },
  optionDetail: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
  },
  icon: {
    marginRight: 12,
  },
  footer: {
    marginTop: 30,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#34495e',
  },
  copyright: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default SettingsScreen;
