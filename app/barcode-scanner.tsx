import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function BarcodeScannerScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [scannedData, setScannedData] = useState<string | null>(null);

    useEffect(() => {
        // Handle deep link when app returns from external scanner
        const handleDeepLink = (event: { url: string }) => {
            console.log('Deep link received:', event.url);
            
            // Parse the URL to extract scanned data
            const url = event.url;
            
            // Handle different URL formats that external scanners might use
            let barcodeData = '';
            
            // Try to extract data from various URL patterns
            if (url.includes('barcode=')) {
                barcodeData = url.split('barcode=')[1]?.split('&')[0] || '';
            } else if (url.includes('code=')) {
                barcodeData = url.split('code=')[1]?.split('&')[0] || '';
            } else if (url.includes('data=')) {
                barcodeData = url.split('data=')[1]?.split('&')[0] || '';
            } else if (url.includes('result=')) {
                barcodeData = url.split('result=')[1]?.split('&')[0] || '';
            } else {
                // Try to get the last path segment as the barcode
                const pathSegments = url.split('/');
                barcodeData = pathSegments[pathSegments.length - 1] || '';
            }
            
            // Decode URL encoding
            try {
                barcodeData = decodeURIComponent(barcodeData);
            } catch (e) {
                console.log('Failed to decode URL:', e);
            }
            
            if (barcodeData && barcodeData.trim().length > 0) {
                setScannedData(barcodeData);
                handleScannedBarcode(barcodeData);
            }
        };

        // Add event listener for deep links
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Auto-open scanner after a short delay
        const autoOpenTimer = setTimeout(() => {
            openExternalScanner();
        }, 1000);

        return () => {
            subscription?.remove();
            clearTimeout(autoOpenTimer);
        };
    }, []);

    const handleScannedBarcode = (data: string) => {
        // Navigate directly to asset details with the scanned barcode
        router.push(`/asset-details?barcode=${encodeURIComponent(data)}`);
    };

    const openExternalScanner = async () => {
        setIsLoading(true);
        
        try {
            // Common deep link schemes for QR/Barcode scanner apps
            const scannerApps = [
                // Most common QR & Barcode Scanner apps
                'qrbarcode://scan',
                'barcode://scan',
                'qrscanner://scan',
                'scanner://',
                'barcode-scanner://',
                'qr-reader://',
                'qr://scan',
                'barcode-scanner://scan',
                'qrscanner://',
                'barcode://',
                'qr://',
                'scanner://scan'
            ];

            // Try to open each scanner app directly without checking if it exists first
            for (const scheme of scannerApps) {
                try {
                    await Linking.openURL(scheme);
                    // If we reach here, the app opened successfully
                    console.log(`Successfully opened scanner with scheme: ${scheme}`);
                    return; // Exit the function successfully
                } catch (e) {
                    console.log(`Failed to open ${scheme}:`, e);
                    continue; // Try the next scheme
                }
            }
            
            // If no scanner app opened, show manual entry option
            Alert.alert(
                'Scanner Not Available',
                'No QR code scanner app found. You can enter the barcode manually.',
                [
                    {
                        text: 'Enter Manually',
                        onPress: handleManualInput,
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    }
                ]
            );
        } catch (error) {
            console.error('Error opening external scanner:', error);
            // Fallback to manual entry
            handleManualInput();
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualInput = () => {
        Alert.prompt(
            'Manual Barcode Entry',
            'Enter the barcode or asset code:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Search',
                    onPress: (code) => {
                        if (code && code.trim().length > 0) {
                            handleScannedBarcode(code.trim());
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="black" />
            
            {/* Header */}
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 px-6"
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <Text className="text-white text-lg font-semibold">Scan Barcode</Text>

                    <View className="w-10" />
                </View>
            </LinearGradient>

            {/* Main Content */}
            <View className="flex-1 items-center justify-center px-6">
                <View className="items-center">
                    {/* Scanner Icon */}
                    <View className="w-32 h-32 bg-blue-500/20 rounded-full items-center justify-center mb-8">
                        <Ionicons name="scan-outline" size={64} color="#3B82F6" />
                    </View>

                    {/* Title */}
                    <Text className="text-white text-2xl font-bold text-center mb-4">
                        External Scanner
                    </Text>

                    {/* Description */}
                    <Text className="text-gray-300 text-center text-lg mb-8 leading-6">
                        This will automatically open your QR code & Barcode scanner app to scan the barcode, then return the result to this app.
                    </Text>

                    {/* Instructions */}
                    <View className="bg-white/10 rounded-lg p-4 mb-8 w-full">
                        <Text className="text-white text-center text-sm mb-2 font-semibold">
                            How it works:
                        </Text>
                        <View className="space-y-2">
                            <View className="flex-row items-center">
                                <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3">
                                    <Text className="text-white text-xs font-bold">1</Text>
                                </View>
                                <Text className="text-gray-300 text-sm">Tap "Scan Barcode" to open scanner automatically</Text>
                            </View>
                            <View className="flex-row items-center">
                                <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3">
                                    <Text className="text-white text-xs font-bold">2</Text>
                                </View>
                                <Text className="text-gray-300 text-sm">Scan the barcode in the scanner app</Text>
                            </View>
                            <View className="flex-row items-center">
                                <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3">
                                    <Text className="text-white text-xs font-bold">3</Text>
                                </View>
                                <Text className="text-gray-300 text-sm">Return to this app with the result</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="w-full space-y-4">
                        <TouchableOpacity
                            className={`w-full py-4 rounded-xl ${isLoading ? 'bg-gray-600' : 'bg-blue-500'} items-center`}
                            onPress={openExternalScanner}
                            disabled={isLoading}
                        >
                            <Text className="text-white font-semibold text-lg">
                                {isLoading ? 'Opening Scanner...' : 'Scan Barcode'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full py-4 rounded-xl bg-gray-600 items-center mb-4"
                            onPress={handleManualInput}
                        >
                            <Text className="text-white font-semibold text-lg">Enter Code Manually</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full py-4 rounded-xl bg-purple-500 items-center"
                            onPress={() => router.push('/create-asset')}
                        >
                            <Text className="text-white font-semibold text-lg">Create New Asset</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Recent Scan Result */}
                    {scannedData && (
                        <View className="mt-8 w-full bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                            <Text className="text-green-400 text-center text-sm font-semibold mb-2">
                                Last Scanned:
                            </Text>
                            <Text className="text-white text-center text-lg font-mono">
                                {scannedData}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
} 