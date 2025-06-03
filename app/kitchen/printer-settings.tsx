import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  getPrinterSettings,
  savePrinterSettings,
  PrinterSettings,
  togglePrinterConnection,
  isPrinterConnected,
} from '../../lib/printer';

export default function PrinterSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrinterSettings>(getPrinterSettings());
  const [isConnected, setIsConnected] = useState(isPrinterConnected());

  useEffect(() => {
    // Check printer connection status every 30 seconds
    const interval = setInterval(() => {
      setIsConnected(isPrinterConnected());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = (key: keyof PrinterSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    savePrinterSettings(newSettings);
  };

  const handleDelayChange = (status: keyof PrinterSettings['statusDelays'], value: number) => {
    const newSettings = {
      ...settings,
      statusDelays: {
        ...settings.statusDelays,
        [status]: value * 1000, // Convert seconds to milliseconds
      },
    };
    setSettings(newSettings);
    savePrinterSettings(newSettings);
  };

  const handleTestConnection = () => {
    togglePrinterConnection();
    setIsConnected(isPrinterConnected());
    Alert.alert(
      'Printer Connection',
      `Printer is now ${isPrinterConnected() ? 'disconnected' : 'connected'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Printer Settings</Text>
      </View>

      {/* Connection Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Printer Connection</Text>
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? '#32CD32' : '#FF4500' },
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestConnection}
        >
          <Text style={styles.testButtonText}>Test Connection</Text>
        </TouchableOpacity>
      </View>

      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Settings</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Simulated Delays</Text>
            <Text style={styles.settingDescription}>
              Enable simulated delays for order processing
            </Text>
          </View>
          <Switch
            value={settings.simulatedDelays}
            onValueChange={() => handleToggle('simulatedDelays')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.simulatedDelays ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>
              Enable order status notifications
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={() => handleToggle('notificationsEnabled')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.notificationsEnabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Delay Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Delays</Text>
        <Text style={styles.sectionDescription}>
          Set the delay time (in seconds) for each status change
        </Text>
        {Object.entries(settings.statusDelays).map(([status, delay]) => (
          <View key={status} style={styles.delaySetting}>
            <Text style={styles.delayLabel}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
            <View style={styles.delayInput}>
              <TouchableOpacity
                style={styles.delayButton}
                onPress={() => handleDelayChange(status as keyof PrinterSettings['statusDelays'], Math.max(0, delay / 1000 - 5))}
              >
                <Text style={styles.delayButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.delayValue}>{delay / 1000}s</Text>
              <TouchableOpacity
                style={styles.delayButton}
                onPress={() => handleDelayChange(status as keyof PrinterSettings['statusDelays'], delay / 1000 + 5)}
              >
                <Text style={styles.delayButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  delaySetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  delayLabel: {
    fontSize: 16,
    color: '#333',
  },
  delayInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  delayButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delayButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  delayValue: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
}); 