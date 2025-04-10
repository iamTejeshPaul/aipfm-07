import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { database, auth } from '../components/firebase';  // Ensure auth is imported
import RNPickerSelect from 'react-native-picker-select';

const DetailsEntryScreen = ({ route, navigation }) => {
  const { someParam } = route.params || {};  // Handle undefined 'someParam' safely
  const [salary, setSalary] = useState('');
  const [goal, setGoal] = useState('');
  const [goalDuration, setGoalDuration] = useState('');
  const [hintText, setHintText] = useState('');
  const [error, setError] = useState('');  // For showing error messages

  const goals = ['Buy House', 'Buy Car', 'Vacation', 'Education', 'Investments', 'Others'];

  const calculateGoalCost = (goal, duration) => {
    if (duration <= 0) {
      Alert.alert('Invalid Duration', 'Goal duration should be a positive number.');
      return 0;
    }

    let goalCost = 0;

    switch (goal) {
      case 'Buy House': goalCost = 500000; break;
      case 'Buy Car': goalCost = 30000; break;
      case 'Vacation': goalCost = 5000; break;
      case 'Education': goalCost = 10000; break;
      case 'Investments': goalCost = 20000; break;
      case 'Others': goalCost = 10000; break;
      default: goalCost = 0;
    }

    return goalCost / duration;
  };

  const handleSaveDetails = async () => {
    // Basic validation
    if (!salary || !goal || !goalDuration) {
      setError('Please fill in all fields.');
      return;
    }

    // Validate if salary and goalDuration are numbers
    if (isNaN(salary) || isNaN(goalDuration)) {
      setError('Salary and Goal Duration must be valid numbers.');
      return;
    }

    const goalCostPerYear = calculateGoalCost(goal, parseInt(goalDuration));

    if (parseInt(salary) < goalCostPerYear) {
      setError('Your income is too low to meet your goal.');
      return;
    }

    if (!auth.currentUser) {
      setError('You need to be logged in to save your details.');
      return;
    }

    try {
      const userRef = database.ref(`users/${auth.currentUser.uid}`);
      await userRef.update({
        salary,
        goal,
        goalDuration,
        goalCostPerYear,
      });

      // Clear error if success
      setError('');

      Alert.alert('Success', 'You meet the criteria for your goal!', [
        { text: 'Proceed to Dashboard', onPress: () => navigation.replace('Dashboard') },
      ]);
    } catch (error) {
      setError('There was an error saving your details. Please try again later.');
    }
  };

  const handleGoalChange = (goal, duration) => {
    setGoal(goal);
    setGoalDuration(duration);

    // Reset error when goal or duration changes
    setError('');

    if (goal && duration) {
      const calculatedCost = calculateGoalCost(goal, parseInt(duration));
      setHintText(`You need to save ${calculatedCost.toFixed(2)} per year to reach your goal.`);
    } else {
      setHintText('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Details Entry</Text>
      <Text>{someParam || 'No Parameter Passed'}</Text>  {/* Display passed parameter */}

      <TextInput
        placeholder="Salary Income"
        placeholderTextColor="#ccc"
        value={salary}
        onChangeText={setSalary}
        keyboardType="numeric"
        style={[styles.input, error && { borderColor: 'red', borderWidth: 2 }]}  // Show red border on error
      />

      <RNPickerSelect
        onValueChange={(itemValue) => handleGoalChange(itemValue, goalDuration)}
        items={goals.map(goalOption => ({
          label: goalOption,
          value: goalOption
        }))}
        style={pickerSelectStyles}
        value={goal}
      />

      <TextInput
        placeholder="Goal Duration (in years)"
        placeholderTextColor="#ccc"
        value={goalDuration}
        onChangeText={(text) => handleGoalChange(goal, text)}
        keyboardType="numeric"
        style={[styles.input, error && { borderColor: 'red', borderWidth: 2 }]}  // Show red border on error
      />

      {hintText ? (
        <Text style={styles.hintText}>{hintText}</Text>
      ) : null}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>  // Display one error message at a time
      ) : null}

      <TouchableOpacity onPress={handleSaveDetails} style={styles.button}>
        <Text style={styles.buttonText}>Save Details</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const pickerSelectStyles = {
  inputIOS: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: '#34495e',
    color: 'white',
  },
  inputAndroid: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: '#34495e',
    color: 'white',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  header: {
    fontSize: 30,
    color: 'white',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: '#34495e',
    color: 'white',
  },
  hintText: {
    color: '#ecf0f1',
    marginVertical: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'skyblue',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DetailsEntryScreen;
