import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  SafeAreaView, Platform, Vibration, Linking,
  ActivityIndicator,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

// Types
type ScanState = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

interface QRPayload {
  orderId: string;
  deliveryId: string;
  token: string;
  expiresAt: number;
}

const G = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#fff',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

const AUTO_RESET_MS = 8000;

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={G.primary} />
    <Text style={styles.loadingText}>Loading…</Text>
  </View>
);

export default function ScanQRScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [message, setMessage] = useState('');
  const [scannedData, setScannedData] = useState<QRPayload | null>(null);
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestCameraPermission();
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await CameraView.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const scheduleReset = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setScanState('idle');
      setMessage('');
      setScannedData(null);
    }, AUTO_RESET_MS);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanState !== 'scanning') return;

    setScanState('verifying');
    Vibration.vibrate(100);

    // Parse QR payload
    let payload: QRPayload;
    try {
      payload = JSON.parse(data) as QRPayload;
      if (!payload.orderId || !payload.deliveryId || !payload.token || !payload.expiresAt) {
        throw new Error('Invalid payload');
      }
    } catch {
      setScanState('error');
      setMessage('Invalid QR code format.');
      Vibration.vibrate([0, 200, 100, 200]);
      scheduleReset();
      return;
    }

    // Check client-side expiry
    if (Date.now() > payload.expiresAt) {
      setScanState('error');
      setMessage('This QR code has expired.');
      Vibration.vibrate([0, 200, 100, 200]);
      scheduleReset();
      return;
    }

    setScannedData(payload);

    // Verify with backend (simulated)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful verification
      setScanState('success');
      setMessage('Delivery confirmed successfully!');
      Vibration.vibrate([0, 100, 50, 100, 50, 200]);
    } catch (error) {
      setScanState('error');
      setMessage('Invalid or expired QR code.');
      Vibration.vibrate([0, 200, 100, 200]);
    }

    scheduleReset();
  };

  const startScanning = () => {
    setScanState('scanning');
    setMessage('');
    setScannedData(null);
  };

  const stopScanning = () => {
    setScanState('idle');
    setMessage('');
    setScannedData(null);
  };

  const handleRetry = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    startScanning();
  };

  const renderCameraView = () => (
    <View style={styles.cameraContainer}>
      <CameraView
        onBarcodeScanned={scanState === 'scanning' ? handleBarCodeScanned : undefined}
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {/* Overlay frame */}
      <View style={styles.overlay}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
      </View>

      {/* Scanning indicator */}
      {scanState === 'scanning' && (
        <View style={styles.scanningIndicator}>
          <View style={styles.scanningDot} />
          <Text style={styles.scanningText}>Scanning...</Text>
        </View>
      )}
    </View>
  );

  const renderStatus = () => {
    switch (scanState) {
      case 'idle':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="qr-code" size={64} color={G.sub} />
            <Text style={styles.statusText}>Camera is off</Text>
          </View>
        );

      case 'verifying':
        return (
          <View style={styles.statusContainer}>
            <LoadingIndicator />
            <Text style={styles.statusText}>Verifying with server...</Text>
            {scannedData && (
              <Text style={styles.statusSubtext}>
                Order {scannedData.orderId.slice(0, 12)}…
              </Text>
            )}
          </View>
        );

      case 'success':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={44} color={G.success} />
            </View>
            <Text style={[styles.statusText, styles.successText]}>
              Delivery Confirmed ✅
            </Text>
            <Text style={styles.statusMessage}>{message}</Text>
            {scannedData && (
              <View style={styles.orderInfo}>
                <Text style={styles.orderText}>
                  Order {scannedData.orderId.slice(0, 16)}…
                </Text>
              </View>
            )}
            <Text style={styles.resetText}>
              Auto-resetting in {AUTO_RESET_MS / 1000}s…
            </Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={44} color={G.error} />
            </View>
            <Text style={[styles.statusText, styles.errorText]}>
              Invalid or Expired QR ❌
            </Text>
            <Text style={styles.statusMessage}>{message}</Text>
            <Text style={styles.resetText}>
              Auto-resetting in {AUTO_RESET_MS / 1000}s…
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    switch (scanState) {
      case 'idle':
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={startScanning}
          >
            <Ionicons name="camera" size={16} color={G.white} />
            <Text style={styles.actionButtonText}>Start Camera Scanner</Text>
          </TouchableOpacity>
        );

      case 'scanning':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.stopButton]}
            onPress={stopScanning}
          >
            <Ionicons name="stop" size={16} color={G.text} />
            <Text style={[styles.actionButtonText, styles.stopButtonText]}>
              Stop Camera
            </Text>
          </TouchableOpacity>
        );

      case 'error':
      case 'success':
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={16} color={G.white} />
            <Text style={styles.actionButtonText}>Scan Another QR</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={64} color={G.error} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            This app needs camera access to scan QR codes for delivery confirmation.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.permissionButtonText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.permissionButton, styles.retryButton]}
            onPress={requestCameraPermission}
          >
            <Text style={[styles.permissionButtonText, styles.retryButtonText]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR to Confirm Delivery</Text>
        <Text style={styles.subtitle}>
          Ask the delivery agent to show their QR code, then scan it here.
        </Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        {/* Camera View */}
        <View style={[styles.cameraWrapper, { height: scanState === 'scanning' ? 320 : 0 }]}>
          {scanState === 'scanning' ? renderCameraView() : null}
        </View>

        {/* Status */}
        <View style={styles.statusWrapper}>{renderStatus()}</View>

        {/* Action Buttons */}
        <View style={styles.actionWrapper}>{renderActionButtons()}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: G.surface,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  subtitle: {
    fontSize: 14,
    color: G.sub,
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    margin: 20,
    backgroundColor: G.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cameraWrapper: {
    overflow: 'hidden',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 60,
    left: 40,
    width: 24,
    height: 24,
    borderTopLeftRadius: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FF9800',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 24,
    height: 24,
    borderTopRightRadius: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FF9800',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    width: 24,
    height: 24,
    borderBottomLeftRadius: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FF9800',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 60,
    right: 40,
    width: 24,
    height: 24,
    borderBottomRightRadius: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FF9800',
  },
  scanningIndicator: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  scanningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  scanningText: {
    color: G.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statusWrapper: {
    padding: 32,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: G.text,
    textAlign: 'center',
  },
  successText: {
    color: G.success,
  },
  errorText: {
    color: G.error,
  },
  statusMessage: {
    fontSize: 14,
    color: G.sub,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusSubtext: {
    fontSize: 12,
    color: G.sub,
    fontFamily: 'monospace',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  orderText: {
    fontSize: 12,
    color: '#2E7D32',
    fontFamily: 'monospace',
  },
  resetText: {
    fontSize: 12,
    color: G.sub,
    marginTop: 8,
  },
  actionWrapper: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: G.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: G.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  stopButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: G.border,
  },
  actionButtonText: {
    color: G.white,
    fontSize: 16,
    fontWeight: '600',
  },
  stopButtonText: {
    color: G.text,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: G.text,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 14,
    color: G.sub,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: G.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: G.border,
  },
  permissionButtonText: {
    color: G.white,
    fontSize: 16,
    fontWeight: '600',
  },
  retryButtonText: {
    color: G.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '500',
  },
});
