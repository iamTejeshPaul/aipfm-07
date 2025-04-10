import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ImageBackground, Alert, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import emailjs from '@emailjs/browser';

const HelpDeskScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const database = getDatabase();

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    } else {
      navigation.navigate('Login');
    }
  }, []);

  const sendEmailNotification = async (ticketId) => {
    const emailParams = {
     
      user_name: name,
      user_email: email,
      issue_title: issueTitle,
      issue_description: issueDescription,
      ticket_id: ticketId,
    };

    try {
      await emailjs.send(
        'service_ri297ej',     // Your EmailJS service ID
        'template_9ojzboi',    // Your EmailJS template ID
        emailParams,
        'VOz3ee93QDepA-hTx'    // Your EmailJS public key
      );
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !issueTitle || !issueDescription) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const ticketRef = push(ref(database, 'helpdesk_tickets'));
    try {
      await set(ticketRef, {
        name,
        email,
        issueTitle,
        issueDescription,
        timestamp: new Date().toISOString(),
      });

      Alert.alert('Success', 'Your ticket has been submitted.');
      sendEmailNotification(ticketRef.key);  // Send email notification
      setIssueTitle('');
      setIssueDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit ticket. Please try again.');
      console.error(error);
    }
  };

  return (
    <ImageBackground source={require('../assets/icon.png')} style={styles.backgroundImage} imageStyle={styles.backgroundImageStyle}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleBarContainer}>
          <View style={styles.titleBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FontAwesome5 name="arrow-left" style={styles.backArrow} />
            </TouchableOpacity>
            <Text style={styles.title}>Help Desk</Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" />
          <Text style={styles.label}>Your Email</Text>
          <TextInput style={styles.input} value={email} editable={false} />
          <Text style={styles.label}>Issue Title</Text>
          <TextInput style={styles.input} value={issueTitle} onChangeText={setIssueTitle} placeholder="Enter issue title" />
          <Text style={styles.label}>Issue Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={issueDescription} 
            onChangeText={setIssueDescription} 
            placeholder="Describe your issue" 
            multiline 
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  titleBarContainer: { marginTop: 50 },
  titleBar: { flexDirection: 'row', backgroundColor: '#2980b9', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 20 },
  backgroundImage: { flex: 1, justifyContent: 'center' },
  backgroundImageStyle: { opacity: 0.05 },
  backArrow: { fontSize: 24, color: '#fff', marginRight: 10 },
  title: { fontSize: 20, color: '#fff', fontWeight: 'bold', flex: 1, textAlign: 'center' },
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 15, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#2980b9', padding: 15, borderRadius: 5, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default HelpDeskScreen;
