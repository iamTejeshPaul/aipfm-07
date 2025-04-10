import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import { Linking } from "react-native";


const ReportScreen = ({ navigation }) => {
  const [reportData, setReportData] = useState([]);
  const [user, setUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
 const [groupedReports, setGroupedReports] = useState({});
  const database = getDatabase();

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchReportData(currentUser.uid);
    } else {
      Alert.alert('Error', 'You must be logged in to view reports.');
      navigation.navigate('Login');
    }
  }, []);

  const fetchReportData = (uid) => {
    const reportsRef = ref(database, 'users/' + uid + '/expenses');
    onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reports = Object.values(snapshot.val());
        setReportData(reports);
        groupReportsByMonthYear(reports);
      } else {
        setReportData([]);
        Alert.alert('No Data', 'No reports found for your account.');
      }
    });
  };

  const groupReportsByMonthYear = (reports) => {
    const grouped = reports.reduce((acc, report) => {
      const reportDate = new Date(report.date);
      const monthYear = `${reportDate.getMonth() + 1}-${reportDate.getFullYear()}`;
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(report);
      return acc;
    }, {});
    setGroupedReports(grouped);
  };

  const calculateTotalAmount = () => {
    return reportData
      .reduce((total, report) => {
        // Get the total amount of the report (this includes expenses from other categories)
        const totalAmount = parseFloat(report.totalAmount) || 0;
        
        // If otherCategories are provided, sum up the amounts, but avoid double-counting
        const otherCategoriesTotal = report.otherCategories
          ? report.otherCategories.reduce((sum, cat) => sum + (parseFloat(cat.amount) || 0), 0)
          : 0;
  
        // If the totalAmount already includes the other categories, do not add them again
        return total + totalAmount;
      }, 0)
      .toFixed(2);  // return the total amount rounded to 2 decimal places
  };
  

  const handleDownload = async (report) => {
    try {
      const foodAmount = report.food || 0;
      const medicinesAmount = report.medicines || 0;
      const entertainmentAmount = report.entertainment || 0;
      const transportationAmount = report.transportation || 0;
      const clothingAmount = report.clothing || 0;

      const otherCategories = report.otherCategories || [];
      const otherCategoryRows = otherCategories
        .map(
          (cat) => `
            <tr>
              <td>${cat.name || "N/A"}</td>
              <td>₹${parseFloat(cat.amount) || 0}</td>
            </tr>`
        )
        .join("");

      const highestCategory = [
        { name: "Food", amount: foodAmount },
        { name: "Medicines", amount: medicinesAmount },
        { name: "Entertainment", amount: entertainmentAmount },
        { name: "Transportation", amount: transportationAmount },
        { name: "Clothing", amount: clothingAmount },
      ]
        .concat(
          otherCategories.map((cat) => ({ name: cat.name || "Other", amount: parseFloat(cat.amount) || 0 }))
        )
        .sort((a, b) => b.amount - a.amount)[0].name;

      let pdfContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
              .container { color: #333; }
              h1, h2 { text-align: center; color: #2980b9; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              table th, table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              table th { background-color: #f4f4f4; }
              .remarks { margin-top: 20px; font-style: italic; color: #e74c3c; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>AI Personal Finance Manager</h1>
              <h2>Report for: ${user.email}</h2>
              <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Amount:</strong> ₹${report.totalAmount || 0}</p>
              <h2>Expenses Breakdown</h2>
              <table>
                <thead>
                  <tr>
                    <th>Expense Name</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    report.expenses && report.expenses.length > 0
                      ? report.expenses
                          .map(
                            (expense) => `
                              <tr>
                                <td>${expense.name || 'N/A'}</td>
                                <td>₹${expense.amount || 0}</td>
                                <td>${expense.category || 'N/A'}</td>
                                <td>${expense.date || 'N/A'}</td>
                              </tr>`
                          )
                          .join('')
                      : '<tr><td colspan="4">No expenses available.</td></tr>'
                  }
                </tbody>
              </table>
              <h2>Category-wise Breakdown</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Food</td><td>₹${foodAmount}</td></tr>
                  <tr><td>Medicines</td><td>₹${medicinesAmount}</td></tr>
                  <tr><td>Entertainment</td><td>₹${entertainmentAmount}</td></tr>
                  <tr><td>Transportation</td><td>₹${transportationAmount}</td></tr>
                  <tr><td>Clothing</td><td>₹${clothingAmount}</td></tr>
                  ${otherCategoryRows}
                </tbody>
              </table>
              <p class="remarks"><strong>Remarks:</strong> You have spent the most on ${highestCategory}.</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: pdfContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download Successful', `Report saved at: ${uri}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to download the report: ${error.message}`);
    }
  };

  const handleGenerateBehavioralReport = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
  
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }
  
      // Set user state
      setUser(currentUser);
      
      // Show modal with user email and UID
      setIsModalVisible(true);
  
    } catch (error) {
      Alert.alert("Error", `Failed to generate report: ${error.message}`);
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert("Copied!", "User ID/Email copied to clipboard.");
  };


  const handleProceed = () => {
    setIsModalVisible(false);
    handleGenerateBehavioralReport();
  
    // Navigate to WebView Screen
    navigation.navigate("WebViewScreen");
  };

  return (
    <ImageBackground source={require('../assets/icon.png')} style={styles.backgroundImage} imageStyle={styles.backgroundImageStyle}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" style={styles.backArrow} />
          </TouchableOpacity>
          <Text style={styles.title}>Expense Reports</Text>
          <TouchableOpacity onPress={() => fetchReportData(user?.uid)} style={styles.refreshButton}>
            <Icon name="refresh" style={styles.refreshIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsText}>
            To generate a behavioral report, you must log expenses for at least 15 days within the month. The 'Generate Behavioral Report' button will be available after 30 days. Reports can only be downloaded at the end of each month and cannot be regenerated. Please save your documents securely.
          </Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Combined Total Amount:</Text>
          <Text style={styles.totalAmount}>₹{calculateTotalAmount()}</Text>
          <TouchableOpacity onPress={handleGenerateBehavioralReport} style={styles.generateButton}>
            <Text style={styles.generateButtonText}>Generate Behavioral Report</Text>
          </TouchableOpacity>
        </View>

        {Object.keys(groupedReports).map((monthYear) => {
          const [month, year] = monthYear.split('-');
          const formattedMonthYear = `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;

          return (
            <View key={monthYear} style={styles.dropdownContainer}>
              <ScrollView style={styles.dropdownContent}>
                {groupedReports[monthYear].map((report, index) => (
                  <View key={index} style={styles.reportCard}>
                    <Icon name="file" style={styles.cardIcon} />
                    <View style={styles.cardContent}>
                      <Text style={styles.reportTitle}>Report #{index + 1}</Text>
                      <Text style={styles.reportDate}>Date: {report.date || 'Date not available'}</Text>
                      <Text style={styles.reportTotal}>Total: ₹{isNaN(report.totalAmount) ? 0 : report.totalAmount}</Text>
                      <TouchableOpacity onPress={() => handleDownload(report)} style={styles.downloadButton}>
                        <Text style={styles.downloadButtonText}>Download Report</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal for displaying User ID and Email */}
      {user && (
  <Modal
    transparent={true}
    visible={isModalVisible}
    onRequestClose={() => setIsModalVisible(false)} // Close the modal on pressing hardware back button (Android)
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        
        {/* Close Button (X Mark) */}
        <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>

        <Text style={styles.modalTitle}>User Info</Text>
        <Text style={styles.modalText}>User ID: {user.uid}</Text>

        {/* Copy User ID */}
        <TouchableOpacity onPress={() => copyToClipboard(user.uid)} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>Copy User ID</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleProceed} style={styles.proceedButton}>
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for more focus on modal content
  },
  modalContent: {
    backgroundColor: '#ffffff', // White background for clean look
    padding: 30,
    borderRadius: 15, // Rounded corners for a softer appearance
    width: 320, // Slightly wider modal
    alignItems: 'center',
    shadowColor: '#000', // Adding shadow for a subtle lift effect
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10, // For Android shadow effect
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTitle: {
    fontSize: 24, // Larger font size for emphasis
    fontWeight: '600', // Semi-bold for a more professional feel
    color: '#333', // Darker text color for better contrast
    marginBottom: 15, // More space before the text content
  },
  modalText: {
    fontSize: 16,
    color: '#555', // Lighter text color for readability
    textAlign: 'center',
    marginBottom: 20, // Space between the text and buttons
  },
  copyButton: {
    marginBottom: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#4CAF50', // Green color for success actions
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  copyButtonText: {
    color: '#ffffff',
    fontWeight: '600', // Semi-bold text for button label
    fontSize: 16,
  },
  proceedButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#2196F3', // Blue color for a neutral action
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  proceedButtonText: {
    color: '#ffffff',
    fontWeight: '600', // Semi-bold text for button label
    fontSize: 16,
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
  backArrow: {
    fontSize: 24,
    color: '#fff',
  },
  refreshButton: {
    marginLeft: 'auto',
  },
  refreshIcon: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    flex: 1,
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 10,
  },
  generateButton: {
    marginTop: 15,
    backgroundColor: '#2980b9',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportCard: {
    backgroundColor: '#fff',
    flexBasis: '48%',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownContainer: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
  },
  dropdownLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 10,
  },
  dropdownContent: {
    maxHeight: 300,
  },
  cardIcon: {
    fontSize: 30,
    color: '#2980b9',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  reportDate: {
    fontSize: 14,
    color: '#333',
  },
  reportTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  downloadButton: {
    marginTop: 10,
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  noDataText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ReportScreen;
