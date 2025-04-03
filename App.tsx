import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import Page from './src/app/page';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Page />
      </ScrollView>
    </SafeAreaView>
  );
};

interface Styles {
  container: ViewStyle;
  scrollContainer: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
  }
});

export default App;
