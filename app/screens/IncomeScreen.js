import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ImageBackground,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, push, onValue } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import { PieChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';

const screenWidth = Dimensions.get('window').width;

const IncomeScreen = ({ navigation }) => {
  const [income, setIncome] = useState({ salary: '', other: '' });
  const [totalIncome, setTotalIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [user, setUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const database = getDatabase();

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchIncomeData(currentUser.uid);
      fetchExpensesData(currentUser.uid);
    } else {
      Alert.alert('Error', 'You must be logged in to access this page.');
      navigation.navigate('Login');
    }

    if (lastSavedTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const difference = lastSavedTime + 30 * 24 * 60 * 60 * 1000 - now;
        if (difference <= 0) {
          setIsButtonDisabled(false);
          setTimeRemaining(null);
          clearInterval(interval);
        } else {
          setTimeRemaining(difference);
          setIsButtonDisabled(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastSavedTime]);

  // Fetching income data
  const fetchIncomeData = (userId) => {
    setIsRefreshing(true);
    const incomeRef = ref(database, `users/${userId}/income`);
    onValue(incomeRef, (snapshot) => {
      if (snapshot.exists()) {
        const incomeData = snapshot.val();
        const lastEntry = Object.values(incomeData).pop();
        setIncome({ salary: lastEntry.salary, other: lastEntry.other });
        setTotalIncome(lastEntry.totalIncome);
        setLastSavedTime(lastEntry.timestamp);
      }
      setIsRefreshing(false);
    });
  };

  // Fetching expenses data
  const fetchExpensesData = (userId) => {
    const expensesRef = ref(database, `users/${userId}/expenses`);
    onValue(expensesRef, (snapshot) => {
      if (snapshot.exists()) {
        const expensesData = Object.values(snapshot.val());
        setExpenses(expensesData);

        const totalExpenses = expensesData.reduce((sum, exp) => sum + exp.totalAmount, 0);
        const numDays = expensesData.length;
        setDailyAverage(numDays > 0 ? totalExpenses / numDays : 0);
      }
    });
  };

  // Handling save income
  const handleSaveIncome = () => {
    if (income.salary && income.other) {
      const incomeRef = ref(database, `users/${user.uid}/income`);
      const newIncomeKey = push(incomeRef).key;
      const currentTime = Date.now();
      set(ref(database, `users/${user.uid}/income/${newIncomeKey}`), {
        salary: income.salary,
        other: income.other,
        totalIncome: parseFloat(income.salary) + parseFloat(income.other),
        timestamp: currentTime,
      });

      setLastSavedTime(currentTime);
      setIsButtonDisabled(true);
      setTimeRemaining(null);
      Alert.alert('Success', 'Income data saved successfully!');
    } else {
      Alert.alert('Error', 'Please fill in both salary and other income fields.');
    }
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);

  // Check if expenses are near or exceeding income
  const isWarning = totalExpenses > totalIncome * 0.8 && totalIncome > 0;

  // Data for income pie chart
  const incomeData = [
    {
      value: parseFloat(income.salary) || 0,
      svg: { fill: '#3498db' },
      key: 'Salary',
    },
    {
      value: parseFloat(income.other) || 0,
      svg: { fill: '#2ecc71' },
      key: 'Other Income',
    },
  ];

  // Data for expenses pie chart
  const expensesData = [
    { value: expenses.reduce((sum, e) => sum + parseFloat(e.food || 0), 0), svg: { fill: '#f1c40f' }, key: 'Food' },
    { value: expenses.reduce((sum, e) => sum + parseFloat(e.transportation || 0), 0), svg: { fill: '#e74c3c' }, key: 'Transportation' },
    { value: expenses.reduce((sum, e) => sum + parseFloat(e.entertainment || 0), 0), svg: { fill: '#8e44ad' }, key: 'Entertainment' },
    { value: expenses.reduce((sum, e) => sum + parseFloat(e.clothing || 0), 0), svg: { fill: '#1abc9c' }, key: 'Clothing' },
    { value: expenses.reduce((sum, e) => sum + parseFloat(e.medicines || 0), 0), svg: { fill: '#34495e' }, key: 'Medicines' },
  ];

  // Data for Expenses vs Income comparison pie chart
  const expensesVsIncomeData = [
    {
      value: totalIncome || 0,
      svg: { fill: '#3498db' },
      key: 'Income',
    },
    {
      value: totalExpenses || 0,
      svg: { fill: '#e74c3c' },
      key: 'Expenses',
    },
  ];

  // Convert remaining time in milliseconds to hours, minutes, and seconds
  const formatTime = (timeInMilliseconds) => {
    const hours = Math.floor(timeInMilliseconds / 3600000);
    const minutes = Math.floor((timeInMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((timeInMilliseconds % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <ImageBackground
      source={require('../assets/icon.png')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchIncomeData(user.uid)} />}
      >
        {/* Title Bar */}
        <View style={styles.titleBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.title}>Income & Expenses</Text>
          <TouchableOpacity onPress={() => fetchIncomeData(user.uid)}>
            <Icon name="refresh" style={styles.refreshIcon} />
          </TouchableOpacity>
        </View>

        {/* Instructions Box */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsText}>
            Once your income data is submitted, it cannot be edited for the next 30 days. Please ensure all information is accurate before submission.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Enter Salary"
            keyboardType="numeric"
            value={income.salary}
            onChangeText={(text) => setIncome({ ...income, salary: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Other Income"
            keyboardType="numeric"
            value={income.other}
            onChangeText={(text) => setIncome({ ...income, other: text })}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveIncome}
            disabled={isButtonDisabled}
          >
            <Text style={styles.saveButtonText}>
              {isButtonDisabled
                ? `Please wait: ${timeRemaining ? formatTime(timeRemaining) : 'Loading...'}` 
                : 'Save Income'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Income Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Income Breakdown</Text>
          <PieChart style={{ height: 200 }} data={incomeData} innerRadius="40%" outerRadius="80%" />
          <View style={styles.pieChartLegend}>
            <View style={[styles.legendItem, { backgroundColor: '#3498db' }]} />
            <Text style={styles.legendItem}>Salary - ₹{income.salary}</Text>
            <View style={[styles.legendItem, { backgroundColor: '#2ecc71' }]} />
            <Text style={styles.legendItem}>Other Income - ₹{income.other}</Text>
          </View>
        </View>

        {/* Expenses Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Expenses Breakdown</Text>
          <PieChart style={{ height: 200 }} data={expensesData} innerRadius="40%" outerRadius="80%" />
          <View style={styles.pieChartLegend}>
            {expensesData.map((expense, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.legendItem, { backgroundColor: expense.svg.fill }]} />
                <Text style={styles.legendItem}>{`${expense.key} - ₹${expense.value.toFixed(2)}`}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expenses vs Income Pie Chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Expenses vs Income</Text>
          <PieChart style={{ height: 200 }} data={expensesVsIncomeData} innerRadius="40%" outerRadius="80%" />
          <View style={styles.pieChartLegend}>
            {expensesVsIncomeData.map((data, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.legendItem, { backgroundColor: data.svg.fill }]} />
                <Text style={styles.legendItem}>{`${data.key} - ₹${data.value.toFixed(2)}`}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Warning if Expenses are nearing Income */}
        {isWarning && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>Warning: Your expenses are nearing your income!</Text>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  titleBar: {
    flexDirection: 'row',
    backgroundColor: '#2980b9',
    padding: 10,
    paddingTop: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
    elevation: 4,
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
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  refreshIcon: {
    fontSize: 24,
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pieChartLegend: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    width: 150,
    height: 20,
    marginRight: 10,
    fontSize: 14,
  },
  warningBox: {
    backgroundColor: '#f39c12',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  warningText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default IncomeScreen;
