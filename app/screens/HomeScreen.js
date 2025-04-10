import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ImageBackground } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, push } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({ navigation }) => {
  const [amounts, setAmounts] = useState({
    food: '',
    medicines: '',
    entertainment: '',
    transportation: '',
    clothing: '',
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [user, setUser] = useState(null);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [otherCategories, setOtherCategories] = useState([]);

  const database = getDatabase();

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      Alert.alert('Error', 'You must be logged in to submit an expense.');
      navigation.navigate('Login');
    }
  }, []);

  const handleAmountChange = (category, value) => {
    setAmounts((prev) => {
      const newAmounts = { ...prev, [category]: value };
      setTotalAmount(
        Object.values(newAmounts).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)
      );
      return newAmounts;
    });
  };

  const handleOtherCategoryChange = (index, name, value) => {
    const updatedCategories = [...otherCategories];
    updatedCategories[index] = { name, amount: value };
    setOtherCategories(updatedCategories);
    updateTotalAmount(updatedCategories);
  };

  const handleAddOtherCategory = () => {
    setOtherCategories([...otherCategories, { name: '', amount: '' }]);
  };

  const handleDeleteOtherCategory = (index) => {
    const updatedCategories = otherCategories.filter((_, i) => i !== index);
    setOtherCategories(updatedCategories);
    updateTotalAmount(updatedCategories);
  };

  const updateTotalAmount = (categories) => {
    const otherCategoryTotal = categories.reduce((acc, cat) => acc + (parseFloat(cat.amount) || 0), 0);
    const categoryTotal = Object.values(amounts).reduce((acc, value) => acc + (parseFloat(value) || 0), 0);
    setTotalAmount(categoryTotal + otherCategoryTotal);
  };

  const handleSubmit = async () => {
    const { food, medicines, entertainment, transportation, clothing } = amounts;

    if (
      !food &&
      !medicines &&
      !entertainment &&
      !transportation &&
      !clothing &&
      otherCategories.every((cat) => !cat.amount)
    ) {
      Alert.alert('Error', 'Please enter amounts for at least one category.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit an expense.');
      navigation.navigate('Login');
      return;
    }

    const expenseData = {
      ...amounts,
      totalAmount: totalAmount,
      otherCategories,
      date: new Date().toLocaleString(),
    };

    try {
      const expensesRef = ref(database, `users/${user.uid}/expenses`);
      const newExpenseRef = push(expensesRef);
      await set(newExpenseRef, expenseData);

      setAmounts({
        food: '',
        medicines: '',
        entertainment: '',
        transportation: '',
        clothing: '',
      });
      setTotalAmount(0);
      setIsFormDisabled(true);
      setOtherCategories([]);
      Alert.alert('Success', 'Expense added successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while submitting your expense.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/icon.png')}  // Path to your branding image
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.title}>Your Daily Expenses</Text>
        </View>

        {/* Instructions Box */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsText}>
            Please ensure the details are entered carefully. Once submitted, the information cannot be edited. If you need to make changes, you can update them in tomorrow's expenses.
          </Text>
        </View>

        {/* Category Amount Fields with Icons */}
        {['food', 'medicines', 'entertainment', 'transportation', 'clothing'].map((category) => (
          <View style={styles.inputRow} key={category}>
            <Icon name={category === 'food' ? 'cutlery' : category === 'medicines' ? 'tablet' : category === 'entertainment' ? 'film' : category === 'transportation' ? 'car' : 'shopping-bag'} style={styles.icon} />
            <Text style={styles.inputLabel}>{category.charAt(0).toUpperCase() + category.slice(1)}:</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter amount for ${category}`}
              keyboardType="numeric"
              value={amounts[category]}
              onChangeText={(value) => handleAmountChange(category, value)}
              editable={!isFormDisabled}
            />
          </View>
        ))}

        {/* Other Categories */}
        {otherCategories.map((category, index) => (
          <View style={styles.inputRow} key={`other-${index}`}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter other category name"
              value={category.name}
              onChangeText={(name) => handleOtherCategoryChange(index, name, category.amount)}
              editable={!isFormDisabled}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={category.amount}
              onChangeText={(value) => handleOtherCategoryChange(index, category.name, value)}
              editable={!isFormDisabled}
            />
            <TouchableOpacity onPress={() => handleDeleteOtherCategory(index)} disabled={isFormDisabled}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Another Category Link */}
        <TouchableOpacity onPress={handleAddOtherCategory} disabled={isFormDisabled}>
          <Text style={styles.addCategoryLink}>+ Add Another Category</Text>
        </TouchableOpacity>

        {/* Total Amount */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Total Amount:</Text>
          <TextInput
            style={styles.input}
            placeholder="Total spent"
            value={totalAmount.toString()}
            editable={false}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isFormDisabled && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isFormDisabled}
        >
          <Text style={styles.submitButtonText}>Submit Expense</Text>
        </TouchableOpacity>

        {/* Note */}
        {isFormDisabled && (
          <Text style={styles.note}>Your details are uploaded to the database. You can submit again now.</Text>
        )}
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
  titleBar: {
    flexDirection: 'row',
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
    opacity: 0.8, // Adjust opacity for title bar
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImageStyle: {
    opacity: 0.05, // Set the opacity of the background image
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
    color: '#2980b9',
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    width: 120,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    flex: 1,
    paddingHorizontal: 10,
  },
  addCategoryLink: {
    color: '#2980b9',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  deleteButton: {
    color: 'red',
    fontSize: 16,
  },
  note: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});

export default HomeScreen;
