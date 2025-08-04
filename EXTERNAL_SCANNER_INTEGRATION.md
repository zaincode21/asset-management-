# External QR Code & Barcode Scanner Integration

## Overview

This implementation allows the Asset Management app to integrate with external QR code & Barcode scanner apps installed on the user's device. The app automatically opens an external scanner app, receives the scanned barcode data, and then searches for and displays the corresponding asset information. This provides a seamless asset auditing experience.

## How It Works

### 1. User Flow
1. User taps "Scan Barcode" in the dashboard
2. App automatically opens the external QR code & Barcode scanner app (if installed)
3. User scans the barcode in the external app
4. External app returns the scanned data to our app via deep link
5. Our app searches for the asset with the scanned barcode
6. Asset details are displayed in a comprehensive asset details screen

### 2. Deep Link Handling

The app listens for deep links with the following URL patterns:
- `assetmagementsystem://barcode=SCANNED_DATA`
- `assetmagementsystem://code=SCANNED_DATA`
- `assetmagementsystem://data=SCANNED_DATA`
- `assetmagementsystem://result=SCANNED_DATA`
- `assetmagementsystem://SCANNED_DATA` (direct path)

### 3. External Scanner Apps Supported

The app tries to open these scanner apps in order:
- `qrbarcode://scan`
- `barcode://scan`
- `qrscanner://scan`
- `scanner://`
- `barcode-scanner://`
- `qr-reader://`

If no scanner app is installed, it prompts the user to install one from the app store.

## Configuration

### App.json Changes

```json
{
  "expo": {
    "scheme": "assetmagementsystem",
    "ios": {
      "associatedDomains": [
        "applinks:assetmagementsystem.com"
      ]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "assetmagementsystem"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

### Required Packages

- `expo-linking`: For deep link handling
- `expo-router`: For navigation

## Usage

### For Users

1. **Install a QR Code & Barcode Scanner app** from your device's app store (if not already installed)
2. **Tap "Scan Barcode"** in the Asset Management app
3. **The scanner app will open automatically** (if installed)
4. **Scan the barcode** using the external scanner app
5. **Return to Asset Management** - the asset details will be automatically displayed
6. **View comprehensive asset information** including location, custodian, financial data, and audit status
7. **Create new assets** using the "Create Asset" button from dashboard or asset details screen

### For Developers

The main components are:

**`app/barcode-scanner.tsx`**:
- Handles deep link events
- Opens external scanner apps
- Processes returned barcode data
- Provides fallback manual entry option

**`app/asset-details.tsx`**:
- Displays comprehensive asset information
- Shows asset status, condition, location, and financial data
- Provides audit, edit, and create new asset functionality

**`app/create-asset.tsx`**:
- Comprehensive asset creation form
- Input validation and error handling
- Support for all asset fields including barcode
- Professional UI with organized sections

**`lib/core/services/asset_service.ts`**:
- Handles asset database operations
- Provides search functionality by barcode, asset code, tag number, etc.
- Manages asset creation and updates

**`lib/data/models/asset_model.ts`**:
- Defines the Asset data structure
- Includes barcode field for asset identification
- Provides serialization/deserialization methods

## Testing

### Manual Testing
1. Install a QR code scanner app on your device
2. Open the Asset Management app
3. Navigate to Dashboard → Scan Barcode
4. Tap "Scan Barcode" (scanner opens automatically)
5. Scan one of the test barcodes:
   - `123456789012` (Dell Laptop)
   - `987654321098` (HP Monitor)
   - `456789123456` (Canon Printer)
6. Verify the asset details are displayed correctly

### Simulating Deep Links
You can test deep link handling by manually entering URLs like:
```
assetmagementsystem://barcode=TEST123
assetmagementsystem://code=SAMPLE456
```

## Troubleshooting

### Common Issues

1. **No scanner app installed**
   - Solution: Install a QR code & Barcode scanner app from the app store

2. **Deep link not working**
   - Check that the app scheme is properly configured in app.json
   - Verify the external scanner app supports returning data via deep links

3. **Scanner app doesn't return data**
   - Some scanner apps may not support deep link returns
   - Use the manual entry option as fallback

### Fallback Options

- **Manual Entry**: Users can manually type barcode data
- **App Store Links**: Direct links to install scanner apps
- **Error Handling**: Graceful error messages and recovery options

## Security Considerations

- Deep links are validated and sanitized before processing
- URL encoding/decoding is handled safely
- Invalid or malicious URLs are filtered out
- User data is not stored unless explicitly requested

## Future Enhancements

- Support for more scanner app schemes
- Custom URL scheme for better integration
- Batch scanning capabilities
- Offline barcode validation
- Integration with asset database lookup 