# Contracts: Firebase Callable Functions

Since this is a Firebase backend, the primary interface contract between mobile/web clients and the server will be Firebase Callable Functions (RPC over HTTPS). The clients should use Firebase Client SDKs to invoke these.

## `syncHabitLogs` (Callable)
Syncs an array of logs from client to server safely.

**Request Body (Object)**:
```json
{
  "logs": [
    {
      "habitId": "string",
      "dateString": "YYYY-MM-DD",
      "completed": true,
      "timestamp": "ISO-8601 string"
    }
  ]
}
```

**Response (Object)**:
```json
{
  "success": true,
  "processedCount": 1
}
```

## `deleteAccountAction` (Callable)
Triggers the full GDPR cascade hard-delete and Auth removal.

**Request Body**: `{}` (Empty, identifies user via implicit Auth token context).

**Response**:
```json
{
  "success": true,
  "message": "Account scheduled for deletion or instantly deleted."
}
```



## `setupTOTP` (Callable)
Generates the initial TOTP secret and QR code URI for onboarding a new user device.

**Request Body**: `{}` (Empty, identifies user via implicit Auth token context).

**Response (Object)**:
```json
{
  "success": true,
  "secret": "string (base32)",
  "qrUri": "otpauth://..."
}
```

## `verifyTOTP` (Callable)
Verifies a generated TOTP payload during login or setup.

**Request Body (Object)**:
```json
{
  "token": "string (6 digits)"
}
```

**Response (Object)**:
```json
{
  "success": true,
  "valid": true
}
```
