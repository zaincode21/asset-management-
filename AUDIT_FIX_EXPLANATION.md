# Audit System Fix Explanation

## Problem Description

The user reported that when auditing one asset, all assets were being audited instead of just the selected one. This was happening because the audit system was not properly linking audit findings to specific assets.

## Root Cause

The issue was in the `app/start-audit.tsx` file. When creating an audit finding, the code was using:

```typescript
asset_id: Date.now(), // Generate unique ID for new audit
```

This meant that every audit was creating a new random asset ID instead of linking to the actual asset that was being audited. This caused the audit system to treat each audit as a separate entity rather than an audit of a specific asset.

**Additional Issue Found**: The audit statistics calculation was also flawed because the database helper didn't properly handle `DISTINCT` queries, causing incorrect completion percentages to be displayed.

**Critical Issue Found**: The database helper's `paramsToRecord` method was not properly mapping the `asset_id` field from the INSERT statement, causing audit findings to be saved without the asset ID, which made them appear as if all assets were audited.

## Database Structure

The system uses a proper database structure with unique identifiers:

### Assets Table
- `id`: Primary key (auto-increment, internal use)
- `asset_id`: Unique asset identifier (must be unique across all assets)
- `asset_code`: Human-readable asset code (e.g., "LAPTOP-001")

### Audit Findings Table
- `asset_id`: Foreign key linking to the unique asset identifier
- `physical_asset_code`: The asset code found during audit

**Key Point**: Each asset has a unique `asset_id` that must never be duplicated. The audit system links to this unique identifier to ensure proper tracking.

## Solution Implemented

### 1. Asset Lookup by Code
Added functionality to find the actual asset by its asset code:

```typescript
const findAssetByCode = async (code: string) => {
    if (code.trim()) {
        try {
            const result = await assetService.searchByAssetCode(code.trim());
            if (result.success && result.assets && result.assets.length > 0) {
                setSelectedAsset(result.assets[0]);
                return result.assets[0];
            }
        } catch (error) {
            console.error('Error finding asset:', error);
        }
    }
    return null;
};
```

### 2. Proper Asset ID Linking
Modified the audit submission to use the actual asset ID:

```typescript
// Before (incorrect)
asset_id: Date.now(), // Generate unique ID for new audit

// After (correct)
asset_id: asset.asset_id, // Use the actual asset ID (unique identifier)
```

**Important Note**: The database has two ID fields:
- `id`: Primary key (auto-increment)
- `asset_id`: Unique asset identifier (must be unique across all assets)

The audit system should link to `asset_id` (the unique identifier), not `id` (the primary key).

### 3. Asset Validation
Added validation to ensure the asset exists before allowing audit:

```typescript
// Find the actual asset by code
const asset = await findAssetByCode(assetCode.trim());
if (!asset) {
    // Allow auditing as new discovery
    Alert.alert(
        'Asset Not Found',
        `Asset with code "${assetCode.trim()}" not found in the system. You can still audit it as a new discovery.`,
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue as New Discovery', onPress: () => submitAuditWithNewAsset() }
        ]
    );
    return;
}
```

### 4. New Discovery Support
Added support for auditing assets that are not in the system (new discoveries):

```typescript
const submitAuditWithNewAsset = async () => {
    // Handle new discovery audits with asset_id: null
    // and has_discrepancies: true, discrepancy_types: 'UNEXPECTED_ASSET'
};
```

### 5. Enhanced UI Feedback
Added visual indicators to show:
- ✅ Asset found in system
- ⚠️ Asset not found (can audit as new discovery)
- ⚠️ Asset already audited

### 6. Fixed Audit Statistics Calculation
Fixed the audit statistics calculation to properly handle unique audits:

```typescript
// Before (incorrect - database helper doesn't handle DISTINCT properly)
const completedResult = await this.databaseHelper.query(
  `SELECT COUNT(DISTINCT physical_asset_code) as count FROM ${DatabaseConstants.auditFindingTable}`
);

// After (correct - manual calculation of unique audits)
const allAuditFindingsResult = await this.databaseHelper.query(
  `SELECT * FROM ${DatabaseConstants.auditFindingTable}`
);
// Then manually calculate unique audits using Set
```

### 7. Fixed Database Helper Field Mapping
Fixed the critical issue where `asset_id` was not being saved in audit findings:

```typescript
// Before (incorrect - asset_id was missing)
record.offline_record_id = params[0];
record.audit_session_id = params[1];
record.audited_by = params[2]; // asset_id was skipped!

// After (correct - all fields properly mapped)
record.offline_record_id = params[0];
record.audit_session_id = params[1];
record.asset_id = params[2]; // Now properly saved!
record.audited_by = params[3];
// ... all other fields mapped correctly
```

## Key Changes Made

1. **app/start-audit.tsx**:
   - Added `AssetService` import and instance
   - Added `selectedAsset` state
   - Added `findAssetByCode` function
   - Modified `checkAssetAuditStatus` to find and display asset info
   - Updated `submitAudit` to use real asset ID
   - Added `submitAuditWithNewAsset` for new discoveries
   - Enhanced UI with asset status indicators

2. **Audit Logic**:
   - Now properly links audit findings to specific assets using unique `asset_id`
   - Supports new discovery audits for assets not in system
   - Prevents duplicate audits of the same asset by checking unique identifiers
   - Provides clear feedback about asset status
   - Uses proper database relationships between assets and audit findings

3. **Audit Statistics**:
   - Fixed calculation of completed audits to properly count unique assets
   - Added debugging information to track audit progress
   - Fixed issue where database helper didn't handle DISTINCT queries properly

4. **Database Helper**:
   - Fixed critical bug in `paramsToRecord` method where `asset_id` was not being mapped
   - Now properly maps all fields from INSERT statements to database records
   - Ensures audit findings are saved with correct asset IDs

## Result

Now when you audit an asset:
1. The system finds the actual asset by its code
2. Uses the real asset ID in the audit finding
3. Only that specific asset is marked as audited
4. Other assets remain unaffected
5. New discoveries are handled separately
6. Audit statistics correctly show the actual completion percentage

The audit system now correctly tracks which specific assets have been audited, preventing the issue where auditing one asset affected all assets. The dashboard will now show accurate audit progress instead of incorrectly indicating that all assets are audited.

## Testing Instructions

1. **Clear existing audits**: Use the "Clear Audits" button to remove any existing audit findings
2. **Audit one asset**: Go to "All Assets" and select one asset to audit
3. **Verify**: Check the dashboard - it should show 1 completed audit out of 100 total
4. **Audit another asset**: Select a different asset and audit it
5. **Verify**: Dashboard should now show 2 completed audits out of 100 total
6. **No duplicates**: Each asset can only be audited once

The system now properly tracks individual assets one by one without duplicates.
