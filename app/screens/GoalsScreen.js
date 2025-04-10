import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ImageBackground } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, push, onValue, remove } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';

const GoalScreen = ({ navigation }) => {
  const [goal, setGoal] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [salary, setSalary] = useState('');
  const [duration, setDuration] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  const [user, setUser] = useState(null);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [goals, setGoals] = useState([]);
  const [goalFeasibility, setGoalFeasibility] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // Loading state

  const database = getDatabase();

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchGoalData(currentUser.uid);
    } else {
      Alert.alert('Error', 'You must be logged in to access this page.');
      navigation.navigate('Login');
    }
  }, []);

  const fetchGoalData = (userId) => {
    const goalRef = ref(database, `users/${userId}/goals`);
    onValue(goalRef, (snapshot) => {
      if (snapshot.exists()) {
        const goalData = snapshot.val();
        const goalList = Object.keys(goalData).map(key => ({
          id: key,
          ...goalData[key]
        }));
        setGoals(goalList);
        if (goalList.length >= 1) {  // Now only one goal can be submitted
          setIsFormDisabled(true);
        } else {
          setIsFormDisabled(false);
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!goal || !goalAmount || !salary || !duration || !monthlySavings) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const calculatedMonthlySavings = parseFloat(goalAmount) / parseInt(duration);

    if (parseFloat(monthlySavings) < calculatedMonthlySavings) {
      setGoalFeasibility(`Your current savings are not enough to meet the goal within the specified duration. You need to save at least ${calculatedMonthlySavings.toFixed(2)} per month to achieve your goal.`);
    } else {
      setGoalFeasibility('You can achieve your goal within the specified duration!');
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit goal data.');
      navigation.navigate('Login');
      return;
    }

    const goalData = {
      goal,
      goalAmount,
      salary,
      duration,
      monthlySavings,
      date: new Date().toLocaleString(),
    };

    try {
      const goalRef = ref(database, `users/${user.uid}/goals`);
      if (goals.length < 1) {
        const newGoalRef = push(goalRef);
        await set(newGoalRef, goalData);

        setGoal('');
        setGoalAmount('');
        setSalary('');
        setDuration('');
        setMonthlySavings('');
        fetchGoalData(user.uid);
        Alert.alert('Success', 'Goal added successfully!');
      } else {
        Alert.alert('Limit Reached', 'You can only submit one goal at a time.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while submitting your goal.');
    }
  };

  const handleDelete = async (goalId) => {
    try {
      const goalRef = ref(database, `users/${user.uid}/goals/${goalId}`);
      await remove(goalRef);
      fetchGoalData(user.uid);
      Alert.alert('Success', 'Goal deleted successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while deleting your goal.');
    }
  };

  const fetchSuggestions = async () => {
    setIsLoading(true);  // Start loading
    try {
      const response = await fetch('https://your-api-endpoint.com/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer AIzaSyBpTB-_QnfeVJfXUWh9YwHTAAUKvhOG-vg`,
        },
        body: JSON.stringify({
          goalAmount,
          salary,
          duration,
          monthlySavings,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      } else {
        throw new Error('Failed to fetch suggestions');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      Alert.alert('Error', 'Sorry, we could not fetch suggestions at this moment.');
    } finally {
      setIsLoading(false);  // End loading
    }
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
          <Text style={styles.title}>Your Goals</Text>
          <TouchableOpacity onPress={() => fetchGoalData(user.uid)}>
            <Icon name="refresh" style={styles.refreshIcon} />
          </TouchableOpacity>
        </View>
  <View style={styles.instructionsBox}>
          <Text style={styles.instructionsText}>
          You can add one goal at a time, and if needed, delete and add a new one. AI-driven suggestions will be provided based on your goal          </Text>
        </View>
        {!isFormDisabled && (
          <>
            <View style={styles.inputRow}>
              <Icon name="flag" style={styles.icon} />
              <Text style={styles.inputLabel}>Goal:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your goal name"
                value={goal}
                onChangeText={setGoal}
              />
            </View>

            <View style={styles.inputRow}>
              <Icon name="money" style={styles.icon} />
              <Text style={styles.inputLabel}>Goal Amount:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter the amount"
                keyboardType="numeric"
                value={goalAmount}
                onChangeText={setGoalAmount}
              />
            </View>

            <View style={styles.inputRow}>
              <Icon name="usd" style={styles.icon} />
              <Text style={styles.inputLabel}>Salary:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your salary"
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
              />
            </View>

            <View style={styles.inputRow}>
              <Icon name="calendar" style={styles.icon} />
              <Text style={styles.inputLabel}>Goal Duration (months):</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter duration in months"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />
            </View>

            <View style={styles.inputRow}>
              <Icon name="save" style={styles.icon} />
              <Text style={styles.inputLabel}>Monthly Savings:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your savings"
                keyboardType="numeric"
                value={monthlySavings}
                onChangeText={setMonthlySavings}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isFormDisabled && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isFormDisabled}
            >
              <Text style={styles.submitButtonText}>Submit Goal</Text>
            </TouchableOpacity>
          </>
        )}

        {goalFeasibility && (
          <View style={styles.goalFeasibilityContainer}>
            <Text style={styles.goalFeasibilityText}>{goalFeasibility}</Text>
          </View>
        )}

        {isLoading ? (
          <Text style={styles.loadingText}>Fetching Suggestions...</Text>
        ) : (
          <>
            {suggestions && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                <Text style={styles.suggestionsText}>{suggestions}</Text>
              </View>
            )}

            {goals.length > 0 && (
              <View style={styles.goalsList}>
                <Text style={styles.goalsListTitle}>Your Goals:</Text>
                {goals.map((goalData, index) => (
                  <View key={index} style={styles.goalItem}>
                    <Text style={styles.goalItemText}>Goal: {goalData.goal}</Text>
                    <Text style={styles.goalItemText}>Goal Amount: {goalData.goalAmount}</Text>
                    <Text style={styles.goalItemText}>Salary: {goalData.salary}</Text>
                    <Text style={styles.goalItemText}>Duration: {goalData.duration} months</Text>
                    <Text style={styles.goalItemText}>Monthly Savings: {goalData.monthlySavings}</Text>
                    <View style={styles.goalActions}>
                      <TouchableOpacity onPress={() => handleDelete(goalData.id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

// Styles
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
    opacity: 0.8,
    marginTop: 10,
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
  refreshIcon: {
    fontSize: 24,
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  instructionsBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsText: {
    color: '#721c24',
    fontSize: 16,
    textAlign: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
    color: '#2980b9',
  },
  inputLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#333',
    width: 150,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalItem: {
    backgroundColor: '#f4f4f4',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  goalItemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deleteText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  goalsList: {
    marginTop: 20,
  },
  goalsListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  goalFeasibilityContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  goalFeasibilityText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
  },
  suggestionsText: {
    fontSize: 16,
    color: '#333',
  },
});

export default GoalScreen;
