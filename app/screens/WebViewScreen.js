import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, BackHandler } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { Appbar, IconButton } from "react-native-paper";

const WebViewScreen = () => {
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Handle Back Button (Hardware + Gesture + UI Back)
  const handleGoBack = () => {
    Alert.alert(
      "Confirm Exit",
      "Are you sure you want to go back?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => navigation.goBack() },
      ],
      { cancelable: false }
    );
    return true; // Prevents default back action
  };

  // Handle Refresh
  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Add event listener for hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleGoBack);
    return () => backHandler.remove(); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content title="AIPFM Behavioral Report" />
        <IconButton icon="refresh" onPress={handleRefresh} />
      </Appbar.Header>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: "https://aipfm-aiml-model.streamlit.app/" }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#2980b9",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default WebViewScreen;
